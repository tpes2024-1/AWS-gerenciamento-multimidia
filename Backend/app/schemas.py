from fastapi import File, UploadFile
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, List
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
    id: int
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


class FileSchema(BaseModel):
    s3_key: str
    file_name: str
    file_size: int
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    description: Optional[str]
    tag: Optional[str]


class ImageSchema(FileSchema):
    id: int
    user_id: int
    mime_type: str

    width: Optional[int] = None  # Largura em pixels
    height: Optional[int] = None  # Altura em pixels
    color_depth: Optional[int] = None  # Profundidade de cor em bits
    resolution: Optional[str] = None  # DPI (pontos por polegada)
    exif_data: Optional[Dict[str, Optional[str]]] = None  # Dados EXIF como JSON
