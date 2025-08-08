from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, update
from datetime import datetime
from uuid import uuid4

from . import models, schemas

# ── Users ─────────────────────────────────────────
async def create_user(db: AsyncSession, user_in: schemas.UserCreate) -> models.User:
    db_user = models.User(**user_in.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_user(db: AsyncSession, user_id: int) -> models.User | None:
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalar_one_or_none()

# ── Sessions ─────────────────────────────────────
async def create_session(db: AsyncSession, sess_in: schemas.SessionCreate) -> models.Session:
    db_sess = models.Session(**sess_in.model_dump())
    db.add(db_sess)
    await db.commit()
    await db.refresh(db_sess)
    return db_sess

async def get_session(db: AsyncSession, session_id: int) -> models.Session | None:
    result = await db.execute(select(models.Session).where(models.Session.id == session_id))
    return result.scalar_one_or_none()

# for availability overlap
async def list_sessions_between(
    db: AsyncSession, start: datetime, end: datetime
) -> list[models.Session]:
    result = await db.execute(
        select(models.Session).where(
            and_(
                models.Session.start_time < end,
                models.Session.end_time   > start,
            )
        )
    )
    return result.scalars().all()

# ── Bookings ────────────────────────────────────
async def create_booking(db: AsyncSession, book_in: schemas.BookingCreate) -> models.Booking:
    db_book = models.Booking(**book_in.model_dump())
    db.add(db_book)
    await db.commit()
    await db.refresh(db_book)
    return db_book

async def get_booking(db: AsyncSession, booking_id: int) -> models.Booking | None:
    result = await db.execute(select(models.Booking).where(models.Booking.id == booking_id))
    return result.scalar_one_or_none()

# ── Session Signups ─────────────────────────────
async def create_session_signup(
    db: AsyncSession,
    signup_in: schemas.SessionSignupCreate,
    invite_code: str,
    is_paid: bool = False,
) -> models.SessionSignup:
    db_signup = models.SessionSignup(
        student_id=signup_in.student_id,
        session_id=signup_in.session_id,
        invite_code=invite_code,
        is_paid=is_paid,
    )
    db.add(db_signup)
    await db.commit()
    await db.refresh(db_signup)
    return db_signup

async def count_session_signups(db: AsyncSession, session_id: int) -> int:
    result = await db.execute(
        select(func.count(models.SessionSignup.id))
        .where(models.SessionSignup.session_id == session_id)
    )
    return result.scalar_one()

async def get_signup_by_code(db: AsyncSession, code: str) -> models.SessionSignup | None:
    result = await db.execute(
        select(models.SessionSignup).where(models.SessionSignup.invite_code == code)
    )
    return result.scalar_one_or_none()

async def mark_signup_paid(db: AsyncSession, signup_id: int):
    await db.execute(
        update(models.SessionSignup)
        .where(models.SessionSignup.id == signup_id)
        .values(is_paid=True)
    )
    await db.commit()

# ── Stripe helpers for ad-hoc checkout ──────────
async def get_signup_by_stripe_session_id(db: AsyncSession, cs_id: str):
    res = await db.execute(
        select(models.SessionSignup).where(models.SessionSignup.stripe_session_id == cs_id)
    )
    return res.scalar_one_or_none()

async def create_one_off_session_and_signup(
    db: AsyncSession,
    *,
    tutor_id: int,
    student_id: int,
    start_dt: datetime,
    end_dt: datetime,
    amount_cents: int,
    stripe_session_id: str,
    zoom_link: str | None = None,
    discord_invite_link: str | None = None,
) -> models.SessionSignup:
    sess = models.Session(
        tutor_id=tutor_id,
        title="1:1 Tutoring",
        session_type=models.SessionType.one_on_one,
        start_time=start_dt,
        end_time=end_dt,
        price_per_seat=amount_cents,
        max_participants=1,
        zoom_link=zoom_link,
        discord_invite_link=discord_invite_link,
    )
    db.add(sess)
    await db.flush()

    signup = models.SessionSignup(
        student_id=student_id,
        session_id=sess.id,
        invite_code=uuid4().hex,
        is_paid=True,
        stripe_session_id=stripe_session_id,
    )
    db.add(signup)
    await db.commit()
    await db.refresh(signup)
    return signup
