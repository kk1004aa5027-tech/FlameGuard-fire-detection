from pydantic import BaseModel
from typing import Optional
from datetime import datetime
class BoardCreate(BaseModel):
    title: str
    content: str
    user_id: int
    img: Optional[str] = None


class BoardResponse(BaseModel):
    board_id: int
    title: str
    content: str
    created_at: datetime
    img: Optional[str]
    user_id: int

    class Config:
        orm_mode = True
