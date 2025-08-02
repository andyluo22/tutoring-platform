#!/usr/bin/env python3
import asyncio
from httpx import AsyncClient
from app.main import app

async def main():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Create a user
        r = await client.post("/users/", json={"email":"a@b.com","name":"A"})
        assert r.status_code == 201, r.text
        print("POST /users →", r.status_code, r.json())

        # Read it back
        uid = r.json()["id"]
        r2 = await client.get(f"/users/{uid}")
        assert r2.status_code == 200, r2.text
        print("GET  /users/{id} →", r2.status_code, r2.json())

if __name__=="__main__":
    asyncio.run(main())