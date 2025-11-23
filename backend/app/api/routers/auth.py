# Login, register, refresh, logout
import uuid, os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi_mail import FastMail, MessageSchema, MessageType
from itsdangerous import SignatureExpired, BadSignature
from pydantic import EmailStr
from sqlalchemy.orm import Session
from jose import JWTError
from urllib.parse import urljoin

from app.api.routers.mail import conf
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.schemas.auth import (
    PasswordResetConfirm,
    PasswordResetInit,
    TokenOut,
    MessageOut,
    RegisterInit,
)
from app.core.security import digest_hash, make_email_token, load_email_token
from app.db.session import SessionLocal
from app.db.models import User, UserWeatherPrefs
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_token,
)

FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
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


@router.post("/register")
async def register(payload: RegisterInit, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="El email ya está registrado.")

    pw_hash = get_password_hash(payload.password)
    token_payload = {
        "nonce": str(uuid.uuid4()),
        "email": payload.email,
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "password_hash": pw_hash,
    }
    token = make_email_token(token_payload)
    verify_link = f"{FRONTEND_BASE_URL}/verify?token={token}"
    html = f"""
        <div style="font-family:system-ui; margin:0px auto;max-width:600px;">
            <h1 style="text-align:center">
                <a href="https://capstone-nu-cyan.vercel.app/" target="_blank" style="text-decoration:none; color: #15c;">🌱 PlantGuard</a>
            </h1>
            <h2>Hola, {payload.first_name}!</h2>
            <p>Bienvenid@ a PlantGuard! Hace click a el siguiente link para validar tu cuenta.</p>
            <a href="{verify_link}" target="_blank" style="text-decoration:none; margin-left:2em; color: #15c;">
                <span class="il"><span class="il">Valida</span></span> tu cuenta!</a>
            <p style="color: #9192a7; font-size: 12px; font-style: italic;">
            Has recibido este correo porque alguien esta tratando de registrarse en PlantGuard con tu dirección.
            </p>
            <div style="text-align:center">
                <hr>
                <p style="font-size:12px; color: #15c;">
                    <a href="https://capstone-nu-cyan.vercel.app/" style="text-decoration:none;" target="_blank">🌱</a>
                    <a href="https://capstone-nu-cyan.vercel.app/" target="_blank">PlantGuard</a> /
                    <a href="https://capstone-nu-cyan.vercel.app/privacidad" target="_blank">Privacidad</a> /
                    <a href="https://capstone-nu-cyan.vercel.app/ayuda" target="_blank">Contacto</a>
                </p>
            </div>
        </div>
    """
    fm = FastMail(conf)
    message = MessageSchema(
        subject="Valida tu cuenta PlantGuard",
        recipients=[payload.email],
        body=html,
        subtype=MessageType.html,
    )
    await fm.send_message(message)
    return {"message": "Recibiras un correo de validación en breve."}


