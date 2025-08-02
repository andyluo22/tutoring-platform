from fastapi import FastAPI 
from .routers import users, sessions, bookings 

app = FastAPI(title="Tutoring Platform API", version ="1.0")

# @app.get("/", tags=["root"])
# async def read_root():
#     return {"message": "Welcome to the Tutoring Platform API"}

app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(bookings.router)