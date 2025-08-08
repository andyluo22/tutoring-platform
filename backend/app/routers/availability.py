# backend/app/routers/availability.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, time
from typing import List, Dict, Any
from ..database import get_db
from .. import crud

router = APIRouter(prefix="/availability", tags=["availability"])

WORK_START = time(hour=6)
WORK_END   = time(hour=22)
SLOT_MINUTES = 60
PRICE_PER_HOUR_CENTS = 3000  # $30/hr

@router.get("", response_model=List[Dict[str, Any]])
async def list_availability(
    start: datetime,
    end:   datetime,
    db:    AsyncSession = Depends(get_db),
):
    slots = []
    cur = start
    while cur < end:
        if WORK_START <= cur.time() < WORK_END:
            slots.append({
                "start": cur.isoformat(),
                "end":   (cur + timedelta(minutes=SLOT_MINUTES)).isoformat(),
                "extendedProps": {
                    "kind":         "slot",
                    "pricePerHour": PRICE_PER_HOUR_CENTS,
                }
            })
        cur += timedelta(minutes=SLOT_MINUTES)

    # fetch overlapping sessions
    booked = await crud.list_sessions_between(db, start, end)

    def overlaps(slot, session):
        return not (
            slot["end"]   <= session.start_time.isoformat() or
            slot["start"] >= session.end_time.isoformat()
        )

    free = [s for s in slots if not any(overlaps(s, bs) for bs in booked)]

    return [
        {
            "id":            s["start"],
            "title":         "Open Slot",
            "start":         s["start"],
            "end":           s["end"],
            "price":         s["extendedProps"]["pricePerHour"],
            "extendedProps": s["extendedProps"],
        }
        for s in free
    ]
