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