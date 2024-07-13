from typing import Dict
from .database import Base
from sqlalchemy import Boolean, Column, Integer, String
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    disabled = Column(Boolean, default=False)


""" 
db: Dict[str, dict] = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "john@gmail.com",
        "hashed_password": "$2b$12$/4we3oYJ5Zjr77UcYPSJNOsjxPUJIxGMufZfgBa3fIYHcztQNQIJq",
        "disabled": False
    }
} """