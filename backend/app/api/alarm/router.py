# app/api/alarm/router.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.detection_log import DetectionLog
from app.db.models.status import Status

router = APIRouter()

from sqlalchemy.orm import joinedload

@router.get("/api/alarm/list")
def get_alarm_list(db: Session = Depends(get_db)):
    results = (
        db.query(DetectionLog)
        .options(joinedload(DetectionLog.status))
        .order_by(DetectionLog.created_at.desc())
        .all()
    )

    return [
        {
            "message": log.message,
            "created_at": log.created_at.strftime("%Y-%m-%d %H:%M"),
            "result_image": log.result_image,
            "status_id": log.status_id,
            "status": {
                "status_id": log.status.status_id if log.status else None,
                "description": log.status.description if log.status else None,
                "fire_progress": log.status.fire_progress if log.status else None,
                "updated_at": log.status.reported_at.strftime("%Y-%m-%d %H:%M") if log.status and log.status.reported_at else None
            }
        }
        for log in results
    ]
@router.get("/api/alarm/latest")
def get_latest_alarms(db: Session = Depends(get_db)):
    results = (
        db.query(DetectionLog)
        .options(joinedload(DetectionLog.status))
        .filter(DetectionLog.message != "safe")
        .order_by(DetectionLog.created_at.desc())
        .limit(3)
        .all()
    )

    return [
        {
            "message": log.message,
            "created_at": log.created_at.strftime("%Y-%m-%d %H:%M"),
            "result_image": log.result_image,
            "status_id": log.status_id,
            "status": {
                "status_id": log.status.status_id if log.status else None,
                "description": log.status.description if log.status else None,
                "fire_progress": log.status.fire_progress if log.status else None,
                "updated_at": log.status.reported_at.strftime("%Y-%m-%d %H:%M") if log.status and log.status.reported_at else None
            }
        }
        for log in results
    ]
