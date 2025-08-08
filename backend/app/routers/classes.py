#tutoring-platform\backend\app\routers\classes.py

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/classes", tags=["classes"])

@router.get(
    "", 
    response_model=List[schemas.ClassRead],
)
async def list_classes(db: AsyncSession = Depends(get_db)):
    """
    List all fixed-schedule group classes with current booking counts.
    """
    # Filter for class_group sessions instead of the removed is_class flag
    stmt = (
        select(
            models.Session.id,
            models.Session.title,
            models.Session.day_of_week,
            models.Session.start_time,
            models.Session.end_time,
            models.Session.price_per_seat,
            models.Session.max_participants,
            func.count(models.SessionSignup.id).label("current_bookings"),
        )
        .outerjoin(
            models.SessionSignup,
            models.Session.id == models.SessionSignup.session_id
        )
        .where(models.Session.session_type == models.SessionType.class_group)
        .group_by(models.Session.id)
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        schemas.ClassRead(
            id=row.id,
            title=row.title or "",
            day_of_week=row.day_of_week or 0,
            start_time=row.start_time,
            end_time=row.end_time,
            price_per_seat=row.price_per_seat,
            max_participants=row.max_participants,
            current_bookings=row.current_bookings,
        )
        for row in rows
    ]
