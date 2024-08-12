import os
from typing import List, Dict, Optional
import boto3
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from ..models import Image as ImageModel

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('S3_ACCESS_KEY'),
    aws_secret_access_key=os.getenv('S3_SECRET_KEY')
)
bucket_name = os.getenv('AWS_BUCKET_NAME')


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
    audios = []  # Implementar consulta para audios
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
        ...

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
    filters = [ImageModel.user_id == current_user_id]  # add consultas de current_user_id pra audio e video

    if description:
        filters.append(or_(
            ImageModel.description.ilike(f"%{description}%"),
            # AudioModel.description.ilike(f"%{description}%"),
            # VideoModel.description.ilike(f"%{description}%")
        ))

    if tag:
        filters.append(or_(
            ImageModel.tag.ilike(f"%{tag}%"),
            # AudioModel.tag.ilike(f"%{tag}%"),
            # VideoModel.tag.ilike(f"%{tag}%")
        ))

    if file_name:
        filters.append(or_(
            ImageModel.file_name.ilike(f"%{file_name}%"),
            # AudioModel.file_name.ilike(f"%{file_name}%"),
            # VideoModel.file_name.ilike(f"%{file_name}%")
        ))

    query_filter = and_(*filters)

    images = db.query(ImageModel).filter(query_filter).all()
    # audios = db.query(AudioModel).filter(query_filter).all()
    # videos = db.query(VideoModel).filter(query_filter).all()

    # Process results similarly to previous example
    images_json = [image.to_dict() for image in images]
    # audios_json = [audio.to_dict() for audio in audios]
    # videos_json = [video.to_dict() for video in videos]

    return {
        "images": images_json,
        # "audios": audios_json,
        # "videos": videos_json
    }
