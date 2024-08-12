import os
from typing import List, Optional

import boto3
from datetime import datetime
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session
from ..models import Image as ImageModel, User as UserModel
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


@router.get("/images")
async def get_all_images(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    images = db.query(ImageModel).filter(ImageModel.user_id == current_user.id).all()
    images_json = []

    for image in images:
        file_name_with_extension = os.path.basename(image.s3_key)
        file_extension = os.path.splitext(file_name_with_extension)[1].split('.')[1].lower()
        json = {
            "id": image.id,
            "user_id": image.user_id,
            "file_name": image.file_name,
            "file_size": image.file_size,
            "uploaded_at": image.uploaded_at,
            "description": image.description,
            "tag": image.tag,
            "mime_type": image.mime_type,
            "width": image.width,
            "height": image.height,
            "color_depth": image.color_depth,
            "resolution": image.resolution,
            "exif_data": image.exif_data,
        }

        image_visualization = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': image.s3_key, 'ResponseContentType': 'image/' + file_extension},
            ExpiresIn=3600  # URL válida por 1 hora
        )

        image_download = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': image.s3_key},
            ExpiresIn=3600  # URL válida por 1 hora
        )

        json["file_visualization"] = image_visualization
        json["file_download"] = image_download

        images_json.append(json)

    return images_json


@router.get("/user/{user_id}/images", response_model=List[ImageSchema])
async def get_images(user_id: int, db: Session = Depends(get_db),
                     current_user: UserModel = Depends(get_current_active_user)):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar essas imagens."
        )

    images = db.query(ImageModel).filter(ImageModel.user_id == user_id).all()

    if not images:
        return images

    for image in images:
        file_name_with_extension = os.path.basename(image.s3_key)
        file_extension = os.path.splitext(file_name_with_extension)[1].split('.')[1].lower()

        image_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': image.s3_key, 'ResponseContentType': 'image/' + file_extension},
            ExpiresIn=3600  # A URL assinada será válida por 1 hora
        )
        image.s3_key = image_url

    return images


@router.post("/images", response_model=ImageSchema)
async def upload_image(
        image: UploadFile = File(...),
        description: Optional[str] = Form(None),
        tag: Optional[str] = Form(None),
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_active_user)
):
    content_type = image.content_type
    if not content_type.startswith("image/jpg") and not content_type.startswith(
            "image/jpeg") and not content_type.startswith("image/png") and not content_type.startswith("image/gif"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="O arquivo enviado não é suportado."
        )

    s3_key = f"{current_user.username}/images/{image.filename}"

    try:
        s3_client.upload_fileobj(image.file, bucket_name, s3_key)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload da imagem no S3: {str(e)}"
        )

    try:
        # image_content = await image.read()
        # image_info = ImageUtils.open(BytesIO(image_content))
        # width, height = image_info.size
        # color_depth = image_info.info.get('bits', 8)
        # resolution = f"{width}x{height}"
        # exif_data = image_info.getexif() or {}

        image_model = ImageModel(
            user_id=current_user.id,
            s3_key=s3_key,
            file_name=image.filename,
            file_size=image.size,
            uploaded_at=datetime.utcnow(),
            mime_type=content_type,
            description=description,
            tag=tag
        )

        db.add(image_model)
        db.commit()
        db.refresh(image_model)

        return image_model
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao manipular imagem: {str(e)}"
        )


@router.put("/images/{image_id}", response_model=ImageSchema)
async def update_image(
        image_id: int,
        file: Optional[UploadFile] = File(None),
        description: Optional[str] = Form(None),
        tag: Optional[str] = Form(None),
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_active_user)
):
    try:
        image = db.query(ImageModel).filter(ImageModel.id == image_id).one()

        if image.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para atualizar esta imagem."
            )

        if description is not None:
            image.description = description
        if tag is not None:
            image.tag = tag

        if file:
            content_type = file.content_type
            if not content_type.startswith("image/jpg") and not content_type.startswith(
                    "image/jpeg") and not content_type.startswith("image/png") and not content_type.startswith(
                "image/gif"):
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="O arquivo enviado não é suportado."
                )

            try:
                s3_client.delete_object(Bucket=bucket_name, Key=image.s3_key)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erro ao excluir a imagem antiga do S3: {str(e)}"
                )

            s3_key = f"{current_user.username}/images/{file.filename}"

            try:
                s3_client.upload_fileobj(file.file, bucket_name, s3_key)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erro ao fazer upload da nova imagem no S3: {str(e)}"
                )

            image.s3_key = s3_key
            image.file_name = file.filename
            image.file_size = file.size
            image.mime_type = content_type

        db.commit()
        db.refresh(image)

        return image

    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagem não encontrada."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar a imagem: {str(e)}"
        )


@router.delete("/images/{image_id}", status_code=201)
async def delete_image(
        image_id: int,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_active_user)
):
    try:
        image = db.query(ImageModel).filter(ImageModel.id == image_id).one()

        if image.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para excluir esta imagem."
            )

        try:
            s3_client.delete_object(Bucket=bucket_name, Key=image.s3_key)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao excluir a imagem do S3: {str(e)}"
            )

        db.delete(image)
        db.commit()

        return {"message": "Imagem deletada com sucesso"}

    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagem não encontrada."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir a imagem: {str(e)}"
        )
