from sqlalchemy.orm import Session
from app.db.models.detection_log import DetectionLog
#5/24수정
from app.db.models.status import Status, FireProgressEnum
from datetime import datetime
import pytz
from fastapi import HTTPException
from app.db.models.user import User

def login_user(db: Session, login_data):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or user.password != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user
def create_detection_log(db: Session, detection_data: dict):
    detections_list = [
        {"class_name": d.class_name, "confidence": d.confidence, "bbox": d.bbox}
        for d in detection_data["detections"]
    ]
    
    #5/24수정
    status = Status(
        description="미확인",
        fire_progress=FireProgressEnum.BEFORE,
        reported_at=None,
    )
    db.add(status)
    db.commit()
    db.refresh(status)

    db_log = DetectionLog(
        file_name=detection_data["file_name"],
        result_image=detection_data["result_image"],
        detections=detections_list,
        message=detection_data["message"],
        has_fire=any(d.class_name == "fire" for d in detection_data["detections"]),
        has_smoke=any(d.class_name == "smoke" for d in detection_data["detections"]),  # ← 추가
        status_id=status.status_id,  # 외래키 연결
        created_at=datetime.now(pytz.timezone("Asia/Seoul")),
    )

    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
