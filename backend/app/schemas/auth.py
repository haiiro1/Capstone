from pydantic import BaseModel, EmailStr, Field
from pydantic.config import ConfigDict


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageOut(BaseModel):
    message: str


class RegisterInit(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class PasswordResetInit(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


# (opcional) Si algún día  quieren devuelvolver al user junto con el token:
# class AuthResponse(TokenOut):
#     user: UserOut
#     model_config = ConfigDict(from_attributes=True)
