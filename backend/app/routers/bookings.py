from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post(
    "/",
    response_model=schemas.BookingRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_booking_endpoint(
    booking_in: schemas.BookingCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Book a created session (e.g. for Zoom or Discord).
    """
    # Optionally: you might check crud.get_session() here to ensure it exists
    return await crud.create_booking(db, booking_in)

@router.get(
    "/{booking_id}",
    response_model=schemas.BookingRead,
)
async def read_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch one booking by ID, or 404 if not found.
    """
    book = await crud.get_booking(db, booking_id)
    if not book:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found")
    return book
    