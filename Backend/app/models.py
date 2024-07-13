from datetime import datetime
from .database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    profile_image = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    description = Column(String)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)
