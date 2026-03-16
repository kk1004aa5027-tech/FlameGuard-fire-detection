from sqlalchemy.orm import Session, load_only
from app.db.models.user import User as user_model
from app.db.models.user import User
from fastapi import HTTPException
# common crud
def get_user_by_email(db: Session, email: str):
    return (
        db.query(user_model)
        .options(
            load_only(
                user_model.email,
            )
        )
        .filter(user_model.email == email)
        .first()
    )
def login_user(db: Session, login_data):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or user.password != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user