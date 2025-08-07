# backend/app/schemas.py
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from .models import SessionType


# ── User ─────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    role: Optional[str] = "student"

class UserRead(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: str
    created_at: datetime

    model_config = ConfigDict(env_file=".env")


# ── Session ──────────────────────────────────────
class SessionCreate(BaseModel):
    tutor_id: int
    session_type: SessionType
    title: Optional[str] = None
    day_of_week: Optional[int] = None
    start_time: datetime
    end_time: datetime
    price_per_seat: int = 0
    max_participants: int = 1
    zoom_link: Optional[str] = None
    discord_channel_id: Optional[str] = None
    discord_invite_link: Optional[str] = None

class SessionRead(BaseModel):
    id: int
    tutor_id: int
    session_type: SessionType
    title: Optional[str]
    day_of_week: Optional[int]
    start_time: datetime
    end_time: datetime
    price_per_seat: int
    max_participants: int
    zoom_link: Optional[str]
    discord_channel_id: Optional[str]
    discord_invite_link: Optional[str]
    created_at: datetime

    model_config = ConfigDict(env_file=".env")


# ── Booking ──────────────────────────────────────
class BookingCreate(BaseModel):
    user_id: int
    session_id: int
    call_type: str

class BookingRead(BaseModel):
    id: int
    user_id: int
    session_id: int
    call_type: str
    created_at: datetime

    model_config = ConfigDict(env_file=".env")


# ── SessionSignup ────────────────────────────────
class SessionSignupCreate(BaseModel):
    student_id: int
    session_id: int

class SessionSignupRead(BaseModel):
    id: int
    student_id: int
    session_id: int
    invite_code: str
    is_paid: bool
    discord_channel_id: Optional[str]
    discord_invite_link: Optional[str]
    stripe_session_id: Optional[str]
    stripe_checkout_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(env_file=".env")


# ── Join Flows ───────────────────────────────────
class JoinClassIn(BaseModel):
    invite_code: str

class JoinClassOut(BaseModel):
    session_id: int
    zoom_link: Optional[str]
    discord_invite_link: Optional[str]
    price_per_seat: int

    model_config = ConfigDict(env_file=".env")


# ── ClassRead ────────────────────────────────────
class ClassRead(BaseModel):
    id: int
    title: str
    day_of_week: int
    start_time: datetime
    end_time: datetime
    price_per_seat: int
    max_participants: int
    current_bookings: int

    model_config = ConfigDict(env_file=".env")