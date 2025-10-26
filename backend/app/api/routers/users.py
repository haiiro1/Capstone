# aqui va los endpoints de perfil si los necesitas
import os, time, secrets
import time

from urllib.parse import urljoin
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy.orm import Session

from app.schemas.user import UserOut, UserProfileUpdate
from app.schemas.weather_prefs import (
    WeatherPrefsBase,
    WeatherPrefsUpdate,
    WeatherPrefsOut,
)
from app.api.services.weather_service import get_prefs_or_404
from app.api.routers.auth import get_current_user, get_db
from app.db.models import User, UserWeatherPrefs
from app.core.config import settings


def _abs_media_url(request: Request, rel_path: str | None) -> str | None:
    if not rel_path:
        return None
    base = str(request.base_url).rstrip("/")
    return urljoin(base + "/", rel_path.lstrip("/"))


router = APIRouter(prefix="/users", tags=["users"])


@router.patch("/me", response_model=UserOut)
def update_me(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
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
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=400, detail="Formato no permitido (jpeg/png/webp)."
        )
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Imagen > 2MB.")

    ext = (
        ".jpg"
        if file.content_type == "image/jpeg"
        else ".png" if file.content_type == "image/png" else ".webp"
    )
    fname = f"{current.id}_{int(time.time())}_{secrets.token_hex(4)}{ext}"
    os.makedirs(settings.MEDIA_DIR, exist_ok=True)
    disk_path = os.path.join(settings.MEDIA_DIR, fname)
    with open(disk_path, "wb") as f:
        f.write(data)

    # borra anterior si quieres
    if current.avatar_path and os.path.basename(current.avatar_path) != fname:
        try:
            os.remove(
                os.path.join(settings.MEDIA_DIR, os.path.basename(current.avatar_path))
            )
        except Exception:
            pass

    # guarda ruta pública
    current.avatar_path = f"{settings.MEDIA_URL_PREFIX}/{fname}"  # ej. "/media/xxx.jpg"
    db.add(current)
    db.commit()
    db.refresh(current)
    return UserOut.model_validate(
        {**current.__dict__, "avatar_url": current.avatar_path}
    )


@router.get("/me/prefs", response_model=WeatherPrefsOut)
def get_weather_prefs(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    prefs = get_prefs_or_404(db, current.id)
    return WeatherPrefsOut.model_validate(
        {
            "user_id": str(prefs.user_id),
            "dangerous_frost_threshold": prefs.dangerous_frost_threshold,
            "dangerous_temp_threshold": prefs.dangerous_temp_threshold,
            "rain_mm_threshold": prefs.rain_mm_threshold,
            "wind_kph_threshold": prefs.wind_kph_threshold,
        }
    )


@router.put("/me/prefs", response_model=WeatherPrefsOut)
def put_weather_prefs(
    payload: WeatherPrefsBase,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    prefs = get_prefs_or_404(db, current.id)
    prefs.dangerous_frost_threshold = payload.dangerous_frost_threshold
    prefs.dangerous_temp_threshold = payload.dangerous_temp_threshold
    prefs.rain_mm_threshold = payload.rain_mm_threshold
    prefs.wind_kph_threshold = payload.wind_kph_threshold

    db.add(prefs)
    db.commit()
    db.refresh(prefs)
    return WeatherPrefsOut.model_validate(
        {
            "user_id": str(prefs.user_id),
            "dangerous_frost_threshold": prefs.dangerous_frost_threshold,
            "dangerous_temp_threshold": prefs.dangerous_temp_threshold,
            "rain_mm_threshold": prefs.rain_mm_threshold,
            "wind_kph_threshold": prefs.wind_kph_threshold,
        }
    )


@router.patch("/me/prefs", response_model=WeatherPrefsOut)
def patch_weather_prefs(
    payload: WeatherPrefsUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    prefs = get_prefs_or_404(db, current.id)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(prefs, field, value)

    db.add(prefs)
    db.commit()
    db.refresh(prefs)

    return WeatherPrefsOut.model_validate(
        {
            "user_id": str(prefs.user_id),
            "dangerous_frost_threshold": prefs.dangerous_frost_threshold,
            "dangerous_temp_threshold": prefs.dangerous_temp_threshold,
            "rain_mm_threshold": prefs.rain_mm_threshold,
            "wind_kph_threshold": prefs.wind_kph_threshold,
        }
    )
