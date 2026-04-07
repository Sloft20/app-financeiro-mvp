-- Enums
CREATE TYPE account_type AS ENUM ('CHECKING', 'CREDIT', 'INVESTMENT', 'CASH');
CREATE TYPE category_type AS ENUM ('INCOME', 'FIXED_EXPENSE', 'VARIABLE_EXPENSE', 'TRANSFER');
CREATE TYPE transaction_type AS ENUM ('DEBIT', 'CREDIT', 'PIX', 'TRANSFER');
CREATE TYPE recurrence_frequency AS ENUM ('MONTHLY', 'YEARLY', 'WEEKLY');

-- 1. Tabela de Users (Vinculada ao auth do Supabase)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Criptografado em nível de aplicação
    type account_type NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    credit_limit DECIMAL(15, 2),
    statement_closing_day INT,
    due_day INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Null = Default do sistema
    name TEXT NOT NULL,
    type category_type NOT NULL,
    color_icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Installments
CREATE TABLE installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    total_installments INT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Recurrences (Assinaturas Frequentes)
CREATE TABLE recurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    frequency recurrence_frequency NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE, -- Null se infinito
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE NOT NULL,
    type transaction_type NOT NULL,
    installment_group_id UUID REFERENCES installments(id) ON DELETE SET NULL,
    recurrence_id UUID REFERENCES recurrences(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    attachments_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Budgets
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    reference_month DATE NOT NULL,
    planned_amount DECIMAL(15, 2) NOT NULL,
    current_spent DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabela de Goals
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    target_date DATE NOT NULL,
    current_saved DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITANDO RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS (Garantindo Isolamento TOTAL)

-- Users (Cada usuário só vê/mexe nos próprios dados)
CREATE POLICY "Users can only view and manage their own record" ON users
  FOR ALL USING (auth.uid() = id);

-- Accounts
CREATE POLICY "Users can fully manage their own accounts" ON accounts
  FOR ALL USING (auth.uid() = user_id);

-- Categories (Global se user_id nulo, Gerenciado se igual ao uid)
CREATE POLICY "Users can view default categories and manage own" ON categories
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can fully manage their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Installments
CREATE POLICY "Users can fully manage their own installments" ON installments
  FOR ALL USING (auth.uid() = user_id);

-- Recurrences
CREATE POLICY "Users can fully manage their own recurrences" ON recurrences
  FOR ALL USING (auth.uid() = user_id);

-- Budgets
CREATE POLICY "Users can fully manage their own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- Goals
CREATE POLICY "Users can fully manage their own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);
