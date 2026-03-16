from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.db.database import get_db
from .schema import UserCreate, UserLogin
from .crud import create_user, login_user

router = APIRouter(prefix="/api")

@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@router.post("/login")
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    return login_user(db, user, response)
