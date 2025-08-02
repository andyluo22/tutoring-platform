#!/usr/bin/env python3
import asyncio
from app.database import engine, Base

async def main():
    async with engine.begin() as conn:
        # create then immediately drop to ensure tables reflect your models
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(Base.metadata.drop_all)
    print("✅ Models load and sync with DB metadata")

if __name__ == "__main__":
    asyncio.run(main())