from sqlalchemy import Column, Integer, String
from app.db.database import Base
from sqlalchemy.orm import relationship 
class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="user")
    boards = relationship("Board", back_populates="user")
