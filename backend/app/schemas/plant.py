from pydantic import BaseModel, Field, conlist, confloat
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class PredictionOut(BaseModel):
    title: str
    severity: Optional[str] = None
    advice: List[str] = Field(default_factory=list)
    probability: confloat(ge=0.0, le=1.0)


class PredictOut(BaseModel):
    model_version: Optional[str] = None
    top_k: int
    lang: Optional[str] = None
    date_created: datetime
    predictions: conlist(PredictionOut, min_length=0)
    disclaimer: Optional[str] = None


class PredictionRecordOut(BaseModel):
    id: UUID
    date_created: datetime
    title: str
    probability: float
    severity: Optional[str] = None
    advice: List[str] = []

    class Config:
        from_attributes = True


class PredictSummaryOut(BaseModel):
    last_analysis: Optional[str]
    last_title: Optional[str]
    last_probability: Optional[float]
    total_count: int
    healthy_count: int
    diseased_count: int
    avg_confidence: Optional[float]
    healthy_pct: float
    diseased_pct: float
