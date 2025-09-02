# settings (env)
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import json, os

class Settings(BaseSettings):
    CORS_ORIGINS: list[str] = []
    # Si usas DATABASE_URL en .env, solo se declara el campo
    DATABASE_URL: str
    MEDIA_DIR: str = "/app/storage/uploads"
    MEDIA_URL_PREFIX: str = "/media"
    # 🔐 JWT
    SECRET_KEY: str = "change_me_in_.env"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors(cls, v):
        if v is None: return []
        if isinstance(v, list): return v
        s = str(v).strip()
        if s in ("", "[]"): return []
        if s.startswith("["): return json.loads(s)
        return [x.strip() for x in s.split(",") if x.strip()]

settings = Settings()
