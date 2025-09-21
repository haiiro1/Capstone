# settings (env)
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from pathlib import Path
import json
import os

class Settings(BaseSettings):
    # CORS
    CORS_ORIGINS: list[str] = [] 
    
    # DB
    DATABASE_URL: str
    
    # Archivos estáticos / media
    MEDIA_DIR: str = str(Path("storage/uploads"))  # <- ruta relativa portable (Linux/Windows)
    MEDIA_URL_PREFIX: str = "/media"               
    
    # 🔐 JWT
    SECRET_KEY: str = "change_me_in_.env"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors(cls, v):
        if v is None: 
            return []
        if isinstance(v, list): 
            return v
        s = str(v).strip()
        if s in ("", "[]"): 
            return []
        if s.startswith("["): 
            # admite JSON en .env: '["http://localhost:5173","https://..."]'
            return json.loads(s)
        # admite CSV en .env: "http://localhost:5173, https://..."
        return [x.strip() for x in s.split(",") if x.strip()]

settings = Settings()

# --------- Post-procesado / defaults seguros ---------
# 1) Defaults de CORS si no llegó nada por .env
if not settings.CORS_ORIGINS:
    settings.CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://example.vercel.app"  # <- reemplázar por el .env de Render
    ]

# 2) Normaliza MEDIA_URL_PREFIX (debe iniciar con "/")
if not settings.MEDIA_URL_PREFIX.startswith("/"):
    settings.MEDIA_URL_PREFIX = "/" + settings.MEDIA_URL_PREFIX

# 3) Asegura que exista el directorio de media
Path(settings.MEDIA_DIR).mkdir(parents=True, exist_ok=True)  # <- evita error en Render

# 4) Validación explícita de DATABASE_URL (mejor falla claro)
if not settings.DATABASE_URL:
    raise RuntimeError("DATABASE_URL no está configurada. Define la variable en tu .env / Render.")
