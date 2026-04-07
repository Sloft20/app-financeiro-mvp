from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from core.database import get_supabase
from models.schemas import AccountCreate, AccountResponse

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("/", response_model=list[AccountResponse])
def get_accounts(db: Client = Depends(get_supabase)):
    """
    Retorna contas do dono do Token
    """
    try:
        res = db.table("accounts").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/setup", response_model=AccountResponse)
def setup_initial_account(payload: AccountCreate, db: Client = Depends(get_supabase)):
    """
    Onboarding: Cria uma conta base e faz o SEED inicial de categorias essenciais para não quebrar a Foreign Key.
    """
    try:
        # 1. Cadastra a conta principal
        insert_data = {"name": payload.name, "type": payload.type.value, "balance": float(payload.balance)}
        res = db.table("accounts").insert(insert_data).execute()
        
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to create account")
            
        created_account = res.data[0]

        # 2. SEED: Verifica se a pessoa já tem categorias
        cat_check = db.table("categories").select("*").limit(1).execute()
        if not cat_check.data:
            db.table("categories").insert([
                {"name": "Salário Padrão", "type": "INCOME", "color_icon": "emerald"},
                {"name": "Custo Fixo Diário", "type": "FIXED_EXPENSE", "color_icon": "orange"},
                {"name": "Despesa Livre", "type": "VARIABLE_EXPENSE", "color_icon": "indigo"}
            ]).execute()

        return created_account
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
