# backend/app/routers/stripe_webhook.py

from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import stripe

from ..config import settings
from ..database import get_db
from ..crud import get_signup_by_code, mark_signup_paid, create_session

router = APIRouter(prefix="/webhook", tags=["webhook"])

@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    payload    = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]
        metadata    = session_obj.get("metadata", {})

        # 1) Handle fixed “class” bookings via invite_code
        invite_code = metadata.get("invite_code")
        if invite_code:
            signup = await get_signup_by_code(db, invite_code)
            if signup:
                await mark_signup_paid(db, signup.id)
            return {"status": "ok"}

        # 2) Handle ad-hoc slot bookings via user_id/start/end
        user_id = metadata.get("user_id")
        start   = metadata.get("start")
        end     = metadata.get("end")
        if user_id and start and end:
            await create_session(db, user_id=int(user_id), start=start, end=end)
            return {"status": "ok"}

    return {"status": "ignored"}
