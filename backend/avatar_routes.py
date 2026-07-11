"""
Avatar Studio backend routes — Storage-only version (no DB tables required).

Storage layout (bucket=avatars):
  presets/index.json                  → [{id,label,gender,category,style,image_url,sort_order}, ...]
  presets/<slug>-<hash>.png            → each preset image
  custom/<user_id>/index.json          → {items:[{id,image_url,source_preset_id,created_at,month}, ...]}
  custom/<user_id>/<hash>.png          → each user-generated / uploaded avatar
  uploads/<user_id>/<hash>.<ext>       → raw user uploads (before swap)

Endpoints:
  GET  /api/avatar/presets              → list presets (from presets/index.json)
  GET  /api/avatar/quota                → current month swap quota for the caller
  GET  /api/avatar/history              → caller's custom avatars history
  POST /api/avatar/face-swap            → multipart [user_face, preset_id] → Gemini Nano-Banana swap
  POST /api/avatar/set-profile          → set selected URL as profile.avatar_url + profile_pic_url
  POST /api/avatar/admin/seed-presets   → admin: generate 18 preset 3D realistic avatars
"""
from __future__ import annotations

import asyncio
import base64
import json
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
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", SUPABASE_SERVICE_ROLE_KEY)
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


# ─── Auth helper ────────────────────────────────────────────────────────────
async def _get_user_from_token(authorization: Optional[str]) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.split(" ", 1)[1].strip()
    async with httpx.AsyncClient(timeout=10) as cx:
        r = await cx.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {token}"},
        )
    if r.status_code != 200:
        # Fallback: decode unverified for user_id
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            return {"id": payload.get("sub")}
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    return r.json()


# ─── Supabase Storage helpers ───────────────────────────────────────────────
async def _storage_upload(path: str, data: bytes, content_type: str = "image/png") -> str:
    """Upload bytes to Supabase Storage bucket and return the public URL."""
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{path}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
        "Cache-Control": "public, max-age=31536000",
    }
    async with httpx.AsyncClient(timeout=60) as cx:
        r = await cx.post(url, headers=headers, content=data)
        if r.status_code >= 400:
            logger.error("Storage upload %s failed (%s): %s", path, r.status_code, r.text[:200])
            raise HTTPException(status_code=500, detail=f"Storage upload failed: {r.text[:200]}")
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{path}"


async def _storage_get_json(path: str) -> Optional[Any]:
    """Fetch a JSON file from the public bucket. Returns None if missing."""
    url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{path}"
    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.get(url)
    if r.status_code == 200:
        try:
            return r.json()
        except Exception:
            return None
    return None


async def _storage_put_json(path: str, obj: Any) -> str:
    return await _storage_upload(path, json.dumps(obj, ensure_ascii=False).encode(), "application/json")


# ─── Plan lookup (still uses existing profiles / user_platform_subscriptions) ─
async def _get_user_plan_key(user_id: str) -> str:
    async with httpx.AsyncClient(timeout=10) as cx:
        r = await cx.get(
            f"{SUPABASE_URL}/rest/v1/user_platform_subscriptions",
            headers=SERVICE_HEADERS,
            params={
                "select": "plan_key,expires_at,status",
                "user_id": f"eq.{user_id}",
                "status": "eq.active",
                "limit": 1,
            },
        )
    if r.status_code != 200:
        return "free"
    rows = r.json() or []
    if not rows:
        return "free"
    sub = rows[0]
    expires = sub.get("expires_at")
    if expires:
        try:
            exp_dt = datetime.fromisoformat(str(expires).replace("Z", "+00:00"))
            if exp_dt < datetime.now(timezone.utc):
                return "free"
        except Exception:
            pass
    return (sub.get("plan_key") or "free").lower()


async def _get_custom_index(user_id: str) -> Dict[str, Any]:
    idx = await _storage_get_json(f"custom/{user_id}/index.json")
    if not idx or not isinstance(idx, dict):
        idx = {"items": []}
    if "items" not in idx or not isinstance(idx["items"], list):
        idx["items"] = []
    return idx


async def _count_swaps_this_month(user_id: str) -> int:
    idx = await _get_custom_index(user_id)
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    return sum(1 for it in idx.get("items", []) if it.get("month") == month and it.get("type") == "face_swap")


