import os
import hashlib
from itsdangerous import URLSafeTimedSerializer
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

SECRET_KEY = os.getenv("ITDS_SECRET_KEY")
EMAIL_TOKEN_SALT = "verification-mail-v1"
EMAIL_TOKEN_MAX_AGE = 60 * 60 * 24

serializer = URLSafeTimedSerializer(SECRET_KEY)
_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return _pwd.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd.verify(plain, hashed)


def digest_hash(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def needs_update(hashed: str) -> bool:
    return _pwd.needs_update(hashed)


def make_email_token(payload: dict) -> str:
    return serializer.dumps(payload, salt=EMAIL_TOKEN_SALT)


def load_email_token(token: str) -> dict:
    return serializer.loads(token, salt=EMAIL_TOKEN_SALT, max_age=EMAIL_TOKEN_MAX_AGE)


def create_access_token(sub: str, *, expires_minutes: int | None = None) -> str:
    now = datetime.now(timezone.utc)
    exp_minutes = expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    payload = {"sub": sub, "iat": now, "exp": now + timedelta(minutes=exp_minutes)}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Lanza JWTError si es inválido/expirado."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
