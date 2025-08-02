import pytest_asyncio
from httpx import AsyncClient
from httpx import ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# in-memory DB for endpoints
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"
engine_test = create_async_engine(TEST_DB_URL, future=True)
AsyncSessionTest = sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)

@pytest_asyncio.fixture(autouse=True, scope="module")
async def init_db_and_client():
    # create tables
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # override get_db dependency
    async def override_db():
        async with AsyncSessionTest() as session:
            yield session
    app.dependency_overrides[get_db] = override_db

    # spin up an HTTPX client using the ASGI transport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client