# ─── Gemini helper ─────────────────────────────────────────────────────────
async def _gemini_generate(prompt: str, reference_images_b64: Optional[List[str]] = None) -> bytes:
    """Generate or edit an image with Gemini Nano Banana. Returns PNG bytes."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

    api_key = EMERGENT_LLM_KEY or GEMINI_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="No LLM API key configured")

    session_id = f"avatar-{uuid.uuid4().hex[:12]}"
    chat = LlmChat(api_key=api_key, session_id=session_id, system_message="You are an expert photorealistic 3D avatar generator.")
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
        logger.error("Gemini returned no images. Text: %s", (text or "")[:120])
        raise HTTPException(status_code=502, detail="Model returned no image")

    return base64.b64decode(images[0]["data"])


# ─── Routes ────────────────────────────────────────────────────────────────
@router.get("/presets")
async def list_presets(category: Optional[str] = None, gender: Optional[str] = None):
    """Return preset avatars filtered by category / gender."""
    presets = await _storage_get_json("presets/index.json") or []
    if not isinstance(presets, list):
        presets = []
    if category and category != "all":
        presets = [p for p in presets if p.get("category") == category]
    if gender and gender != "all":
        presets = [p for p in presets if p.get("gender") == gender]
    presets.sort(key=lambda p: p.get("sort_order", 0))
    return {"presets": presets}


@router.get("/quota")
async def get_quota(authorization: Optional[str] = Header(None)):
    user = await _get_user_from_token(authorization)
    user_id = user.get("id")
    plan = await _get_user_plan_key(user_id)
    used = await _count_swaps_this_month(user_id)
    limit = PLAN_QUOTA.get(plan, 0)
    return {
        "plan": plan,
        "monthly_limit": limit,
        "used_this_month": used,
        "remaining": max(0, limit - used),
        "can_customize": plan != "free",
        "can_upload": plan != "free",
    }


@router.get("/history")
async def get_history(authorization: Optional[str] = Header(None), limit: int = 20):
    user = await _get_user_from_token(authorization)
    user_id = user.get("id")
    idx = await _get_custom_index(user_id)
    items = sorted(idx.get("items", []), key=lambda it: it.get("created_at", ""), reverse=True)[:limit]
    return {"items": items}


@router.post("/face-swap")
async def face_swap(
    authorization: Optional[str] = Header(None),
    user_face: UploadFile = File(...),
    preset_id: Optional[str] = Form(None),
    style_image_url: Optional[str] = Form(None),
):
    user = await _get_user_from_token(authorization)
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    plan = await _get_user_plan_key(user_id)
    limit = PLAN_QUOTA.get(plan, 0)
    if limit == 0:
        raise HTTPException(status_code=403, detail="Custom avatar requires Creator plan or higher")

    used = await _count_swaps_this_month(user_id)
    if used >= limit:
        raise HTTPException(status_code=429, detail=f"Monthly quota reached ({used}/{limit}). Upgrade plan for more.")

    # Resolve style image URL
    style_url = style_image_url
    if preset_id and not style_url:
        presets = await _storage_get_json("presets/index.json") or []
        preset = next((p for p in presets if p.get("id") == preset_id), None)
        if not preset:
            raise HTTPException(status_code=404, detail="Preset not found")
        style_url = preset.get("image_url")
    if not style_url:
        raise HTTPException(status_code=400, detail="Either preset_id or style_image_url is required")

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
    public_url = await _storage_upload(filename, img_bytes, "image/png")

    # Append to user's index
    idx = await _get_custom_index(user_id)
    item = {
        "id": str(uuid.uuid4()),
        "image_url": public_url,
        "source_preset_id": preset_id,
        "type": "face_swap",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "month": datetime.now(timezone.utc).strftime("%Y-%m"),
    }
    idx["items"].append(item)
    await _storage_put_json(f"custom/{user_id}/index.json", idx)

    new_used = used + 1
    return {
        "success": True,
        "image_url": public_url,
        "custom_avatar_id": item["id"],
        "usage": {"used_this_month": new_used, "monthly_limit": limit, "remaining": max(0, limit - new_used)},
    }


class SetProfileBody(BaseModel):
    avatar_url: str


@router.post("/set-profile")
async def set_profile_avatar(body: SetProfileBody, authorization: Optional[str] = Header(None)):
    user = await _get_user_from_token(authorization)
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    update = {
        "avatar_url": body.avatar_url,
        "profile_pic_url": body.avatar_url,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.patch(
            f"{SUPABASE_URL}/rest/v1/profiles",
            headers={**SERVICE_HEADERS, "Prefer": "return=representation"},
            params={"id": f"eq.{user_id}"},
            json=update,
        )
    if r.status_code >= 400:
        logger.error("profiles PATCH failed (%s): %s", r.status_code, r.text[:200])
        raise HTTPException(status_code=500, detail=f"Failed to save: {r.text[:200]}")

    return {"success": True, "avatar_url": body.avatar_url}


# ─── Admin: seed presets ───────────────────────────────────────────────────
PRESET_DEFINITIONS = [
    ("Aiden",   "male",   "professional", "suit-blue",  "Photorealistic head and shoulders 3D portrait of a confident young South-Asian man, mid-20s, short dark hair, light stubble, wearing a navy-blue business suit with white shirt and dark tie, neutral light-grey studio background, soft cinematic lighting, sharp focus, natural skin texture, ultra-detailed, 3D render quality. Centered subject."),
    ("Olivia",  "female", "professional", "blouse-white", "Photorealistic head and shoulders 3D portrait of a poised young Caucasian woman, late-20s, sleek brown hair, subtle makeup, wearing a crisp white blouse, neutral light-grey studio background, soft cinematic lighting, sharp focus, natural skin texture, ultra-detailed, 3D render quality. Centered subject."),
    ("Ravi",    "male",   "professional", "glasses-suit", "Photorealistic head and shoulders 3D portrait of an East-Asian man early-30s, dark hair, modern thin-rim eyeglasses, wearing a charcoal suit with light blue shirt, neutral grey studio background, cinematic lighting, sharp focus, natural skin texture, ultra-detailed 3D render quality. Centered."),
    ("Sophia",  "female", "casual",       "turtleneck-black", "Photorealistic head and shoulders 3D portrait of a young woman with blonde wavy hair, wearing a black turtleneck sweater, neutral light grey studio background, soft cinematic lighting, photo-real natural skin, ultra-detailed 3D render. Centered subject."),
    ("Karan",   "male",   "professional", "suit-navy",  "Photorealistic head and shoulders 3D portrait of a Middle-Eastern man in late-20s, neat beard, dark wavy hair, wearing a navy blue suit with white shirt and dark tie, neutral studio background, sharp focus, cinematic studio lighting, photo-real. Centered."),
    ("Mei",     "female", "casual",       "shirt-white", "Photorealistic head and shoulders 3D portrait of an East-Asian woman in mid-20s, long straight black hair, gentle smile, wearing a casual white button-up shirt, neutral grey studio background, cinematic soft lighting, photo-real natural skin, 3D quality. Centered."),
    ("Elena",   "female", "casual",       "turtleneck-grey", "Photorealistic head and shoulders 3D portrait of a Latina woman in late-20s, dark wavy hair, subtle smile, wearing a light grey turtleneck sweater, neutral grey studio background, photo-real natural skin, cinematic studio lighting, 3D quality. Centered."),
    ("Marcus",  "male",   "casual",       "tshirt-white", "Photorealistic head and shoulders 3D portrait of an African-American man in mid-20s, short black hair, light smile, wearing a simple white t-shirt, neutral grey studio background, cinematic lighting, photo-real skin, 3D quality. Centered."),
    ("Liam",    "male",   "casual",       "shirt-grey", "Photorealistic head and shoulders 3D portrait of a Caucasian man in mid-20s, dark hair, light stubble, wearing a casual grey button-up shirt, neutral grey studio background, cinematic soft lighting, photo-real natural skin, 3D quality. Centered."),
    ("Arjun",   "male",   "professional", "shirt-blue", "Photorealistic head and shoulders 3D portrait of a South-Asian man in late-20s, short black hair, clean shaven, wearing a light blue dress shirt, neutral studio background, soft cinematic lighting, photo-real, 3D quality. Centered."),
    ("Priya",   "female", "professional", "blouse-cream", "Photorealistic head and shoulders 3D portrait of a South-Asian woman in late-20s, long dark hair tied back, wearing a cream silk blouse, neutral studio background, soft cinematic lighting, photo-real skin, 3D quality. Centered."),
    ("Daniel",  "male",   "professional", "suit-grey",  "Photorealistic head and shoulders 3D portrait of a mature Caucasian man in early-50s, salt-and-pepper hair, wearing a charcoal grey suit with white shirt and dark tie, neutral studio background, cinematic lighting, photo-real. Centered."),
    ("Sara",    "female", "casual",       "sweater-beige", "Photorealistic head and shoulders 3D portrait of a Caucasian woman in mid-20s, light brown hair in soft waves, wearing a beige knit sweater, neutral studio background, cinematic soft lighting, photo-real natural skin, 3D quality. Centered."),
    ("Noah",    "male",   "casual",       "tshirt-black", "Photorealistic head and shoulders 3D portrait of a Latino man in mid-20s, short curly black hair, light smile, wearing a fitted black t-shirt, neutral grey studio background, photo-real, 3D quality. Centered."),
    ("Aisha",   "female", "professional", "blazer-black", "Photorealistic head and shoulders 3D portrait of a Black woman in late-20s, natural curly hair, wearing a tailored black blazer over a white top, neutral studio background, photo-real, 3D quality, cinematic lighting. Centered."),
    ("Ethan",   "male",   "professional", "suit-charcoal", "Photorealistic head and shoulders 3D portrait of a Caucasian man in early-30s, light brown short hair, clean shaven, wearing a charcoal suit with light blue shirt, neutral studio background, cinematic lighting, photo-real. Centered."),
    ("Lara",    "female", "professional", "blouse-navy", "Photorealistic head and shoulders 3D portrait of a Middle-Eastern woman in late-20s, dark wavy hair, subtle makeup, wearing a navy blue silk blouse, neutral studio background, soft cinematic lighting, photo-real. Centered."),
    ("Kai",     "male",   "casual",       "hoodie-grey", "Photorealistic head and shoulders 3D portrait of a mixed-race young man in early-20s, short tousled hair, wearing a casual grey hoodie, neutral studio background, soft cinematic lighting, photo-real natural skin, 3D quality. Centered."),
]


async def _generate_and_upload_preset(idx: int, definition) -> Optional[Dict[str, Any]]:
    label, gender, category, style, prompt = definition
    try:
        img_bytes = await _gemini_generate(prompt)
    except Exception as e:
        logger.exception("Gemini failed for %s", label)
        return {"error": f"gemini_failed: {str(e)[:120]}", "label": label}
    try:
        filename = f"presets/{label.lower()}-{uuid.uuid4().hex[:8]}.png"
        public_url = await _storage_upload(filename, img_bytes, "image/png")
    except Exception as e:
        logger.exception("Storage upload failed for %s", label)
        return {"error": f"upload_failed: {str(e)[:120]}", "label": label}

    return {
        "id": str(uuid.uuid4()),
        "label": label,
        "gender": gender,
        "category": category,
        "style": style,
        "image_url": public_url,
        "sort_order": idx,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/admin/seed-presets")
async def seed_presets(x_admin_key: Optional[str] = Header(None), force: bool = False):
    """One-time admin endpoint to generate the 18 preset 3D avatars.
    Header: X-Admin-Key must match SUPABASE_SERVICE_ROLE_KEY."""
    if not x_admin_key or x_admin_key != SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    existing = await _storage_get_json("presets/index.json") or []
    if not isinstance(existing, list):
        existing = []
    existing_labels = {p.get("label") for p in existing}

    all_presets: List[Dict[str, Any]] = list(existing) if not force else []
    errors: List[Dict[str, Any]] = []

    for idx, definition in enumerate(PRESET_DEFINITIONS):
        label = definition[0]
        if not force and label in existing_labels:
            continue
        result = await _generate_and_upload_preset(idx, definition)
        if result and "error" not in result:
            all_presets.append(result)
        elif result:
            errors.append(result)

    # De-duplicate by label, keep latest
    seen: Dict[str, Dict[str, Any]] = {}
    for p in all_presets:
        seen[p["label"]] = p
    final = sorted(seen.values(), key=lambda p: p.get("sort_order", 0))

    await _storage_put_json("presets/index.json", final)

    return {"created": len(final), "errors": errors, "total_presets": len(final)}
