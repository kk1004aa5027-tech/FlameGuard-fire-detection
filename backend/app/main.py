from typing import Union 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import importlib
import pkgutil
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine, Base, SessionLocal  # SessionLocal 추가
from app.db.models import (
    user as user_model,
    session as session_model,
    detection_log as detection_log_model,
)

from fastapi.staticfiles import StaticFiles

def init_db():
    Base.metadata.create_all(bind=engine)
    
from contextlib import asynccontextmanager

# 실행시 관리자 계정 생성
def create_admin():
    db = SessionLocal()
    try:
        existing_admin = db.query(user_model.User).filter(user_model.User.role == "admin").first()
        if not existing_admin:
            admin_user = user_model.User(
            name="Admin",
            email="admin@gmail.com",
            password="123456789asdf!",  
            role="admin"
            )
            
            db.add(admin_user)
            db.commit()
            print("✅ Admin account created.")
        else:
            print("ℹ️ Admin account already exists.")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    create_admin()  # 관리자 계정 생성 추가
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "Welcome to FlameGuard API!"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_dir = Path(__file__).parent / "api"

# auto import router
for api in api_dir.iterdir():
    if api.is_dir():  # folder(each endpoint)
        router_module = f"app.api.{api.name}.router"
        try:
            module = importlib.import_module(router_module)
            if hasattr(module, "router"):
                app.include_router(module.router)
                print(f"✅ router added: {router_module}")  # debug
        except ModuleNotFoundError:
            if api.name == "__pycache__" or api.name == "__init__":
                continue
            print(f"⚠️ {router_module} not found (router.py is missing)")

# serve log folder as static files
BASE_DIR = Path(__file__).resolve().parent.parent  # backend 폴더 기준

log_directory = BASE_DIR / "log"
log_directory.mkdir(parents=True, exist_ok=True)

app.mount("/log", StaticFiles(directory=str(log_directory)), name="log")
# log 폴더가 없으면 생성
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

app.mount("/log", StaticFiles(directory=log_directory), name="log")
upload_directory = os.path.join(os.path.dirname(__file__), "static", "uploads")
if not os.path.exists(upload_directory):
    os.makedirs(upload_directory)

app.mount("/static/uploads", StaticFiles(directory=upload_directory), name="uploads")
temp_directory = r"C:\FlameGurad\FlameGuard\backend\app\temp"

if not os.path.exists(temp_directory):
    os.makedirs(temp_directory)

app.mount("/temp", StaticFiles(directory=temp_directory), name="temp")
from app.api.alarm.router import router as alarm_router
from app.api.status.router import router as status_router
app.include_router(alarm_router)
app.include_router(status_router)