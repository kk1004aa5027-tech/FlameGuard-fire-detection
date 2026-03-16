from sqlalchemy.orm import Session
from app.api.create_user.schema import create_user_schema
from app.db.models.user import User
from datetime import datetime, timedelta, timezone
from app.utils.password import hash_password

def create_user(db: Session, user: create_user_schema):
#    hashed_password = hash_password(user.password)

    db_user = User(  # ✅ 클래스 이름으로 인스턴스 생성
        email=user.email,
        password=user.password,
        #password=hashed_password,
        name=user.name  # name 필드도 추가로 필요해요
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
