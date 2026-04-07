from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from enum import Enum

class AccountType(str, Enum):
    CHECKING = "CHECKING"
    CREDIT = "CREDIT"
    INVESTMENT = "INVESTMENT"
    CASH = "CASH"

class CategoryType(str, Enum):
    INCOME = "INCOME"
    FIXED_EXPENSE = "FIXED_EXPENSE"
    VARIABLE_EXPENSE = "VARIABLE_EXPENSE"
    TRANSFER = "TRANSFER"

class TransactionType(str, Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"
    PIX = "PIX"
    TRANSFER = "TRANSFER"

class RecurrenceFrequency(str, Enum):
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"
    WEEKLY = "WEEKLY"

# --- USERS ---
class UserBase(BaseModel):
    email: str
    is_active: bool = True

class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- ACCOUNTS ---
class AccountCreate(BaseModel):
    name: str # Será criptografado pelo backend antes de salvar no banco
    type: AccountType
    balance: Decimal = Decimal('0.00')
    credit_limit: Optional[Decimal] = None
    statement_closing_day: Optional[int] = Field(None, ge=1, le=31)
    due_day: Optional[int] = Field(None, ge=1, le=31)

class AccountResponse(AccountCreate):
    id: UUID
    user_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- CATEGORIES ---
class CategoryCreate(BaseModel):
    name: str
    type: CategoryType
    color_icon: Optional[str] = None

class CategoryResponse(CategoryCreate):
    id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- INSTALLMENTS ---
class InstallmentCreate(BaseModel):
    account_id: UUID
    total_installments: int = Field(..., gt=0)
    total_amount: Decimal

class InstallmentResponse(InstallmentCreate):
    id: UUID
    user_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- RECURRENCES ---
class RecurrenceCreate(BaseModel):
    account_id: UUID
    category_id: UUID
    description: str
    amount: Decimal
    frequency: RecurrenceFrequency
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True

class RecurrenceResponse(RecurrenceCreate):
    id: UUID
    user_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- TRANSACTIONS ---
class TransactionCreate(BaseModel):
    account_id: UUID
    category_id: UUID
    amount: Decimal
    transaction_date: date
    is_paid: bool = False
    type: TransactionType
    installment_group_id: Optional[UUID] = None
    recurrence_id: Optional[UUID] = None
    description: str
    attachments_url: Optional[str] = None

class TransactionResponse(TransactionCreate):
    id: UUID
    user_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- BUDGETS ---
class BudgetCreate(BaseModel):
    category_id: UUID
    reference_month: date
    planned_amount: Decimal

class BudgetResponse(BudgetCreate):
    id: UUID
    user_id: UUID
    current_spent: Decimal
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- GOALS ---
class GoalCreate(BaseModel):
    name: str
    target_amount: Decimal
    target_date: date

class GoalResponse(GoalCreate):
    id: UUID
    user_id: UUID
    current_saved: Decimal
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

