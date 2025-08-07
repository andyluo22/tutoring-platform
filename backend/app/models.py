from sqlalchemy import (
    Column, Integer, String, DateTime,
    Enum, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from .database import Base

class UserRole(str, enum.Enum):
    student = "student"
    tutor   = "tutor"

class User(Base):
    __tablename__ = "users"

    id        = Column(Integer, primary_key=True, index=True)
    email     = Column(String, unique=True, nullable=False, index=True)
    name      = Column(String, nullable=False)
    role      = Column(Enum(UserRole), default=UserRole.student, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    sessions        = relationship("Session", back_populates="user")
    bookings        = relationship("Booking", back_populates="user")
    session_signups = relationship("SessionSignup", back_populates="student")


class Session(Base):
    __tablename__ = "sessions"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False)

    # — fixed-schedule class metadata —
    title            = Column(String, nullable=True)             # "Grade 8 Math Group"
    day_of_week      = Column(Integer, nullable=True)            # 0=Sunday…6=Saturday
    is_class         = Column(Boolean, default=False, nullable=False)

    start_time       = Column(DateTime(timezone=True), nullable=False)
    end_time         = Column(DateTime(timezone=True), nullable=False)
    price_per_seat   = Column(Integer, nullable=False, default=0)  # in cents
    max_participants = Column(Integer, nullable=False, default=1)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user    = relationship("User", back_populates="sessions")
    booking = relationship("Booking", back_populates="session", uselist=False)
    signups = relationship("SessionSignup", back_populates="session")


class Booking(Base):
    __tablename__ = "bookings"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    call_type  = Column(String, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user    = relationship("User", back_populates="bookings")
    session = relationship("Session", back_populates="booking")


class SessionSignup(Base):
    __tablename__ = "session_signups"

    id          = Column(Integer, primary_key=True, index=True)
    student_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id  = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    invite_code = Column(String, unique=True, nullable=False, index=True)
    is_paid     = Column(Boolean, default=False, nullable=False)
    created_at  = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    student = relationship("User", back_populates="session_signups")
    session = relationship("Session", back_populates="signups")
