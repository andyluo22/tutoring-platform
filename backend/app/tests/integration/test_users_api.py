import pytest
from app.schemas import UserCreate

@pytest.mark.asyncio
async def test_post_and_get_user(init_db_and_client):
    client = init_db_and_client

    # Create → 201
    resp = await client.post("/users/", json=UserCreate(email="i@int.com", name="I").model_dump())
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "i@int.com"

    # Get → 200
    get_resp = await client.get(f"/users/{data['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "I"

@pytest.mark.asyncio
async def test_get_nonexistent_user_returns_404(init_db_and_client):
    client = init_db_and_client
    resp = await client.get("/users/99999")
    assert resp.status_code == 404

@pytest.mark.asyncio
@pytest.mark.parametrize("payload", [
    {},  # missing both
    {"email": "no-name@x.com"},  # missing name
    {"name": "NoEmail"},  # missing email
    {"email": "not-an-email", "name": "Bad"}  # invalid email
])
async def test_post_user_validation_errors(init_db_and_client, payload):
    client = init_db_and_client
    resp = await client.post("/users/", json=payload)
    assert resp.status_code == 422