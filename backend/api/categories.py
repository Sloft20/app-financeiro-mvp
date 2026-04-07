from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from core.database import get_supabase
from models.schemas import CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=list[CategoryResponse])
def get_categories(db: Client = Depends(get_supabase)):
    try:
        res = db.table("categories").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
