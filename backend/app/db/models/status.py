from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    JSON,
    ForeignKey,
    Enum,
)
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.db.database import Base
import pytz
import enum
from sqlalchemy.orm import relationship

# 화재 진행 상태를 Enum으로 정의
class FireProgressEnum(str, enum.Enum):
    BEFORE = "발생 전"
    ACTIVE = "진행 중"
    SUPPRESSING = "진화 중"
    ENDED = "종료됨"

class Status(Base):
    __tablename__ = "status"
    status_id = Column(Integer, primary_key=True)
    description = Column(String)
    fire_progress = Column(String)
    reported_at = Column(DateTime, default=datetime.utcnow)
    detection_logs = relationship("DetectionLog", back_populates="status")