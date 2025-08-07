# backend/app/routers/class_bookings.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
import stripe

from ..database import get_db
from ..config import settings
from ..dependencies import get_current_user
from .. import crud, schemas

router = APIRouter(prefix="/class", tags=["class_bookings"])

@router.post(
    "/book",
    response_model=schemas.SessionSignupRead,
    status_code=status.HTTP_201_CREATED,
)
async def book_class(
    signup_in: schemas.SessionSignupCreate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    session = await crud.get_session(db, signup_in.session_id)
    if not session:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Session not found")

    count = await crud.count_session_signups(db, session.id)
    if count >= session.max_participants:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Session is full")

    # 1) Generate invite code
    invite_code = uuid4().hex

    # 2) Create Stripe Checkout Session, embedding the invite_code in metadata
    checkout = stripe.checkout.Session.create(
        line_items=[{
            "price_data": {
                "currency": "usd",
                "unit_amount": session.price_per_seat,
                "product_data": {"name": session.title or "Session"}
            },
            "quantity": 1
        }],
        mode="payment",
        success_url=f"{settings.FRONTEND_URL}/class/join?code={{CHECKOUT_SESSION_ID}}",
        cancel_url=settings.FRONTEND_URL,
        metadata={"invite_code": invite_code},
    )

    # 3) Persist the signup record with stripe_session_id
    signup = await crud.create_session_signup(
        db,
        signup_in,
        invite_code=invite_code,
        is_paid=False,
    )
    signup.stripe_session_id = checkout.id
    db.add(signup)
    await db.commit()
    await db.refresh(signup)

    signup.stripe_checkout_url = checkout.url

    return signup

@router.get(
    "/join",
    response_model=schemas.JoinClassOut,
)
async def get_join(
    code: str,
    db: AsyncSession = Depends(get_db),
):
    signup = await crud.get_signup_by_code(db, code)
    if not signup or not signup.is_paid:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Invalid or unpaid invite")

    session = await crud.get_session(db, signup.session_id)
    return schemas.JoinClassOut(
        session_id=session.id,
        zoom_link=session.zoom_link,
        discord_invite_link=signup.discord_invite_link or session.discord_invite_link,
        price_per_seat=session.price_per_seat,
    )

@router.post(
    "/join",
    response_model=schemas.SessionSignupRead,
    status_code=status.HTTP_201_CREATED,
)
async def join_class(
    payload: schemas.JoinClassIn,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    original = await crud.get_signup_by_code(db, payload.invite_code)
    if not original:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Invite not found")
    if original.student_id == user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Cannot join your own invite")

    session = await crud.get_session(db, original.session_id)
    count = await crud.count_session_signups(db, session.id)
    if count >= session.max_participants:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Session is full")

    # 1) Generate new invite code for the friend
    invite_code = uuid4().hex

    # 2) Create Stripe Checkout Session with metadata
    checkout = stripe.checkout.Session.create(
        line_items=[{
            "price_data": {
                "currency": "usd",
                "unit_amount": session.price_per_seat,
                "product_data": {"name": session.title or "Session"}
            },
            "quantity": 1
        }],
        mode="payment",
        success_url=f"{settings.FRONTEND_URL}/class/join?code={{CHECKOUT_SESSION_ID}}",
        cancel_url=settings.FRONTEND_URL,
        metadata={"invite_code": invite_code},
    )

    # 3) Persist the friend’s signup
    signup = await crud.create_session_signup(
        db,
        schemas.SessionSignupCreate(student_id=user.id, session_id=session.id),
        invite_code=invite_code,
        is_paid=False,
    )
    signup.stripe_session_id = checkout.id
    db.add(signup)
    await db.commit()
    await db.refresh(signup)

    return signup