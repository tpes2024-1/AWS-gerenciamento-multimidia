#!/bin/bash

# Atualizar pacotes
sudo apt-get update -y

# Instalar pacotes essenciais
sudo apt-get install -y \
    build-essential \
    curl \
    git \
    python3-pip \
    python3-venv \
    postgresql-client \

# Configurar o ambiente virtual para o Python
python3 -m venv myenv
source myenv/bin/activate

# Instalar dependências do Python
pip install --upgrade pip
pip install fastapi[all] uvicorn psycopg2-binary python-dotenv

# Clonar seu repositório (substitua pela URL do seu repositório)
git clone https://github.com/tpes2024-1/AWS-gerenciamento-multimidia.git
cd AWS-gerenciamento-multimidia

git checkout develop

# Instalar dependências da aplicação
pip install -r requirements.txt

# Criar o arquivo .env com as variáveis necessárias
echo "SECRET_KEY=1927153dddcf87154da80948228971e802c70349047a48abe090719f0c04a84e
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://postgres:serverstoreAdmin:qP4cTm2\\$#XbPX3#5a!@localhost/postgres
S3_ACCESS_KEY=AKIATCKAR6CDF3KREB7G
S3_SECRET_KEY=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
AWS_BUCKET_NAME=projeto-tpes" > .env

# Configurar o Uvicorn para iniciar a aplicação
echo "[Unit]
Description=Uvicorn instance to serve my FastAPI app
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/seu-repositorio
EnvironmentFile=/home/ubuntu/seu-repositorio/.env
ExecStart=/home/ubuntu/myenv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target" | sudo tee /etc/systemd/system/myapp.service

# Iniciar o serviço da aplicação
sudo systemctl start myapp
sudo systemctl enable myapp