@router.get("/verify")
def verify_account(token: str, db: Session = Depends(get_db)):
    try:
        data = load_email_token(token)
    except SignatureExpired:
        raise HTTPException(status_code=400, detail="token_expired")
    except BadSignature:
        raise HTTPException(status_code=400, detail="token_invalid")

    email = data["email"].lower().strip()
    if db.query(User).filter(User.email == email).first():
        return {"message": "Cuenta ya validada, ahora puedes iniciar sesión."}

    user = User(
        email=email,
        first_name=data["first_name"],
        last_name=data["last_name"],
        password_hash=data["password_hash"],
    )
    user.weather_prefs = UserWeatherPrefs(
        dangerous_frost_threshold=1,
        dangerous_temp_threshold=32,
        rain_mm_threshold=2,
        wind_kph_threshold=40,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Cuenta validada, ahora puedes iniciar sesión."}


@router.post("/verify/resend")
async def resend_verify(email: EmailStr, db: Session = Depends(get_db)):
    fm = FastMail(conf)
    generic = {
        "message": "Recibirás un correo de verificación en breve. Revisa tu carpeta de SPAM en caso de no encontrarlo en tu inbox."
    }
    user = db.query(User).filter(User.email == str(email).lower()).first()
    if user:
        return generic
    token = make_email_token(
        {
            "nonce": str(uuid.uuid4()),
            "email": str(email).lower(),
        }
    )
    verify_link = f"{FRONTEND_BASE_URL}/verify?token={token}"
    html = f"""
        <div style="font-family:system-ui; margin:0px auto;max-width:600px;">
            <h1 style="text-align:center">
                <a href="https://capstone-nu-cyan.vercel.app/" target="_blank" style="text-decoration:none; color: #15c;">🌱 PlantGuard</a>
            </h1>
            <h2>Hola!</h2>
            <p>Bienvenid@ a PlantGuard! Hace click a el siguiente link para validar tu cuenta.</p>
            <a href="{verify_link}" target="_blank" style="text-decoration:none; margin-left:2em; color: #15c;">
                <span class="il"><span class="il">Valida</span></span> tu cuenta!</a>
            <p style="color: #9192a7; font-size: 12px; font-style: italic;">
            Has recibido este correo porque alguien esta tratando de registrarse en PlantGuard con tu dirección.
            </p>
            <div style="text-align:center">
                <hr>
                <p style="font-size:12px; color: #15c;">
                    <a href="https://capstone-nu-cyan.vercel.app/" style="text-decoration:none;" target="_blank">🌱</a>
                    <a href="https://capstone-nu-cyan.vercel.app/" target="_blank">PlantGuard</a> /
                    <a href="https://capstone-nu-cyan.vercel.app/privacidad" target="_blank">Privacidad</a> /
                    <a href="https://capstone-nu-cyan.vercel.app/ayuda" target="_blank">Contacto</a>
                </p>
            </div>
        </div>
    """
    message = MessageSchema(
        subject="Valida tu cuenta PlantGuard",
        recipients=[str(email)],
        body=html,
        subtype=MessageType.html,
    )
    await fm.send_message(message)

    return generic


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
    avatar_url = None
    if current_user.avatar_path:
        avatar_url = current_user.avatar_path
    return UserOut.model_validate({**current_user.__dict__, "avatar_url": avatar_url})


@router.post("/password/reset/init", status_code=200)
async def password_reset_init(
    payload: PasswordResetInit, db: Session = Depends(get_db)
):
    generic = {
        "message": "Si corresponde, recibirás un correo para restablecer tu contraseña."
    }
    user = db.query(User).filter(User.email == str(payload.email).lower()).first()

    if not user:
        return generic

    fm = FastMail(conf)
    snap = digest_hash(user.password_hash)
    token = make_email_token(
        {
            "purpose": "pw-reset",
            "nonce": str(uuid.uuid4()),
            "email": user.email,
            "snap": snap,
        }
    )
    reset_link = f"{FRONTEND_BASE_URL}/reset-password?token={token}"
    html = f"""
        <div style="font-family:system-ui; margin:0px auto;max-width:600px;">
            <h1 style="text-align:center">
                <a href="https://capstone-nu-cyan.vercel.app/" target="_blank" style="text-decoration:none; color: #15c;">🌱 PlantGuard</a>
            </h1>
            <h2>Hola, {user.first_name}!</h2>
            <p>Has solicitado que se restablezca tu contraseña. Haz clic en el siguiente link para crear una nueva:</p>
            <a href="{reset_link}" target="_blank" style="text-decoration:none; margin-left:2em; color: #15c;">
                <span class="il"><span class="il">Restaura</span></span> tu contraseña</a>
            <div style="color: #9192a7; font-size: 12px; font-style: italic;">
                <p>
                Has recibido este correo porque alguien esta tratando de restaurar tu contraseña en PlantGuard.<br>
                Si no ha solicitado esto, puede ignorar este correo electrónico.
                </p>
            </div>
            <div style="text-align:center">
                <hr>
                <p style="font-size:12px; color: #15c;">
                    <a href="https://capstone-nu-cyan.vercel.app/" style="text-decoration:none;" target="_blank">🌱</a>
                    <a href="https://capstone-nu-cyan.vercel.app/" target="_blank">PlantGuard</a> /
                    <a href="https://capstone-nu-cyan.vercel.app/privacidad" target="_blank">Privacidad</a> /
                    <a href="https://capstone-nu-cyan.vercel.app/ayuda" target="_blank">Contacto</a>
                </p>
            </div>
        </div>
    """
    message = MessageSchema(
        subject="PlantGuard — Restablece tu contraseña",
        recipients=[user.email],
        body=html,
        subtype=MessageType.html,
    )
    await fm.send_message(message)
    return generic


@router.post("/password/reset/confirm", status_code=200)
def password_reset_confirm(
    payload: PasswordResetConfirm, db: Session = Depends(get_db)
):
    try:
        data = load_email_token(payload.token)
    except SignatureExpired:
        raise HTTPException(status_code=400, detail="expired_link")
    except BadSignature:
        raise HTTPException(status_code=400, detail="invalid_link")

    if data.get("purpose") != "pw-reset":
        raise HTTPException(status_code=400, detail="invalid_link")

    email = data["email"].lower().strip()
    snap = data["snap"]
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return {"message": "ok_password_reset"}

    if digest_hash(user.password_hash) != snap:
        raise HTTPException(status_code=400, detail="expired_link")

    user.password_hash = get_password_hash(payload.new_password)
    db.add(user)
    db.commit()
    return {"message": "updated_password"}
