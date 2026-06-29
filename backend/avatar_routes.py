"""
Avatar Studio backend routes.

Endpoints:
  GET  /api/avatar/presets              → list preset avatars from Supabase
  GET  /api/avatar/quota                → current month swap quota for the user
  POST /api/avatar/face-swap            → multipart [user_face, preset_id] → Gemini Nano-Banana face swap
  POST /api/avatar/set-profile          → set selected avatar as profile.avatar_url
  POST /api/avatar/admin/seed-presets   → admin: generate 18 preset 3D realistic avatars (one-time)

Uses Gemini 2.5 Flash Image (Nano Banana) via emergentintegrations + EMERGENT_LLM_KEY.
Falls back to GEMINI_API_KEY if EMERGENT_LLM_KEY is unset.
Stores generated images in Supabase Storage bucket "avatars".
"""
from __future__ import annotations

import base64
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx
import jwt
from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel

logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3.1-flash-image-preview"

BUCKET = "avatars"

SERVICE_HEADERS = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# Plan → monthly custom-avatar swap quota
PLAN_QUOTA: Dict[str, int] = {
    "free": 0,
    "creator": 2,
    "pro": 5,
    "business": 20,
}

router = APIRouter(prefix="/api/avatar", tags=["avatar"])


# ─────────────────────────── Auth helper ───────────────────────────────────
def _get_user(authorization: Optional[str]) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.split(" ", 1)[1].strip()
    if not SUPABASE_JWT_SECRET:
        # Fallback: decode without verification — only use service-role calls afterwards
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")
    try:
        return jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ─────────────────────────── Supabase helpers ──────────────────────────────
async def _sb_get(path: str, params: Optional[dict] = None) -> Any:
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(f"{SUPABASE_URL}/rest/v1/{path}", headers=SERVICE_HEADERS, params=params or {})
        if r.status_code >= 400:
            logger.error("Supabase GET %s failed (%s): %s", path, r.status_code, r.text)
            return None
        return r.json()


async def _sb_post(path: str, body: Any, prefer: str = "return=representation") -> Any:
    headers = dict(SERVICE_HEADERS)
    headers["Prefer"] = prefer
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(f"{SUPABASE_URL}/rest/v1/{path}", headers=headers, json=body)
        if r.status_code >= 400:
            logger.error("Supabase POST %s failed (%s): %s", path, r.status_code, r.text)
            raise HTTPException(status_code=500, detail=f"Supabase write failed: {r.text[:200]}")
        try:
            return r.json()
        except Exception:
            return None


async def _sb_patch(path: str, params: dict, body: dict) -> Any:
    headers = dict(SERVICE_HEADERS)
    headers["Prefer"] = "return=representation"
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.patch(f"{SUPABASE_URL}/rest/v1/{path}", headers=headers, params=params, json=body)
        if r.status_code >= 400:
            logger.error("Supabase PATCH %s failed (%s): %s", path, r.status_code, r.text)
            raise HTTPException(status_code=500, detail=f"Supabase update failed: {r.text[:200]}")
        try:
            return r.json()
        except Exception:
            return None


async def _sb_upload_image(path_in_bucket: str, image_bytes: bytes, content_type: str = "image/png") -> str:
    """Upload bytes to Supabase Storage bucket and return public URL."""
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{path_in_bucket}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, content=image_bytes)
        if r.status_code >= 400:
            logger.error("Supabase storage upload failed (%s): %s", r.status_code, r.text)
            raise HTTPException(status_code=500, detail=f"Storage upload failed: {r.text[:200]}")
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{path_in_bucket}"


async def _get_user_plan_key(user_id: str) -> str:
    """Resolve the user's effective platform plan_key (free / creator / pro / business)."""
    rows = await _sb_get(
        "user_platform_subscriptions",
        {"select": "plan_key,expires_at", "user_id": f"eq.{user_id}", "status": "eq.active", "limit": 1},
    )
    if not rows:
        return "free"
    sub = rows[0]
    expires = sub.get("expires_at")
    if expires:
        try:
            exp_dt = datetime.fromisoformat(expires.replace("Z", "+00:00"))
            if exp_dt < datetime.now(timezone.utc):
                return "free"
        except Exception:
            pass
    return (sub.get("plan_key") or "free").lower()


