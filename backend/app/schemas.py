from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

# ── User ───────────────────────────────────────
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

# ── Session ────────────────────────────────────
class SessionCreate(BaseModel):
    user_id: int
    start_time: datetime
    end_time: datetime

class SessionRead(BaseModel):
    id: int
    user_id: int
    start_time: datetime
    end_time: datetime
    created_at: datetime

    model_config = ConfigDict(env_file=".env")

# ── Booking ────────────────────────────────────
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

# ── Class (recurring / fixed-schedule) ────────────────────────────────
class ClassRead(BaseModel):
    id: str
    title: str
    day_of_week: int        # 0 = Sunday … 6 = Saturday
    start_time: datetime
    end_time: datetime
    price_per_seat: float
    max_participants: int
    current_bookings: int

    model_config = ConfigDict(env_file=".env")