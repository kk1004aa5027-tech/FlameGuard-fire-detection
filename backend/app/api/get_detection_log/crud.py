from sqlalchemy.orm import Session
from app.db.models.detection_log import DetectionLog
import json
from sqlalchemy import desc
from typing import Optional


def get_detection_logs(
    db: Session, skip: int = 0, limit: int = 15, filter: Optional[str] = None
):
    query = db.query(DetectionLog)

    if filter:
        # SQLite에서는 JSON_ARRAY_CONTAINS 같은 함수가 없으므로
        # has_fire 컬럼을 활용하여 fire 필터링
        if filter == "fire":
            query = query.filter(DetectionLog.has_fire == True)
        elif filter == "smoke":
            query = query.filter(DetectionLog.has_smoke == True)  # ← 이렇게 수정!

        # 다른 클래스에 대한 필터링이 필요한 경우
        # JSON 문자열에서 class_name을 검색  
        else:
            query = query.filter(
                DetectionLog.detections.like(f'%"class_name": "{filter}"%')
            )

    logs = query.order_by(desc(DetectionLog.created_at)).offset(skip).limit(limit).all()

    # JSON 문자열을 파이썬 객체로 변환
    for log in logs:
        if isinstance(log.detections, str):
            try:
                log.detections = json.loads(log.detections)
            except json.JSONDecodeError:
                log.detections = []
    return logs


def get_total_detection_logs_count(db: Session) -> int:
    return db.query(DetectionLog).count()
