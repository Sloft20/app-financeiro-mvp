from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from core.database import get_supabase
from models.schemas import TransactionCreate, TransactionResponse, TransactionType, CategoryType

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=TransactionResponse)
def create_transaction(
    payload: TransactionCreate, 
    db: Client = Depends(get_supabase)
):
    """
    Cria uma nova transação aplicando a Regra Crítica: Caixa vs Competência.
    """
    # 1. Consultar a categoria informada para identificar se é INCOME (Render) ou EXPENSE
    cat_res = db.table("categories").select("*").eq("id", str(payload.category_id)).execute()
    if not cat_res.data:
        raise HTTPException(status_code=404, detail="Category not found.")
    
    category = cat_res.data[0]
    is_income = (category["type"] == CategoryType.INCOME.value)

    # 2. Inserir a Transação (O RLS garante que isso funciona APENAS se o user enviar o account_id dele)
    try:
        insert_data = payload.model_dump(mode="json") 
        # Forçamos a limpeza de dependências nulas para o Supabase
        insert_data = {k: v for k, v in insert_data.items() if v is not None}
        
        txn_res = db.table("transactions").insert(insert_data).execute()
        
        if not txn_res.data:
            raise HTTPException(status_code=400, detail="Failed to insert transaction.")
        
        created_txn = txn_res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    transaction_amount = float(payload.amount)

    # 3. O Motor Lógico: Atualização do Saldo da Conta
    # Regra: Se a transação for do tipo CREDIT, o saldo livre da conta NÃO DEVERÁ SER AFETADO, vira só fatura.
    # Regra: Se is_paid = False (provisão futura), o saldo não sofre alteração de Caixa real ainda.
    should_update_balance = (payload.type != TransactionType.CREDIT) and payload.is_paid

    if should_update_balance:
        # Obter a conta de fato para atualizar. RLS nos protege de atualizar conta de terceiros!
        acc_res = db.table("accounts").select("id, balance").eq("id", str(payload.account_id)).execute()
        if acc_res.data:
            account = acc_res.data[0]
            current_balance = float(account["balance"])
            
            # Se a categoria indica Renda, creditamos. Caso contrário (Gasto Fixo, Var ou Transf), debitamos.
            if is_income:
                new_balance = current_balance + transaction_amount
            else:
                new_balance = current_balance - transaction_amount
                
            db.table("accounts").update({"balance": new_balance}).eq("id", str(payload.account_id)).execute()

    return created_txn

@router.get("/", response_model=list[TransactionResponse])
def get_transactions(
    limit: int = 50,
    db: Client = Depends(get_supabase)
):
    """
    Retorna o Feed Histórico de Lançamentos (Isolado por RLS)
    """
    try:
        res = db.table("transactions").select("*").order("transaction_date", desc=True).limit(limit).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: str,
    db: Client = Depends(get_supabase)
):
    """
    Exclui um lançamento (Swipe to Delete via front-end)
    """
    try:
        res = db.table("transactions").delete().eq("id", transaction_id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
