from typing import List
from fastapi import APIRouter
from ..schemas import ClassRead   # define this in schemas.py as empty fields

router = APIRouter(prefix="/classes", tags=["classes"])

@router.get("", response_model=List[ClassRead])
async def list_classes():
    return []   # empty for now