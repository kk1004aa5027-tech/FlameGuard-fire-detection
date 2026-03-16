from app.db.models import User
from sqlalchemy.orm import Session
from fastapi import HTTPException,Response

def create_user(db: Session, user_data):
    user = User(**user_data.dict())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
def login_user(db: Session, login_data, response: Response):  # response 추가
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or user.password != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # ✅ 로그인 성공 시 쿠키 설정
    response.set_cookie(key="user_id", value=str(user.id))
    response.set_cookie(key="user_role", value=str(user.role))  # 1 or 0 (admin or user)

    return {"message": "로그인 성공", "user_id": user.id, "role": user.role}