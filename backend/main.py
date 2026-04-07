import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import transactions, budget, accounts, categories, goals, planner, reports

app = FastAPI(title="App-Financeiro Backend", version="1.0.0")

# SecOps: CORS Blindado para Produção
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [url.strip() for url in frontend_url.split(",")] if "," in frontend_url else [frontend_url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(budget.router)
app.include_router(accounts.router)
app.include_router(categories.router)
app.include_router(goals.router)
app.include_router(planner.router)
app.include_router(reports.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "App-Financeiro API está rodando!"}
