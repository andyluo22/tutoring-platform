#!/usr/bin/env python3
import asyncio
from app.database import AsyncSessionLocal, engine, Base
from app.crud import create_user, get_user
from app.schemas import UserCreate

async def main():
    # reset schema
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # run your CRUD ops
    async with AsyncSessionLocal() as db:
        u = await create_user(db, UserCreate(email="foo@bar.com", name="Foo"))
        print("→ Created user:", u.id, u.email)
        fetched = await get_user(db, u.id)
        print("→ Fetched user:", fetched.id, fetched.email)

if __name__ == "__main__":
    asyncio.run(main())