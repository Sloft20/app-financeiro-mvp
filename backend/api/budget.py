from fastapi import APIRouter, Depends
from supabase import Client
from datetime import date
from pydantic import BaseModel
import calendar
from core.database import get_supabase
from models.schemas import CategoryType

router = APIRouter(prefix="/budget", tags=["Gamification"])

class DailyAverageResponse(BaseModel):
    remaining_days: int
    daily_average: float
    status: str
    message: str

@router.get("/daily-average", response_model=DailyAverageResponse)
def calculate_daily_average(db: Client = Depends(get_supabase)):
    today = date.today()
    _, last_day = calendar.monthrange(today.year, today.month)
    remaining_days = max(1, last_day - today.day + 1)
    
    start_date = today.replace(day=1)
    end_date = today.replace(day=last_day)

    # 1. Obter Renda Realizada no Mês Atual
    inc_query = db.table("transactions")\
        .select("amount, categories(type)")\
        .eq("is_paid", True)\
        .gte("transaction_date", start_date.isoformat())\
        .lte("transaction_date", end_date.isoformat())\
        .execute()
        
    total_income = sum(
        float(r["amount"]) for r in inc_query.data 
        if r.get("categories", {}).get("type") == CategoryType.INCOME.value
    )

    # 2. Obter Gastos VARIÁVEIS já realizados (O que corrói o Bolo Livre)
    var_spent = sum(
        float(r["amount"]) for r in inc_query.data 
        if r.get("categories", {}).get("type") == CategoryType.VARIABLE_EXPENSE.value
    )

    # 3. Levantar o Teto Fixo definido no Planner (BUDGETS)
    # Se o usuário não definiu teto, podemos cair na real gasta. Para simplificar, ignoramos real gasta de fixo e usamos so o Teto!
    bud_query = db.table("budgets").select("planned_amount, categories(type)").execute()
    total_fixed_limits = sum(
        float(b["planned_amount"]) for b in bud_query.data
        if b.get("categories", {}).get("type") == CategoryType.FIXED_EXPENSE.value
    )

    # 4. Levantar a Carga de Metas (GOALS) Mensal (Cofres)
    # O burden = (Alvo - Guardado) / meses_restantes
    goals_query = db.table("goals").select("target_amount, current_saved, target_date").execute()
    total_goals_burden = 0.0
    
    for g in goals_query.data:
        target_amt = float(g["target_amount"])
        saved_amt = float(g["current_saved"])
        t_date = date.fromisoformat(g["target_date"])
        
        # Calcular meses restantes (aprox)
        months_rem = (t_date.year - today.year) * 12 + (t_date.month - today.month)
        if months_rem <= 0: months_rem = 1
        
        burden = (target_amt - saved_amt) / months_rem
        if burden > 0:
            total_goals_burden += burden

    # ---------------------------------------------------------
    # A MATEMÁTICA DEFINITIVA DE PROPRIEDADE
    # ---------------------------------------------------------
    # Bolo Livre = Toda renda subtraída dos compromissos (Teto de Vida e Cofres de Sonhos)
    free_cake = total_income - total_fixed_limits - total_goals_burden
    
    # Diário Médio = (Bolo Livre que restou - Já consumido livre) / Dias Restantes
    free_amount_remaining = free_cake - var_spent
    daily_avg = free_amount_remaining / remaining_days
    
    # Tolerância a Zeros caso ele não tenha Renda ainda cadastrada
    if total_income == 0:
         # Manda pro front sem surtar. Zero é zero.
         daily_avg = 0.0
    
    # Motor de Respostas Emocionais
    if daily_avg < 0:
        status_code = "danger"
        status_text = "Seu Teto ou Sonho estouraram a renda. Risco Letal."
    elif daily_avg < 30:
        status_code = "warning"
        status_text = "Foco total. Você operará nas margens da meta."
    elif daily_avg < 100:
        status_code = "success"
        status_text = "Metas isoladas. Dinheiro diário livre garantido."
    else:
        status_code = "excellent"
        status_text = "Excedente notável! Engorde um Cofre!"
        
    return DailyAverageResponse(
        remaining_days=remaining_days,
        daily_average=round(daily_avg, 2),
        status=status_code,
        message=status_text
    )
