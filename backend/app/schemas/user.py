# app/schemas/user.py
from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict, constr, field_validator

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
    theme: str
    company: Optional[str] = None
    location: Optional[str] = None
    crops: Optional[List[str]] = None
    avatar_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

ThemeStr = constr(to_lower=True, strip_whitespace=True, min_length=4, max_length=6)
class ThemeUpdate(BaseModel):
    theme: ThemeStr = Field(..., description="light | dark | system")
    @field_validator("theme")
    @classmethod
    def _valid(cls, v: str):
        if v not in {"light", "dark", "system"}:
            raise ValueError("theme must be one of {'light','dark','system'}")
        return v

class UserProfileUpdate(BaseModel):
    # todos opcionales; solo se actualiza lo enviado
    company: Optional[str] = Field(default=None, max_length=120)
    location: Optional[str] = Field(default=None, max_length=120)
    crops: Optional[List[str]] = None
