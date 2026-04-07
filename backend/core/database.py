import os
from fastapi import Request, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

# Dependency do FastAPI que extrai o Authorization Header ("Bearer ...")
security = HTTPBearer()

def get_supabase(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Client:
    """
    Cria uma instância do Supabase que repassa automaticamente o JWT (Token)
    do usuário autenticado. Isso garante 100% de aderência ao Row-Level Security (RLS)
    nativo do Postgres, evitando consultas voadoras sem escopo.
    """
    token = credentials.credentials
    try:
        # Client recriado no contexto da view para evitar contaminação de JWTs
        db: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        db.postgrest.auth(token)
        return db
    except Exception as e:
        raise HTTPException(status_code=401, detail="Unauthorized or failed to connect to DB.")
