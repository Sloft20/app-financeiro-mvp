from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from core.database import get_supabase
from models.schemas import BudgetCreate, BudgetResponse

router = APIRouter(prefix="/planner", tags=["Planner/Budgets"])

@router.get("/", response_model=list[BudgetResponse])
def get_budgets(db: Client = Depends(get_supabase)):
    """
    Retorna todos os limites fixados pelo usuário.
    """
    try:
        # Traz as categorias atreladas para facilitar filtro no front
        res = db.table("budgets").select("*, categories(name, type)").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=BudgetResponse)
def set_budget(payload: BudgetCreate, db: Client = Depends(get_supabase)):
    """
    Cadastra ou tenta provisionar um limite para uma categoria.
    No MVP, faremos inserção direta.
    """
    try:
        data = payload.model_dump(mode="json")
        res = db.table("budgets").insert(data).execute()
        
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to create budget limit")
        
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
