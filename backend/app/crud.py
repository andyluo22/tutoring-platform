from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from . import models, schemas

# ── Users ───────────────────────────────────────
async def create_user(db: AsyncSession, user_in: schemas.UserCreate) -> models.User:
    db_user = models.User(**user_in.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_user(db: AsyncSession, user_id: int) -> models.User | None:
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalar_one_or_none()

# ── Sessions ────────────────────────────────────
async def create_session(db: AsyncSession, sess_in: schemas.SessionCreate) -> models.Session:
    db_sess = models.Session(**sess_in.model_dump())
    db.add(db_sess)
    await db.commit()
    await db.refresh(db_sess)
    return db_sess

async def get_session(db: AsyncSession, session_id: int) -> models.Session | None:
    result = await db.execute(select(models.Session).where(models.Session.id == session_id))
    return result.scalar_one_or_none()

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
