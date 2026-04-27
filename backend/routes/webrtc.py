"""
WebRTC Signaling Server for AvatarTalk
Handles WebRTC peer connection signaling via Supabase Realtime
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import json

router = APIRouter(prefix="/api/webrtc", tags=["WebRTC"])

class SignalMessage(BaseModel):
    """WebRTC signaling message"""
    room_id: str
    user_id: str
    signal_type: str  # 'offer', 'answer', 'ice-candidate'
    signal_data: Dict[str, Any]
    target_user_id: Optional[str] = None

class RoomCreate(BaseModel):
    """Create a WebRTC room"""
    room_id: str
    user_id: str
    room_type: str = "voice"  # 'voice', 'video', 'screen-share'

# In-memory storage for active rooms (use Redis in production)
active_rooms: Dict[str, Dict[str, Any]] = {}

@router.post("/rooms/create")
async def create_room(room: RoomCreate):
    """
    Create a new WebRTC room for peer-to-peer communication
    
    This endpoint creates a room ID that peers can use to exchange signaling data.
    In production, use Supabase Realtime or a WebSocket server for signaling.
    """
    if room.room_id in active_rooms:
        raise HTTPException(status_code=400, detail="Room already exists")
    
    active_rooms[room.room_id] = {
        "room_id": room.room_id,
        "creator_id": room.user_id,
        "room_type": room.room_type,
        "participants": [room.user_id],
        "created_at": "now()",
    }
    
    return {
        "room_id": room.room_id,
        "status": "created",
        "message": "Room created successfully. Use Supabase Realtime for signaling."
    }

@router.post("/rooms/{room_id}/join")
async def join_room(room_id: str, user_id: str):
    """Join an existing WebRTC room"""
    if room_id not in active_rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = active_rooms[room_id]
    if user_id not in room["participants"]:
        room["participants"].append(user_id)
    
    return {
        "room_id": room_id,
        "participants": room["participants"],
        "status": "joined"
    }

@router.get("/rooms/{room_id}")
async def get_room(room_id: str):
    """Get room information"""
    if room_id not in active_rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return active_rooms[room_id]

@router.delete("/rooms/{room_id}")
async def delete_room(room_id: str, user_id: str):
    """Delete/leave a WebRTC room"""
    if room_id not in active_rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = active_rooms[room_id]
    
    # Only creator can delete room
    if room["creator_id"] == user_id:
        del active_rooms[room_id]
        return {"status": "deleted", "message": "Room deleted"}
    
    # Others can only leave
    if user_id in room["participants"]:
        room["participants"].remove(user_id)
        return {"status": "left", "message": "Left room"}
    
    raise HTTPException(status_code=403, detail="Not authorized")

@router.get("/ice-servers")
async def get_ice_servers():
    """
    Get TURN/STUN servers for WebRTC connection
    
    Returns free Google STUN servers by default.
    For production, add TURN servers with credentials from environment variables.
    """
    # Get TURN server credentials from environment variables
    turn_username = os.getenv("TURN_SERVER_USERNAME")
    turn_password = os.getenv("TURN_SERVER_PASSWORD")
    turn_url = os.getenv("TURN_SERVER_URL")
    
    ice_servers = [
        {"urls": "stun:stun.l.google.com:19302"},
        {"urls": "stun:stun1.l.google.com:19302"},
        {"urls": "stun:stun2.l.google.com:19302"},
    ]
    
    # Add TURN server if credentials are available
    if turn_url and turn_username and turn_password:
        ice_servers.append({
            "urls": turn_url,
            "username": turn_username,
            "credential": turn_password,
        })
    
    return {"iceServers": ice_servers}

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "active_rooms": len(active_rooms),
        "webrtc": "enabled"
    }
