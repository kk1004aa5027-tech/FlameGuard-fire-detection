from fastapi import APIRouter,  Depends, HTTPException
from app.db.database import get_db
from sqlalchemy.orm import Session
from app.api.create_user.crud import create_user as create_user_crud
from app.api.share_crud import get_user_by_email
from app.api.create_user.schema import create_user_schema
from app.api.share_schema import User as user_schema

router = APIRouter(prefix="/api") 

@router.post("/signup", response_model=user_schema)
async def create_user(user: create_user_schema, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    result = create_user_crud(db=db, user=user)
    # sendEmailResult = await send_email(to_addresses=[result.email], subject="이메일 인증", html_body=result.validation_number)
    # print("sendEmailResult check: ",sendEmailResult)
    return result
