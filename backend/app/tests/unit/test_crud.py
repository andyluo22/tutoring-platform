import pytest
from datetime import datetime, timezone
from app import crud, schemas, models
from app.models import UserRole

@pytest.mark.asyncio
async def test_create_and_get_user(db):
    in_payload = schemas.UserCreate(email="gold@js.com", name="Gold Tester")
    user = await crud.create_user(db, in_payload)
    assert user.id > 0
    assert user.role == UserRole.student

    fetched = await crud.get_user(db, user.id)
    assert fetched.email == in_payload.email

@pytest.mark.asyncio
async def test_get_nonexistent_user(db):
    missing = await crud.get_user(db, -1)
    assert missing is None

@pytest.mark.asyncio
async def test_create_session_and_get(db):
    user = await crud.create_user(db, schemas.UserCreate(email="s@js.com", name="S"))
    now = datetime.now(timezone.utc)

    sess = await crud.create_session(db, schemas.SessionCreate(
        user_id=user.id, start_time=now, end_time=now
    ))
    assert sess.user_id == user.id

    fetched_sess = await crud.get_session(db, sess.id)
    assert fetched_sess.id == sess.id

@pytest.mark.asyncio
async def test_get_non_existent_session(db):
    missing = await crud.get_session(db, -1)
    assert missing is None

@pytest.mark.asyncio
async def test_create_booking_and_get(db):
    user = await crud.create_user(db, schemas.UserCreate(email="b@js.com", name="B"))
    now = datetime.now(timezone.utc)

    sess = await crud.create_session(db, schemas.SessionCreate(
        user_id=user.id, start_time=now, end_time=now
    ))

    book = await crud.create_booking(db, schemas.BookingCreate(
        user_id=user.id, session_id=sess.id, call_type="zoom"
    ))
    assert book.session_id == sess.id

    fetched_book = await crud.get_booking(db, book.id)
    assert fetched_book.id == book.id

@pytest.mark.asyncio
async def test_get_nonexistent_booking(db):
    missing = await crud.get_booking(db, -1)
    assert missing is None






