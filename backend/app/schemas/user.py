# app/schemas/user.py
from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(min_length=1, max_length=120)
    last_name:  str = Field(min_length=1, max_length=120)

class UserCreate(UserBase):
    password: str = Field(min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    company: Optional[str] = None
    location: Optional[str] = None
    crops: Optional[List[str]] = None
    avatar_url: Optional[str] = None  # Se calcula desde avatar_path en el router
    model_config = ConfigDict(from_attributes=True)

class UserProfileUpdate(BaseModel):
    # todos opcionales; solo se actualiza lo enviado
    company: Optional[str] = Field(default=None, max_length=120)
    location: Optional[str] = Field(default=None, max_length=120)
    crops: Optional[List[str]] = None
