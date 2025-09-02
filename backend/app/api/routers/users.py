# aqui va los endpoints de perfil si los necesitas

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserOut, UserProfileUpdate
from app.api.routers.auth import get_current_user, get_db
from app.db.models import User
import os, time, secrets
from fastapi import UploadFile, File
from app.core.config import settings

router = APIRouter(prefix="/users", tags=["users"])

@router.patch("/me", response_model=UserOut)
def update_me(payload: UserProfileUpdate,
              db: Session = Depends(get_db),
              current: User = Depends(get_current_user)):
    if payload.crops is not None:
        payload.crops = [c.strip() for c in payload.crops if c.strip()][:5]
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current, field, value)
    db.add(current)
    db.commit()
    db.refresh(current)

    # construir avatar_url si hay avatar_path
    avatar_url = None
    if current.avatar_path:
        avatar_url = f"{current.avatar_path}"  # p.ej. "/media/uuid_123.jpg"
    return UserOut.model_validate({**current.__dict__, "avatar_url": avatar_url})



ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 2 * 1024 * 1024  # 2MB

@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(file: UploadFile = File(...),
                        db: Session = Depends(get_db),
                        current: User = Depends(get_current_user)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Formato no permitido (jpeg/png/webp).")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Imagen > 2MB.")

    ext = (".jpg" if file.content_type == "image/jpeg"
           else ".png" if file.content_type == "image/png"
           else ".webp")
    fname = f"{current.id}_{int(time.time())}_{secrets.token_hex(4)}{ext}"
    os.makedirs(settings.MEDIA_DIR, exist_ok=True)
    disk_path = os.path.join(settings.MEDIA_DIR, fname)
    with open(disk_path, "wb") as f:
        f.write(data)

    # borra anterior si quieres
    if current.avatar_path and os.path.basename(current.avatar_path) != fname:
        try: os.remove(os.path.join(settings.MEDIA_DIR, os.path.basename(current.avatar_path)))
        except Exception: pass

    # guarda ruta pública
    current.avatar_path = f"{settings.MEDIA_URL_PREFIX}/{fname}"  # ej. "/media/xxx.jpg"
    db.add(current); db.commit(); db.refresh(current)
    return UserOut.model_validate({**current.__dict__, "avatar_url": current.avatar_path})