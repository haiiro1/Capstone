#aqui va SQLAlchemy models (User, RefreshToken)

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Analysis(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str
    confidence: float
    image_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    lat: Optional[float] = None
    lon: Optional[float] = None
    notes: Optional[str] = None
    model_version: str = "v0.1.0"
