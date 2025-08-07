# backend/app/tests/integration/test_session_signup_api.py

import pytest
from datetime import datetime, timezone
from fastapi.encoders import jsonable_encoder

from app.schemas import (
    UserCreate,
    SessionCreate,
    SessionSignupCreate,
)

@pytest.mark.asyncio
async def test_post_and_exhaust_session_signups(init_db_and_client):
    client = init_db_and_client

    # 1) Create a tutor so we can create the session
    tutor = await client.post(
        "/users",  # removed trailing slash
        json=UserCreate(email="tutor@int.com", name="Tutor").model_dump(),
    )
    assert tutor.status_code == 201
    tutor_id = tutor.json()["id"]

    # 2) Create a session with capacity 2
    now = datetime.now(timezone.utc)
    session_payload = SessionCreate(
        user_id=tutor_id,
        title="Group Class",
        day_of_week=2,
        is_class=True,
        start_time=now,
        end_time=now,
        price_per_seat=1500,
        max_participants=2,
    )
    sess_resp = await client.post(
        "/sessions",  # removed trailing slash
        json=jsonable_encoder(session_payload),
    )
    assert sess_resp.status_code == 201
    session_id = sess_resp.json()["id"]

    # 3) Sign up two different students—both should succeed
    for idx in (1, 2):
        user = await client.post(
            "/users",  # removed trailing slash
            json=UserCreate(
                email=f"student{idx}@int.com", name=f"Student{idx}"
            ).model_dump(),
        )
        assert user.status_code == 201
        student_id = user.json()["id"]

        signup_resp = await client.post(
            "/book-session",  # already no slash
            json=SessionSignupCreate(
                student_id=student_id,
                session_id=session_id,
            ).model_dump(),
        )
        assert signup_resp.status_code == 201
        body = signup_resp.json()
        assert body["student_id"] == student_id
        assert body["session_id"] == session_id
        assert len(body["invite_code"]) > 0
        assert body["is_paid"] is False

    # 4) Third student should be rejected (capacity=2)
    user3 = await client.post(
        "/users",  # removed trailing slash
        json=UserCreate(email="student3@int.com", name="Student3").model_dump(),
    )
    assert user3.status_code == 201
    resp3 = await client.post(
        "/book-session",
        json={"student_id": user3.json()["id"], "session_id": session_id},
    )
    assert resp3.status_code == 400
    assert "Session is full" in resp3.json()["detail"]

@pytest.mark.asyncio
async def test_book_session_validation_errors(init_db_and_client):
    client = init_db_and_client

    # missing both fields
    resp = await client.post("/book-session", json={})
    assert resp.status_code == 422

    # missing session_id
    resp = await client.post("/book-session", json={"student_id": 1})
    assert resp.status_code == 422

    # missing student_id
    resp = await client.post("/book-session", json={"session_id": 1})
    assert resp.status_code == 422
