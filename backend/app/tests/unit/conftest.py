import pytest
import pytest_asyncio
import asyncio 
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession 
from sqlalchemy.orm import sessionmaker 

from app.database import Base 
from app.config import settings 

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture(scope="module")
async def engine():
    engine = create_async_engine(TEST_DB_URL, future = True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine 
    await engine.dispose()

@pytest_asyncio.fixture
async def db(engine):
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with AsyncSessionLocal() as session:
        yield session 

