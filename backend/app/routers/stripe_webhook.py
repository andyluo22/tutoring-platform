from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import stripe

from ..config import settings
from ..database import get_db
from ..crud import get_signup_by_code, mark_signup_paid

router = APIRouter(tags=["webhook"])

@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid Webhook")

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]
        code = session_obj.get("metadata", {}).get("invite_code")
        if code:
            signup = await get_signup_by_code(db, code)
            if signup:
                await mark_signup_paid(db, signup.id)

    return {"status": "ok"}