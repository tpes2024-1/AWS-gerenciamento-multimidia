import base64
import os
from datetime import datetime, timedelta
from typing import Optional

import boto3
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import User as UserModel
from ..schemas import User
from ..security import get_password_hash, get_current_active_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('S3_ACCESS_KEY'),
    aws_secret_access_key=os.getenv('S3_SECRET_KEY')
)

bucket_name = os.getenv('AWS_BUCKET_NAME')


@router.post("/register")
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

    image_key = None
    if profile_image:
        if profile_image.content_type.lower() not in ('image/jpeg', 'image/png'):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Somente arquivos JPEG ou PNG são suportados para a imagem de perfil",
            )

        image_key = f"{username}/profile/{profile_image.filename}"

        try:
            s3_client.upload_fileobj(profile_image.file, bucket_name, image_key)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao fazer upload da imagem no S3: {str(e)}"
            )

    db_user = UserModel(
        username=username,
        email=email,
        full_name=full_name,
        profile_image=image_key,
        hashed_password=hashed_password,
        description=description,
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {"message": "Usuário registrado com sucesso."}


@router.get("/users/me", response_model=User)
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    user_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "description": current_user.description,
        "created_at": current_user.created_at,
        "disabled": current_user.disabled
    }

    if current_user.profile_image:
        file_name_with_extension = os.path.basename(current_user.profile_image)
        file_extension = os.path.splitext(file_name_with_extension)[1].split('.')[1].lower()

        try:
            image_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket_name, 'Key': current_user.profile_image,
                        'ResponseContentType': 'image/' + file_extension},
                ExpiresIn=3600
            )

            user_data["profile_image"] = image_url
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao gerar URL pré-assinada para a imagem: {str(e)}"
            )
    else:
        user_data["profile_image"] = None

    return user_data


""" # Só teste
@router.get("/users/me/items")
async def read_users_me_items(current_user: User = Depends(get_current_active_user)):
    return [{"item_id": 1, "owner": current_user.username, "title": "Item Teste"}] """
