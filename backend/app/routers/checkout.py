# backend/app/routers/checkout.py


import stripe
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from ..database import get_db
from ..dependencies import get_current_user
from ..config import settings

# Initialize Stripe with the secret key from settings
stripe.api_key = settings.STRIPE_API_KEY

router = APIRouter(prefix="/create-checkout-session", tags=["payments"])

class CheckoutIn(BaseModel):
    """Request body to start a Stripe Checkout session."""
    start: str  # ISO datetime string
    end:   str

@router.post("", summary="Start Stripe Checkout for an open slot")
async def create_checkout(
    data: CheckoutIn,
    db:   AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    # 1) Parse and compute duration
    try:
        start_dt  = datetime.fromisoformat(data.start)
        end_dt    = datetime.fromisoformat(data.end)
    except ValueError:
        raise HTTPException(400, detail="Invalid datetime format")

    total_minutes = int((end_dt - start_dt).total_seconds() // 60)
    if total_minutes <= 0:
        raise HTTPException(400, detail="End must be after start")

    # 2) Prorate the price
    amount_cents = settings.PRICE_PER_HOUR_CENTS * total_minutes // 60

    # 3) Create Stripe Checkout Session
    try:
        checkout = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"Tutoring Session ({total_minutes} min)"
                    },
                    "unit_amount": amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            metadata={
                "user_id": str(user.id),
                "start":   data.start,
                "end":     data.end,
            },
            success_url=f"{settings.FRONTEND_URL}/dashboard?session=success",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard?session=cancel",
        )
        return {"url": checkout.url}
    except stripe.error.StripeError as e:
        # Surface Stripe’s user-facing message if available
        raise HTTPException(status_code=400, detail=e.user_message or str(e))
