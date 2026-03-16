from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.status import Status
from app.db.models.user import User  # user model
from datetime import datetime
import pytz

router = APIRouter()

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="로그인 필요")

    user = db.query(User).filter(User.user_id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자 없음")
    return user
@router.put("/api/status/update")
def update_status(
    status_data: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ✅ 숫자로 저장된 경우도 대비해서 문자열로 변환 후 비교
    if str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="관리자만 수정할 수 있습니다.")

    status_id = status_data.get("status_id")
    description = status_data.get("description")
    fire_progress = status_data.get("fire_progress")

    if not status_id:
        raise HTTPException(status_code=400, detail="status_id는 필수입니다.")

    status = db.query(Status).filter(Status.status_id == status_id).first()
    if not status:
        raise HTTPException(status_code=404, detail="해당 상태를 찾을 수 없습니다.")

    # ✅ 로그 찍어보기
    print(f"🔧 관리자 수정 요청: status_id={status_id}, description={description}, progress={fire_progress}")

    status.description = description
    status.fire_progress = fire_progress
    status.reported_at = datetime.now(pytz.timezone("Asia/Seoul"))
    
    db.commit()

    return {"success": True, "message": "상태 정보가 수정되었습니다."}