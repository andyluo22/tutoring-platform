#!/usr/bin/env python3
import asyncio
from app.database import engine, Base

async def main():
    # This will emit CREATE TABLE statements or fail loudly
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database connected & tables created")

if __name__ == "__main__":
    asyncio.run(main())