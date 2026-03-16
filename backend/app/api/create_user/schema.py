from pydantic import BaseModel

class create_user_schema(BaseModel):
    name: str 
    email: str
    password: str
