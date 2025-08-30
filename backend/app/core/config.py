# settings (env)

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./plantguard.db"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    MAX_IMAGE_MB: int = 10
    MIN_IMAGE_PX: int = 256
    MODEL_VERSION: str = "v0.1.0"

    @property
    def cors_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

settings = Settings()
