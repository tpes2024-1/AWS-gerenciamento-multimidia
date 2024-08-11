import os
from typing import List, Optional

import boto3
from datetime import datetime
from PIL import Image as ImageUtils
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..models import Image as ImageModel, File as FileModel, User as UserModel
from ..schemas import ImageSchema
from .users import get_current_active_user

from ..database import SessionLocal

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


@router.get("/images", response_model=List[ImageSchema])
async def get_all_images(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    # Recupera todas as imagens do banco de dados
    images = db.query(ImageModel).filter(ImageModel.user_id == current_user.id).all()

    # Gera URLs assinadas para cada imagem
    # for image in images:
    #     file_name_with_extension = os.path.basename(image.s3_key)
    #     file_extension = os.path.splitext(file_name_with_extension)[1].split('.')[1].lower()
    #
    #     image_url = s3_client.generate_presigned_url(
    #         'get_object',
    #         Params={'Bucket': bucket_name, 'Key': image.file_name, 'ResponseContentType': 'image/' + file_extension},
    #         ExpiresIn=3600  # URL válida por 1 hora
    #     )
    #     image.file_name = image_url  # Substitui o caminho do arquivo pela URL assinada

    return images


@router.get("/user/{user_id}/images", response_model=List[ImageSchema])
async def get_images(user_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar essas imagens."
        )

    # Obtém as imagens do usuário
    images = db.query(ImageModel).filter(ImageModel.user_id == user_id).all()

    if not images:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma imagem encontrada para este usuário."
        )

    # Gera URLs assinadas para cada imagem
    for image in images:
        image_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': image.file_name},
            ExpiresIn=3600  # A URL assinada será válida por 1 hora
        )
        image.file_name = image_url

    return images


@router.post("/images", response_model=ImageSchema)
async def upload_image(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_active_user)
):
    content_type = file.content_type
    if not content_type.startswith("image/jpg") or not content_type.startswith("image/jpeg") or not content_type.startswith("image/png") or not content_type.startswith("image/gif"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="O arquivo enviado não é uma imagem."
        )

    # Gerar chave para o arquivo no S3
    s3_key = f"{current_user.username}/images/{file.filename}"

    try:
        s3_client.upload_fileobj(file.file, bucket_name, s3_key)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload da imagem no S3: {str(e)}"
        )

    # Extrai informações da imagem
    image = ImageUtils.open(file)
    width, height = image.size
    color_depth = image.info.get('bits', 8)
    resolution = f"{width}x{height}"
    exif_data = image.getexif() or {}

    # Cria o objeto ImageModel e salva no banco de dados
    image = ImageModel(
        user_id=current_user.id,
        file=s3_key,
        file_size=file.size,
        uploaded_at=datetime.utcnow(),
        mime_type=content_type,
        description=description,
        tags=tags,
        width=width,
        height=height,
        color_depth=color_depth,
        resolution=resolution,
        exif_data=exif_data
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return image
