from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from core.database import get_supabase
from models.schemas import GoalCreate, GoalResponse

router = APIRouter(prefix="/goals", tags=["Goals/Cofres"])

@router.get("/", response_model=list[GoalResponse])
def get_goals(db: Client = Depends(get_supabase)):
    try:
        res = db.table("goals").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=GoalResponse)
def create_goal(payload: GoalCreate, db: Client = Depends(get_supabase)):
    try:
        data = payload.model_dump(mode="json")
        res = db.table("goals").insert(data).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{goal_id}")
def delete_goal(goal_id: str, db: Client = Depends(get_supabase)):
    try:
        db.table("goals").delete().eq("id", goal_id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
