# Login, register, refresh, logout
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from urllib.parse import urljoin

from app.schemas.user import UserCreate, UserLogin, UserOut
from app.schemas.auth import TokenOut, MessageOut
from app.db.session import SessionLocal
from app.db.models import User
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# DB session dep
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# OAuth2 bearer (para leer Authorization: Bearer <token>)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        data = decode_token(token)
        user_id = data.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user = db.get(User, user_id)  # SQLAlchemy 1.4+/2.0
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


# Endpoints


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="El email ya está registrado.")

    user = User(
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user: User | None = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas.")

    hashed = getattr(user, "password_hash", None) or getattr(
        user, "hashed_password", None
    )
    if not hashed or not verify_password(payload.password, hashed):
        raise HTTPException(status_code=401, detail="Credenciales inválidas.")

    token = create_access_token(sub=str(user.id))
    return TokenOut(access_token=token)  # token_type="bearer"

@router.post("/refresh", response_model=TokenOut)
def refresh(current_user: User = Depends(get_current_user)):
    # Si el token actual es válido, emite uno nuevo
    token = create_access_token(sub=str(current_user.id))
    return TokenOut(access_token=token)


@router.post("/logout", response_model=MessageOut)
def logout():
    # JWT es stateless: el cliente debe borrar el token
    return MessageOut(
        message="Sesión cerrada. Elimina el token del almacenamiento local."
    )



@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
