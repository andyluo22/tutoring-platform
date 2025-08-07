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
    # 1) Ensure the session exists
    sess = await crud.get_session(db, signup_req.session_id)
    if not sess:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Session not found")

    # 2) Check availability
    current = await crud.count_session_signups(db, sess.id)
    if current >= sess.max_participants:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Session is full")

    # 3) Generate invite & stub payment
    invite_code = uuid4().hex
    signup = await crud.create_session_signup(db, signup_req)

    # update invite_code & is_paid
    signup.invite_code = invite_code
    signup.is_paid = False
    db.add(signup)
    await db.commit()
    await db.refresh(signup)

    return signup