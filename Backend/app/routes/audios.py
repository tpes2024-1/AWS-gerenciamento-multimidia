import os
from io import BytesIO
from typing import List, Optional

import boto3
from datetime import datetime
from mutagen import File as MutagenFile
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session
from ..models import User as UserModel, Audio as AudioModel
from ..schemas import AudioSchema
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


@router.get("/audios")
async def get_all_audios(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    audios = db.query(AudioModel).filter(AudioModel.user_id == current_user.id).all()
    audios_json = []

    for audio in audios:
        file_name_with_extension = os.path.basename(audio.s3_key)
        file_extension = os.path.splitext(file_name_with_extension)[1].split('.')[1].lower()
        json = {
            "id": audio.id,
            "user_id": audio.user_id,
            "file_name": audio.file_name,
            "file_size": audio.file_size,
            "uploaded_at": audio.uploaded_at,
            "description": audio.description,
            "tag": audio.tag,
            "mime_type": audio.mime_type,
            "duration": audio.duration,
            "bitrate": audio.bitrate,
            "sample_rate": audio.sample_rate,
            "channels": audio.channels,
        }

        audio_visualization = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': audio.s3_key, 'ResponseContentType': 'audio/' + file_extension},
            ExpiresIn=3600  # URL válida por 1 hora
        )

        audio_download = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': audio.s3_key},
            ExpiresIn=3600  # URL válida por 1 hora
        )

        json["file_visualization"] = audio_visualization
        json["file_download"] = audio_download

        audios_json.append(json)

    return audios_json


@router.post("/audios", response_model=AudioSchema)
async def upload_audio(
        audio: UploadFile = File(...),
        description: Optional[str] = Form(None),
        tag: Optional[str] = Form(None),
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_active_user)
):
    content_type = audio.content_type
    if (not content_type.startswith("audio/mp3") and not content_type.startswith(
            "audio/wav") and not content_type.startswith("audio/ogg")
            and not content_type.startswith("audio/flac") and not content_type.startswith("audio/mpeg")):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="O arquivo enviado não é suportado."
        )

    s3_key = f"{current_user.username}/audios/{audio.filename}"

    audio_info = MutagenFile(audio.file)

    duration = audio_info.info.length
    bitrate = audio_info.info.bitrate
    sample_rate = audio_info.info.sample_rate
    channels = audio_info.info.channels

    try:
        s3_client.upload_fileobj(audio.file, bucket_name, s3_key)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload do audio no S3: {str(e)}"
        )

    try:
        audio_model = AudioModel(
            user_id=current_user.id,
            s3_key=s3_key,
            file_name=audio.filename,
            file_size=audio.size,
            uploaded_at=datetime.utcnow(),
            mime_type=content_type,
            description=description,
            tag=tag,
            duration=duration,
            bitrate=bitrate,
            sample_rate=sample_rate,
            channels=channels
        )

        db.add(audio_model)
        db.commit()
        db.refresh(audio_model)

        return audio_model
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao manipular audio: {str(e)}"
        )


@router.put("/audios/{audio_id}", response_model=AudioSchema)
async def update_audio(
        audio_id: int,
        file: Optional[UploadFile] = File(None),
        description: Optional[str] = Form(None),
        tag: Optional[str] = Form(None),
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_active_user)
):
    try:
        audio = db.query(AudioModel).filter(AudioModel.id == audio_id).one()

        if audio.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para atualizar este audio."
            )

        if description is not None:
            audio.description = description
        if tag is not None:
            audio.tag = tag

        if file:
            content_type = file.content_type
            if (not content_type.startswith("audio/mp3") and not content_type.startswith(
                    "audio/wav") and not content_type.startswith("audio/ogg")
                    and not content_type.startswith("audio/flac") and not content_type.startswith("audio/mpeg")):
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="O arquivo enviado não é suportado."
                )

            try:
                s3_client.delete_object(Bucket=bucket_name, Key=audio.s3_key)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erro ao excluir o audio antigo do S3: {str(e)}"
                )

            s3_key = f"{current_user.username}/audios/{file.filename}"

            try:
                s3_client.upload_fileobj(file.file, bucket_name, s3_key)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erro ao fazer upload da nova imagem no S3: {str(e)}"
                )

            audio_info = MutagenFile(file)

            duration = audio_info.info.length
            bitrate = audio_info.info.bitrate
            sample_rate = audio_info.info.sample_rate
            channels = audio_info.info.channels

            audio.s3_key = s3_key
            audio.file_name = file.filename
            audio.file_size = file.size
            audio.mime_type = content_type
            audio.duration = duration
            audio.bitrate = bitrate
            audio.sample_rate = sample_rate
            audio.channels = channels

        db.commit()
        db.refresh(audio)

        return audio

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


@router.delete("/audios/{audio_id}", status_code=201)
async def delete_audio(
        audio_id: int,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_active_user)
):
    try:
        audio = db.query(AudioModel).filter(AudioModel.id == audio_id).one()

        if audio.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para excluir este audio."
            )

        try:
            s3_client.delete_object(Bucket=bucket_name, Key=audio.s3_key)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao excluir o audio do S3: {str(e)}"
            )

        db.delete(audio)
        db.commit()

        return {"message": "Audio deletado com sucesso"}

    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio não encontrado."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir o audio: {str(e)}"
        )