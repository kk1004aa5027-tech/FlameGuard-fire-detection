# router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.share_crud import get_user_by_email
from pydantic import BaseModel
from app.api.share_crud import login_user
from fastapi.responses import JSONResponse
router = APIRouter(prefix="/api")

class LoginSchema(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: LoginSchema, db: Session = Depends(get_db)):
    user = login_user(db, user)

    response = JSONResponse(content={
        "message": "Login successful",
        "user_id": user.user_id,      # 프론트엔드에서 이걸 받게 됨
        "role": user.role             # 역할도 같이
    })
    response.set_cookie(key="user_id", value=str(user.user_id))
    response.set_cookie(key="user_role", value=str(user.role))
    return response
