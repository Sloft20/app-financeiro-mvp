from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from datetime import date
from pydantic import BaseModel
import calendar
from typing import List
from core.database import get_supabase
from models.schemas import CategoryType

router = APIRouter(prefix="/reports", tags=["Reports/Analytics"])

class CategoryDistribution(BaseModel):
    name: str
    amount: float
    color: str

class MonthlyReportResponse(BaseModel):
    total_income: float
    total_expense: float
    categories_distribution: List[CategoryDistribution]

@router.get("/monthly", response_model=MonthlyReportResponse)
def get_monthly_report(db: Client = Depends(get_supabase)):
    today = date.today()
    _, last_day = calendar.monthrange(today.year, today.month)
    start_date = today.replace(day=1)
    end_date = today.replace(day=last_day)
    
    # Motor de analytics filtra pelo RLS nativo
    query = db.table("transactions")\
        .select("amount, categories(name, type)")\
        .eq("is_paid", True)\
        .gte("transaction_date", start_date.isoformat())\
        .lte("transaction_date", end_date.isoformat())\
        .execute()
        
    total_income = 0.0
    total_expense = 0.0
    dist_map = {}
    
    for row in query.data:
        amount = float(row["amount"])
        cat = row.get("categories", {})
        if not cat: continue
        
        c_type = cat.get("type")
        c_name = cat.get("name", "Outros")
        
        if c_type == CategoryType.INCOME.value:
            total_income += amount
        else:
            total_expense += amount
            # Add to pie chart
            if c_name not in dist_map:
                dist_map[c_name] = 0.0
            dist_map[c_name] += amount
            
    # Hex Colors based on Tailwind defaults to match Recharts expectations
    colors = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"]
    
    dist_list = []
    idx = 0
    for name, amt in dist_map.items():
        dist_list.append({
            "name": name,
            "amount": round(amt, 2),
            "color": colors[idx % len(colors)]
        })
        idx += 1
        
    dist_list.sort(key=lambda x: x["amount"], reverse=True)
    
    return MonthlyReportResponse(
        total_income=round(total_income, 2),
        total_expense=round(total_expense, 2),
        categories_distribution=dist_list
    )
