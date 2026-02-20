from fastapi import FastAPI, APIRouter, Depends, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import jwt


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Supabase JWT secret for token verification
SUPABASE_JWT_SECRET = os.environ.get('SUPABASE_JWT_SECRET', '')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# -------------------------------------------------------
# Auth dependency: verify Supabase JWT
# -------------------------------------------------------
async def verify_token(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(' ', 1)[1]
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(status_code=500, detail="Server misconfiguration")
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=['HS256'], audience='authenticated')
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Create the main app without a prefix
app = FastAPI(
    title="AvatarTalk API",
    description="Backend API for AvatarTalk platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    try:
        # Check MongoDB connection
        await db.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "service": "backend",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("Health check failed: database unreachable")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "service": "backend",
            "timestamp": datetime.utcnow().isoformat()
        }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate, _user: dict = Depends(verify_token)):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(limit: int = 50, skip: int = 0, _user: dict = Depends(verify_token)):
    """Get status checks with pagination and optimized field projection"""
    # Validate limit to prevent excessive queries
    limit = min(limit, 100)  # Max 100 records per request

    # Fetch only required fields with pagination
    status_checks = await db.status_checks.find(
        {},
        {
            '_id': 0,  # Exclude MongoDB _id field
            'id': 1,
            'client_name': 1,
            'timestamp': 1
        }
    ).skip(skip).limit(limit).to_list(limit)

    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

# -------------------------------------------------------
# CORS — require explicit configuration; no wildcard default
# -------------------------------------------------------
_cors_origins_raw = os.environ.get('CORS_ORIGINS', '')
if not _cors_origins_raw:
    # Fail safe: log a warning; use a restrictive placeholder so the
    # server still starts but cross-origin requests will be blocked.
    logger.warning(
        "CORS_ORIGINS environment variable is not set. "
        "Cross-origin requests will be rejected. "
        "Set CORS_ORIGINS to your frontend URL(s) in production."
    )
    _cors_origins = []
else:
    _cors_origins = [o.strip() for o in _cors_origins_raw.split(',') if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,          # Never combine credentials=True with wildcard
    allow_origins=_cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
