FROM python:3.11-slim

# SecOps & Optimization: Disable `.pyc` formats and prevent log buffering
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Configurar diretório de trabalho raiz
WORKDIR /app

# Instalar dependências base
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar arquitetura Backend
COPY . .

# Comando Padrão em Produção (Lê env port gerado pelos PaaS dinamicamente ou 8000)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:=8000}"]
