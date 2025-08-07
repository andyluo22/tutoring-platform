from fastapi import Depends, HTTPException, status
from pydantic_settings import BaseSettings
from sqlalchemy.ext.asyncio import AsyncSession


from .database import get_db
from .crud import get_user

# --- Authentication stub ---
async def get_current_user(db: AsyncSession = Depends(get_db)):
    """
    Placeholder dependency that retrieves a user.
    TODO: Replace with real authentication logic.
    """
    # For now, assume user_id=1
    user = await get_user(db, 1)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user