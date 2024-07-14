import os

from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = f"postgresql://{os.getenv('USER_RDS')}:{os.getenv('PASSWORD_RDS')}@projetotpes.cv4cgo8m627y.sa-east-1.rds.amazonaws.com:5432/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Criação das tabelas no banco de dados
Base.metadata.create_all(bind=engine)
