from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.board import Board
from app.db.models.user import User
from datetime import datetime
import os
import shutil
from uuid import uuid4
from app.db.models import board as board_model
from app.db.models import user as user_model
from pytz import timezone  # ✅ 추가

router = APIRouter(prefix="/api/board")

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

kst = timezone("Asia/Seoul")  # ✅ 추가

@router.post("/create")
def create_board(
    title: str = Form(...),
    content: str = Form(...),
    user_id: int = Form(...),
    img: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    img_url = None
    if img:
        ext = img.filename.split('.')[-1]
        filename = f"{uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(img.file, buffer)

        img_url = f"/static/uploads/{filename}"

    post = Board(
        title=title,
        content=content,
        user_id=user.user_id,
        created_at=datetime.utcnow(),
        img=img_url
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return {"message": "success"}


@router.get("/list")
def get_boards(db: Session = Depends(get_db)):
    boards = (
        db.query(Board, User)
        .join(User, Board.user_id == User.user_id)
        .order_by(Board.created_at.desc())
        .all()
    )

    return [
        {
            "board_id": board.board_id,
            "title": board.title,
            "content": board.content,
            "created_at": board.created_at.replace(tzinfo=timezone("UTC")).astimezone(kst).isoformat(),  # ✅ 수정
            "img": board.img,
            "user": {
                "name": user.name
            }
        }
        for board, user in boards
    ]


@router.get("/recent")
def get_recent_boards(db: Session = Depends(get_db)):
    recent_boards = (
        db.query(
            Board.board_id,
            Board.title,
            Board.created_at,
            User.name.label("author_name")
        )
        .join(User, Board.user_id == User.user_id)
        .order_by(Board.created_at.desc())
        .limit(3)
        .all()
    )

    return [
        {
            "board_id": row.board_id,
            "title": row.title,
            "created_at": row.created_at.replace(tzinfo=timezone("UTC")).astimezone(kst).isoformat(),  # ✅ 수정
            "author_name": row.author_name,
        }
        for row in recent_boards
    ]
