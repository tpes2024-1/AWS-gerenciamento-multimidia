from fastapi import File, UploadFile
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str
    
class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: Optional[datetime] = None
    description: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
