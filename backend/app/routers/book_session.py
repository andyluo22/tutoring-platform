# app/routers/book_session.py

from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from .. import crud, schemas, models

router = APIRouter(tags=["booking"])

@router.post(
    "/book-session",
    response_model=schemas.SessionSignupRead,
    status_code=status.HTTP_201_CREATED,
)
async def book_session(
    signup_req: schemas.SessionSignupCreate,
    db: AsyncSession = Depends(get_db),
):
    # 1) Ensure session exists
    sess = await crud.get_session(db, signup_req.session_id)
    if not sess:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Session not found")

    # 2) Capacity check
    current = await crud.count_session_signups(db, sess.id)
    if current >= sess.max_participants:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Session is full")

    # 3) Generate invite & create signup in one shot
    invite_code = uuid4().hex
    signup = await crud.create_session_signup(
        db,
        signup_req,
        invite_code=invite_code,
        is_paid=False,
    )

    return signup