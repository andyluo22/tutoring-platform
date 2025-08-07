from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

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
    user_id: int
    title: Optional[str]
    day_of_week: Optional[int]
    is_class: Optional[bool] = False
    start_time: datetime
    end_time: datetime
    price_per_seat: Optional[int] = 0
    max_participants: Optional[int] = 1

class SessionRead(BaseModel):
    id: int
    user_id: int
    title: Optional[str]
    day_of_week: Optional[int]
    is_class: bool
    start_time: datetime
    end_time: datetime
    price_per_seat: int
    max_participants: int
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
    created_at: datetime

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