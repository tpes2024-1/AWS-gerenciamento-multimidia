import os
from typing import List, Optional, Dict

import boto3
from datetime import datetime
from fastapi import APIRouter, Depends, Form, HTTPException, status, UploadFile, File, Query
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session
from ..models import User as UserModel
from .users import get_current_active_user
from ..utils import get_user_files, search_files_filters

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


@router.get("/files")
async def get_all_files(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    files = get_user_files(db, current_user.id)
    return files


@router.get("/files/")
async def search_files(description: Optional[str] = Query(None),
                       tag: Optional[str] = Query(None),
                       file_name: Optional[str] = Query(None), db: Session = Depends(get_db),
                       current_user: UserModel = Depends(get_current_active_user)):
    files = search_files_filters(db, current_user.id, description, tag, file_name)
    return files

