from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post(
    "",
    response_model=schemas.SessionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_session_endpoint(
    session_in: schemas.SessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new session time slot for a user.
    """
    return await crud.create_session(db, session_in)

@router.get(
    "",
    response_model=List[schemas.SessionRead],
)
async def list_sessions(
    db: AsyncSession = Depends(get_db),
):
    """
    List all session time slots (1:1 and small-group).
    """
    result = await db.execute(select(models.Session))
    return result.scalars().all()

@router.get(
    "/{session_id}",
    response_model=schemas.SessionRead,
)
async def read_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch one session by ID, or 404 if not found.
    """
    sess = await crud.get_session(db, session_id)
    if not sess:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return sess
