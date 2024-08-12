import os
from typing import List, Dict, Optional
import boto3
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
import unicodedata
import urllib.parse
from ..models import Image as ImageModel, Audio as AudioModel

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('S3_ACCESS_KEY'),
    aws_secret_access_key=os.getenv('S3_SECRET_KEY')
)
bucket_name = os.getenv('AWS_BUCKET_NAME')


def remove_accents(input_str):
    normalized_str = unicodedata.normalize('NFD', input_str)
    return ''.join(c for c in normalized_str if not unicodedata.combining(c))


def generate_presigned_urls(s3_key: str, file_extension: str) -> Dict[str, str]:
    visualization_url = s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket_name, 'Key': s3_key, 'ResponseContentType': 'image/' + file_extension},
        ExpiresIn=3600  # URL válida por 1 hora
    )
    download_url = s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket_name, 'Key': s3_key},
        ExpiresIn=3600  # URL válida por 1 hora
    )
    return {
        "file_visualization": visualization_url,
        "file_download": download_url
    }


def get_user_files(db: Session, user_id: int) -> Dict[str, List[Dict]]:
    images = db.query(ImageModel).filter(ImageModel.user_id == user_id).all()
    audios = db.query(AudioModel).filter(AudioModel.user_id == user_id).all()  # Implementar consulta para audios
    videos = []  # Implementar consulta para vídeos

    images_json = []
    audios_json = []
    videos_json = []

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

        urls = generate_presigned_urls(image.s3_key, file_extension)
        json.update(urls)
        images_json.append(json)

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

        urls = generate_presigned_urls(audio.s3_key, file_extension)
        json.update(urls)
        audios_json.append(json)

    for video in videos:
        ...

    return {
        "images": images_json,
        "audios": audios_json,
        "videos": videos_json
    }


def search_files_filters(
        db: Session,
        current_user_id: int,
        description: Optional[str] = None,
        tag: Optional[str] = None,
        file_name: Optional[str] = None
) -> Dict[str, List[Dict]]:
    # Consultar imagens
    image_query = db.query(ImageModel).filter(ImageModel.user_id == current_user_id)

    if description:
        image_query = image_query.filter(ImageModel.description.ilike(f"%{description}%"))

    if file_name:
        image_query = image_query.filter(ImageModel.file_name.ilike(f"%{file_name}%"))

    if tag:
        image_query = image_query.filter(ImageModel.tag.ilike(f"%{tag}%"))

    images = image_query.all()

    # Consultar áudios
    audio_query = db.query(AudioModel).filter(AudioModel.user_id == current_user_id)

    if description:
        audio_query = audio_query.filter(AudioModel.description.ilike(f"%{description}%"))

    if file_name:
        audio_query = audio_query.filter(AudioModel.file_name.ilike(f"%{file_name}%"))

    if tag:
        audio_query = audio_query.filter(AudioModel.tag.ilike(f"%{tag}%"))

    audios = audio_query.all()

    # Consultar vídeos (assumindo uma estrutura similar a imagens e áudios)
    # video_query = db.query(VideoModel).filter(VideoModel.user_id == current_user_id)
    #
    # if description:
    #     video_query = video_query.filter(VideoModel.description.ilike(f"%{description}%"))
    #
    # if file_name:
    #     video_query = video_query.filter(VideoModel.file_name.ilike(f"%{file_name}%"))
    #
    # if tag:
    #     video_query = video_query.filter(VideoModel.tag.ilike(f"%{tag}%"))
    #
    # videos = video_query.all()

    # Process results similarly to previous example
    images_json = [image.to_dict() for image in images]
    audios_json = [audio.to_dict() for audio in audios]
    # videos_json = [video.to_dict() for video in videos]

    return {
        "images": images_json,
        "audios": audios_json,
        # "videos": videos_json
    }
