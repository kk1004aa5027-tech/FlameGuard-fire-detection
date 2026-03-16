from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any, Optional

# common schema
class User(BaseModel):
    user_id: int
    email: str
    name:str
    password: str
    role: str

    class Config:
        from_attributes = True



class DetectionLog(BaseModel):
    id: int
    file_name: Optional[str] = None
    result_image: Optional[str] = None
    detections: List[Dict[str, Any]]
    message: str

    has_fire: bool
    has_smoke : bool
    created_at: datetime

    class Config:
        orm_mode = True
