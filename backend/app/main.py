from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, sessions, bookings, classes, book_session

app = FastAPI(title="Tutoring Platform API", version ="1.0")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.get("/", tags=["root"])
# async def read_root():
#     return {"message": "Welcome to the Tutoring Platform API"}

app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(bookings.router)
app.include_router(classes.router)
app.include_router(book_session.router)