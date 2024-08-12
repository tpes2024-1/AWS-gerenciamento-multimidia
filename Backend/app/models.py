from datetime import datetime
from typing import Dict

from .database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    profile_image = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    description = Column(String)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)

    images = relationship("Image", back_populates="user")


class File(Base):
    __abstract__ = True

    # Propriedades do arquivo
    s3_key = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    description = Column(Text, nullable=True)
    tag = Column(String, nullable=True)

    def to_dict(self) -> Dict:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Image(File):
    __tablename__ = 'images'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Propriedades da imagem
    mime_type = Column(String, nullable=False)

    # Propriedades específicas da imagem
    width = Column(Integer, nullable=True)  # Largura em pixels
    height = Column(Integer, nullable=True)  # Altura em pixels
    color_depth = Column(Integer, nullable=True)  # Profundidade de cor em bits
    resolution = Column(String, nullable=True)  # DPI (pontos por polegada)
    exif_data = Column(JSONB, nullable=True)  # Armazenar dados EXIF como JSON

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user = relationship("User", back_populates="images")
