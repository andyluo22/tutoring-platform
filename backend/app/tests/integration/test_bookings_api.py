import pytest
from datetime import datetime, timezone
from fastapi.encoders import jsonable_encoder
from app.schemas import UserCreate, SessionCreate, BookingCreate

@pytest.mark.asyncio
async def test_post_and_get_booking(init_db_and_client):
    client = init_db_and_client

    # 1) Create user
    user_model = UserCreate(email="book@int.com", name="Booker")
    u = await client.post("/users", json=user_model.model_dump())
    uid = u.json()["id"]

    # 2) Create session
    now = datetime.now(timezone.utc)
    sess_model = SessionCreate(user_id=uid, start_time=now, end_time=now)
    sess_payload = jsonable_encoder(sess_model)
    s = await client.post("/sessions", json=sess_payload)
    assert s.status_code == 201
    sid = s.json()["id"]

    # 3) Create booking → 201
    book_model = BookingCreate(user_id=uid, session_id=sid, call_type="zoom")
    b = await client.post("/bookings", json=book_model.model_dump())
    assert b.status_code == 201

    bid = b.json()["id"]
    assert b.json()["session_id"] == sid

    # 4) Get booking → 200
    get_b = await client.get(f"/bookings/{bid}")
    assert get_b.status_code == 200
    assert get_b.json()["id"] == bid

@pytest.mark.asyncio
async def test_get_nonexistent_booking_returns_404(init_db_and_client):
    client = init_db_and_client
    resp = await client.get("/bookings/99999")
    assert resp.status_code == 404

@pytest.mark.asyncio
@pytest.mark.parametrize("payload", [
    {},  # missing all
    {"user_id": 1, "session_id": 1},  # missing call_type
    {"user_id": 1, "call_type": "zoom"}  # missing session_id
])
async def test_post_booking_validation_errors(init_db_and_client, payload):
    client = init_db_and_client
    resp = await client.post("/bookings", json=payload)
    assert resp.status_code == 422
