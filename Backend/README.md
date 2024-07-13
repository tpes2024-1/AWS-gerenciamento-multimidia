# Backend Gerenciamento Multimídia

## Configurando o projeto
1. Crie um ambiente virtual `venv`.
~~~sh
python -m venv venv
.\venv\Scripts\activate
~~~
2. Instale as depedências.
~~~sh
pip install -r requirements.txt
~~~
3. Crie um arquivo ``.env`` na raiz do projeto contendo o seguinte.
~~~sh
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
~~~

## Executando o projeto
Dentro da pasta ``app`` do projeto escreva o seguinte comando no terminal: 
```sh
uvicorn app.main:app --reload
```
> Caso o dê algum erro, execute os comandos a seguir 
```sh
set PYTHONPATH=.
uvicorn app.main:app --reload
```

## Docs
Para acessar a documentação dos endpoints da API pelo swagger.
> localhost:8000/docs#/

No momento a API ainda usa um banco de dados local.