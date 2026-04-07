---
description: Scaffolding Inicial do Repositório (Monorepo) Next.js e FastAPI
---

# 01. Setup do Monorepo App-Financeiro

## Objetivo
Inicializar o repositório no formato "Monorepo", separando rigorosamente a camada de UX e Componentes (Frontend Next.js) da camada de Segurança, APIs e Motor Lógico Python (Backend FastAPI). O setup também garante os artefatos base para integração com Supabase.

## Arquitetura Relacionada
- **Stack Frontend:** Next.js, React, Tailwind CSS, Framer Motion, Zustand.
- **Stack Backend:** Python (FastAPI), Supabase (PostgreSQL, Auth, RLS).
- **Tipo PWA:** Frontend preparado para Progressive Web App (Mobile-First).

## Steps para Execução pelo Agente / Scripts

### Passo 1: Inicializar Camada de Frontend (Next.js)
1. Rodar commando assíncrono para criação do app via `npx` direcionado para a pasta `/frontend` na raiz do repositório (`App-Financeiro/frontend`).
   - Comando sugerido: `npx -y create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
2. Instalar bibliotecas obrigatórias baseadas nos requisitos (Gamificação e Estado):
   - Comando: `npm install framer-motion zustand @supabase/supabase-js lucide-react` (dentro da pasta `frontend/`).
3. (Secundário) Organizar a estrutura base do Next.js substituindo a página `page.tsx` padrão e o estilo inicial, limpando o boilerplate default.

### Passo 2: Inicializar Camada de Backend (FastAPI Python)
1. Instanciar a pasta `/backend` na raiz do repositório (`App-Financeiro/backend`).
2. Criar ambiente virtual local (Venv).
3. Configurar arquivo de dependências limpas em `requirements.txt`:
   ```txt
   fastapi
   uvicorn
   supabase
   pydantic
   cryptography
   python-dotenv
   ```
4. Criar estrutura interna de organização em `/backend`:
   - `/api` - Recebe e provê os roteadores (endpoints HTTP).
   - `/core` - Utilitários de Segurança e Setup de App.
   - `/execution` - Os scripts determinísticos cruciais para a inteligência de processamento das transações.
   - `/models` - Definições dos esquemas e tipagens.
5. Criar o entrypoint mínimo da API `backend/main.py`.

### Passo 3: Configurações de Ambiente (SecOps)
1. Criar o artefato `.env.example` espelhando a infraestrutura para que o usuário saiba como povoar o seu `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ENCRYPTION_SECRET_KEY`

## Outputs Esperados
- Sistema gerado localmente pronto para servir o `npm run dev` no Frontend, e uvicorn (`uvicorn main:app --reload`) no Backend sem travamentos.
- Pastas estruturadas seguindo a divisão rígida Monorepo.

> NOTA: Esta SOP reflete somente o esqueleto base de arquivos e a infraestrutura. Configurações finais de deployment ou testes de integração ao Supabase Auth ocorrerão em SOPs de Integração subsequentes.