async def _get_swap_count_this_month(user_id: str) -> int:
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    rows = await _sb_get(
        "user_custom_avatars",
        {"select": "id", "user_id": f"eq.{user_id}", "created_at": f"gte.{month_start}"},
    )
    return len(rows or [])


# ─────────────────────────── Gemini helper ─────────────────────────────────
async def _gemini_generate(prompt: str, reference_images_b64: Optional[List[str]] = None) -> bytes:
    """Generate or edit an image with Gemini Nano Banana. Returns raw bytes."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

    api_key = EMERGENT_LLM_KEY or GEMINI_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="No LLM API key configured")

    session_id = f"avatar-{uuid.uuid4()}"
    chat = LlmChat(api_key=api_key, session_id=session_id, system_message="You are an expert photorealistic avatar generator.")
    chat.with_model("gemini", GEMINI_MODEL).with_params(modalities=["image", "text"])

    file_contents = None
    if reference_images_b64:
        file_contents = [ImageContent(b64) for b64 in reference_images_b64]

    msg = UserMessage(text=prompt, file_contents=file_contents) if file_contents else UserMessage(text=prompt)

    try:
        text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:
        logger.exception("Gemini call failed")
        raise HTTPException(status_code=502, detail=f"Image generation failed: {str(e)[:200]}")

    if not images:
        logger.error("Gemini returned no images. Text response: %s", (text or "")[:200])
        raise HTTPException(status_code=502, detail="Model returned no image")

    return base64.b64decode(images[0]["data"])


# ─────────────────────────── Routes ────────────────────────────────────────
@router.get("/presets")
async def list_presets(category: Optional[str] = None, gender: Optional[str] = None):
    params = {"select": "id,image_url,label,category,gender,style,sort_order", "order": "sort_order.asc"}
    if category and category != "all":
        params["category"] = f"eq.{category}"
    if gender and gender != "all":
        params["gender"] = f"eq.{gender}"
    rows = await _sb_get("avatar_presets", params) or []
    return {"presets": rows}


@router.get("/quota")
async def get_quota(authorization: Optional[str] = Header(None)):
    user = _get_user(authorization)
    user_id = user.get("sub")
    plan = await _get_user_plan_key(user_id)
    used = await _get_swap_count_this_month(user_id)
    limit = PLAN_QUOTA.get(plan, 0)
    return {
        "plan": plan,
        "monthly_limit": limit,
        "used_this_month": used,
        "remaining": max(0, limit - used),
        "can_customize": plan != "free",
        "can_upload": plan != "free",
    }


@router.post("/face-swap")
async def face_swap(
    authorization: Optional[str] = Header(None),
    user_face: UploadFile = File(...),
    preset_id: Optional[str] = Form(None),
    style_image_url: Optional[str] = Form(None),
):
    user = _get_user(authorization)
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    plan = await _get_user_plan_key(user_id)
    limit = PLAN_QUOTA.get(plan, 0)
    if limit == 0:
        raise HTTPException(status_code=403, detail="Custom avatar requires Creator plan or higher")

    used = await _get_swap_count_this_month(user_id)
    if used >= limit:
        raise HTTPException(status_code=429, detail=f"Monthly quota reached ({used}/{limit}). Upgrade plan for more.")

    # Resolve style image
    style_url = style_image_url
    if preset_id and not style_url:
        rows = await _sb_get("avatar_presets", {"select": "image_url", "id": f"eq.{preset_id}", "limit": 1})
        if not rows:
            raise HTTPException(status_code=404, detail="Preset not found")
        style_url = rows[0]["image_url"]
    if not style_url:
        raise HTTPException(status_code=400, detail="Either preset_id or style_image_url is required")

    # Load both images as base64
    face_bytes = await user_face.read()
    if len(face_bytes) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 12MB)")
    face_b64 = base64.b64encode(face_bytes).decode()

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(style_url)
        if r.status_code >= 400:
            raise HTTPException(status_code=500, detail="Failed to fetch style image")
        style_b64 = base64.b64encode(r.content).decode()

    prompt = (
        "Create a single ultra-photorealistic 3D portrait. "
        "Use the FACE (head, hair, ethnicity, age, skin tone, facial features) from the FIRST image. "
        "Keep the BODY POSE, CLOTHING, BACKGROUND and overall style from the SECOND image. "
        "The output must be a high-quality head-and-shoulders portrait, sharp, well-lit studio lighting, "
        "natural skin texture, photo-real, no cartoon. Centered subject, neutral background blur. "
        "Return only the generated image."
    )

    img_bytes = await _gemini_generate(prompt, [face_b64, style_b64])

    filename = f"custom/{user_id}/{uuid.uuid4().hex}.png"
    public_url = await _sb_upload_image(filename, img_bytes, "image/png")

    record = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "image_url": public_url,
        "source_preset_id": preset_id,
        "type": "face_swap",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _sb_post("user_custom_avatars", record)

    new_used = used + 1
    return {
        "success": True,
        "image_url": public_url,
        "custom_avatar_id": record["id"],
        "usage": {"used_this_month": new_used, "monthly_limit": limit, "remaining": max(0, limit - new_used)},
    }


class SetProfileBody(BaseModel):
    avatar_url: str


@router.post("/set-profile")
async def set_profile_avatar(body: SetProfileBody, authorization: Optional[str] = Header(None)):
    user = _get_user(authorization)
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    update = {
        "avatar_url": body.avatar_url,
        "profile_pic_url": body.avatar_url,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await _sb_patch("profiles", {"id": f"eq.{user_id}"}, update)
    return {"success": True, "avatar_url": body.avatar_url}


# ─────────────────────────── Admin: seed presets ───────────────────────────
PRESET_DEFINITIONS = [
    # (label, gender, category, style, prompt)
    ("Aiden",   "male",   "professional", "suit-blue",  "Photorealistic head and shoulders 3D portrait of a confident young South-Asian man, mid-20s, short dark hair, light stubble, wearing a navy-blue business suit with white shirt and dark tie, neutral light-grey studio background, soft cinematic lighting, sharp focus, natural skin texture, ultra-detailed, 3D render quality."),
    ("Olivia",  "female", "professional", "blouse-white", "Photorealistic head and shoulders 3D portrait of a poised young Caucasian woman, late-20s, sleek brown hair, subtle makeup, wearing a crisp white blouse, neutral light-grey studio background, soft cinematic lighting, sharp focus, natural skin texture, ultra-detailed, 3D render quality."),
    ("Ravi",    "male",   "professional", "glasses-suit", "Photorealistic head and shoulders 3D portrait of an East-Asian man early-30s, dark hair, modern thin-rim eyeglasses, wearing a charcoal suit with light blue shirt, neutral grey studio background, cinematic lighting, sharp focus, natural skin texture, ultra-detailed 3D render quality."),
    ("Sophia",  "female", "casual",       "turtleneck-black", "Photorealistic head and shoulders 3D portrait of a young woman with blonde wavy hair, wearing a black turtleneck sweater, neutral light grey studio background, soft cinematic lighting, photo-real natural skin, ultra-detailed 3D render."),
    ("Karan",   "male",   "professional", "suit-navy",  "Photorealistic head and shoulders 3D portrait of a Middle-Eastern man in late-20s, neat beard, dark wavy hair, wearing a navy blue suit with white shirt and dark tie, neutral studio background, sharp focus, cinematic studio lighting, photo-real."),
    ("Mei",     "female", "casual",       "shirt-white", "Photorealistic head and shoulders 3D portrait of an East-Asian woman in mid-20s, long straight black hair, gentle smile, wearing a casual white button-up shirt, neutral grey studio background, cinematic soft lighting, photo-real natural skin, 3D quality."),
    ("Elena",   "female", "casual",       "turtleneck-grey", "Photorealistic head and shoulders 3D portrait of a Latina woman in late-20s, dark wavy hair, subtle smile, wearing a light grey turtleneck sweater, neutral grey studio background, photo-real natural skin, cinematic studio lighting, 3D quality."),
    ("Marcus",  "male",   "casual",       "tshirt-white", "Photorealistic head and shoulders 3D portrait of an African-American man in mid-20s, short black hair, light smile, wearing a simple white t-shirt, neutral grey studio background, cinematic lighting, photo-real skin, 3D quality."),
    ("Liam",    "male",   "casual",       "shirt-grey", "Photorealistic head and shoulders 3D portrait of a Caucasian man in mid-20s, dark hair, light stubble, wearing a casual grey button-up shirt, neutral grey studio background, cinematic soft lighting, photo-real natural skin, 3D quality."),
    ("Arjun",   "male",   "professional", "shirt-blue", "Photorealistic head and shoulders 3D portrait of a South-Asian man in late-20s, short black hair, clean shaven, wearing a light blue dress shirt, neutral studio background, soft cinematic lighting, photo-real, 3D quality."),
    ("Priya",   "female", "professional", "blouse-cream", "Photorealistic head and shoulders 3D portrait of a South-Asian woman in late-20s, long dark hair tied back, wearing a cream silk blouse, neutral studio background, soft cinematic lighting, photo-real skin, 3D quality."),
    ("Daniel",  "male",   "professional", "suit-grey",  "Photorealistic head and shoulders 3D portrait of a mature Caucasian man in early-50s, salt-and-pepper hair, wearing a charcoal grey suit with white shirt and dark tie, neutral studio background, cinematic lighting, photo-real."),
    ("Sara",    "female", "casual",       "sweater-beige", "Photorealistic head and shoulders 3D portrait of a Caucasian woman in mid-20s, light brown hair in soft waves, wearing a beige knit sweater, neutral studio background, cinematic soft lighting, photo-real natural skin, 3D quality."),
    ("Noah",    "male",   "casual",       "tshirt-black", "Photorealistic head and shoulders 3D portrait of a Latino man in mid-20s, short curly black hair, light smile, wearing a fitted black t-shirt, neutral grey studio background, photo-real, 3D quality."),
    ("Aisha",   "female", "professional", "blazer-black", "Photorealistic head and shoulders 3D portrait of a Black woman in late-20s, natural curly hair, wearing a tailored black blazer over a white top, neutral studio background, photo-real, 3D quality, cinematic lighting."),
    ("Ethan",   "male",   "professional", "suit-charcoal", "Photorealistic head and shoulders 3D portrait of a Caucasian man in early-30s, light brown short hair, clean shaven, wearing a charcoal suit with light blue shirt, neutral studio background, cinematic lighting, photo-real."),
    ("Lara",    "female", "professional", "blouse-navy", "Photorealistic head and shoulders 3D portrait of a Middle-Eastern woman in late-20s, dark wavy hair, subtle makeup, wearing a navy blue silk blouse, neutral studio background, soft cinematic lighting, photo-real."),
    ("Kai",     "male",   "casual",       "hoodie-grey", "Photorealistic head and shoulders 3D portrait of a mixed-race young man in early-20s, short tousled hair, wearing a casual grey hoodie, neutral studio background, soft cinematic lighting, photo-real natural skin, 3D quality."),
]


@router.post("/admin/seed-presets")
async def seed_presets(x_admin_key: Optional[str] = Header(None)):
    """One-time admin endpoint to generate the 18 preset 3D avatars.
    Header: X-Admin-Key must match SUPABASE_SERVICE_ROLE_KEY (server-side only)."""
    if not x_admin_key or x_admin_key != SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Skip already-seeded entries
    existing = await _sb_get("avatar_presets", {"select": "label"}) or []
    existing_labels = {r.get("label") for r in existing}

    results = []
    errors = []
    for idx, (label, gender, category, style, prompt) in enumerate(PRESET_DEFINITIONS):
        if label in existing_labels:
            results.append({"label": label, "skipped": True})
            continue
        try:
            img_bytes = await _gemini_generate(prompt)
            filename = f"presets/{label.lower()}-{uuid.uuid4().hex[:8]}.png"
            public_url = await _sb_upload_image(filename, img_bytes, "image/png")
            row = {
                "id": str(uuid.uuid4()),
                "label": label,
                "gender": gender,
                "category": category,
                "style": style,
                "image_url": public_url,
                "sort_order": idx,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            await _sb_post("avatar_presets", row)
            results.append({"label": label, "url": public_url})
            logger.info("Seeded preset %s → %s", label, public_url)
        except Exception as e:
            logger.exception("Failed to seed preset %s", label)
            errors.append({"label": label, "error": str(e)[:200]})

    return {"created": len(results), "errors": errors, "results": results}
