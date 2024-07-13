import base64
from datetime import datetime, timedelta
import os
from typing import Optional
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas import User
from ..models import User as UserModel
from ..security import get_password_hash, get_current_active_user
import shutil

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

    
@router.post("/register", response_model=User)
async def register_user(
    username: str = Form(...),
    email: str = Form(...),
    full_name: str = Form(...),
    password: str = Form(...),
    profile_image: Optional[UploadFile] = File(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    db_user = db.query(UserModel).filter(UserModel.username == username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome de usuário já registrado",
        )

    hashed_password = get_password_hash(password)
    
    image_path = None
    if profile_image:
        if profile_image.content_type.lower() not in ('image/jpeg', 'image/png'):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Somente arquivos JPEG ou PNG são suportados para a imagem de perfil",
            )
        
        image_path = f"profile_images/{username}_{profile_image.filename}"
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(profile_image.file, buffer)
    
    db_user = UserModel(
        username=username,
        email=email,
        full_name=full_name,
        profile_image=image_path,
        hashed_password=hashed_password,
        description=description,
        created_at=datetime.utcnow()-timedelta(hours=3)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    user_data = {
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "created_at": current_user.created_at,
        "disabled": current_user.disabled
    }

    if current_user.profile_image:
        image_path = current_user.profile_image
        if os.path.exists(image_path):
            with open(image_path, "rb") as f:
                image_data = f.read()
                image_base64 = base64.b64encode(image_data).decode('utf-8')
                user_data["profile_image"] = image_base64

    return user_data

@router.get("/users/me/items")
async def read_users_me_items(current_user: User = Depends(get_current_active_user)):
    return [{"item_id": 1, "owner": current_user.username, "title": "Item Teste"}]
