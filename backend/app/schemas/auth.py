from pydantic import BaseModel
from pydantic.config import ConfigDict


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageOut(BaseModel):
    message: str


# (opcional) Si algún día  quieren devuelvolver al user junto con el token:
# class AuthResponse(TokenOut):
#     user: UserOut
#     model_config = ConfigDict(from_attributes=True)
