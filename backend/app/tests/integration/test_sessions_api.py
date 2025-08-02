import pytest
from datetime import datetime, timezone
from fastapi.encoders import jsonable_encoder
from app.schemas import UserCreate, SessionCreate

@pytest.mark.asyncio
async def test_post_and_get_session(init_db_and_client):
    client = init_db_and_client

    # 1) Create a user
    user_payload = UserCreate(email="sess@int.com", name="Sess")
    u = await client.post("/users/", json=user_payload.model_dump())
    uid = u.json()["id"]

    # 2) Create session → 201
    now = datetime.now(timezone.utc)
    sess_model = SessionCreate(user_id=uid, start_time=now, end_time=now)
    sess_payload = jsonable_encoder(sess_model)
    sess = await client.post("/sessions/", json=sess_payload)
    assert sess.status_code == 201

    sid = sess.json()["id"]
    assert sess.json()["user_id"] == uid

    # 3) Get session → 200
    get_sess = await client.get(f"/sessions/{sid}")
    assert get_sess.status_code == 200
    assert get_sess.json()["id"] == sid

@pytest.mark.asyncio
async def test_get_nonexistent_session_returns_404(init_db_and_client):
    client = init_db_and_client
    resp = await client.get("/sessions/99999")
    assert resp.status_code == 404

@pytest.mark.asyncio
@pytest.mark.parametrize("payload", [
    {},  # missing all
    {"user_id": 1},  # missing times
    {"user_id": 1, "start_time": "not-a-date", "end_time": "also-bad"}  # invalid formats
])
async def test_post_session_validation_errors(init_db_and_client, payload):
    client = init_db_and_client
    resp = await client.post("/sessions/", json=payload)
    assert resp.status_code == 422
