from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(user_in: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_user(db, user_in)

@router.get("/{user_id}", response_model=schemas.UserRead)
async def read_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user(db, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user