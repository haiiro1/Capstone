import os
import httpx
from datetime import datetime, timezone
from typing import Any, Dict, List
from sqlalchemy import func, case
from sqlalchemy.orm import Session
from fastapi import APIRouter, Query, UploadFile, File, HTTPException, Request, Depends
from app.schemas.plant import PredictionOut, PredictOut, PredictionRecordOut, PredictSummaryOut
from app.db.models import PredictionRecord, User
from app.api.routers.auth import get_current_user, get_db

router = APIRouter(prefix="/plant", tags=["plant"])
PREDICT_URL = os.getenv("PREDICT_URL")
PREDICT_TIMEOUT = float(os.getenv("PREDICT_TIMEOUT", "60"))
PROB_CUT = 0.01


def _as_list(x) -> List[str]:
    if x is None:
        return []
    if isinstance(x, list):
        return [str(i) for i in x if isinstance(i, (str, int, float))]
    return [str(x)]


@router.post("/predict", response_model=PredictOut)
async def proxy_predict(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        contents = await file.read()
        if await request.is_disconnected():
            raise HTTPException(status_code=499, detail="client_closed_request")

        async with httpx.AsyncClient(timeout=PREDICT_TIMEOUT) as client:
            resp = await client.post(
                PREDICT_URL,
                files={
                    "file": (file.filename, contents, file.content_type or "image/jpeg")
                },
            )

        if resp.status_code >= 400:
            raise HTTPException(
                status_code=502,
                detail=f"upstream_error: {resp.status_code}: {resp.text}",
            )

        raw: Dict[str, Any] = resp.json()
        preds = raw.get("predictions") or []

        def normalize(p: Dict[str, Any]) -> Dict[str, Any]:
            # little checks in case we do fix labels that the json uses, so i don't have to be troubleshooting this again.
            rec = p.get("recomendation") or p.get("recommendation") or {}
            title = rec.get("title") or p.get("label_es") or p.get("label_en") or "—"
            prob = p.get("probability")
            # redundant check in the case that for whatever reason the json returns prob as int instead of float
            try:
                prob_f = float(prob)
            except (TypeError, ValueError):
                prob_f = 0.0

            return {
                "title": title,
                "severity": rec.get("severity"),
                "advice": _as_list(rec.get("advice")),
                "probability": prob_f,
            }

        # we make the cut so we don't get preds with extremely low chance/confidence
        normalized: List[Dict[str, Any]] = [normalize(p) for p in preds]
        normalized = [p for p in normalized if p["probability"] >= PROB_CUT]
        top_k = int(raw.get("top_k") or len(normalized) or 0)
        normalized.sort(key=lambda x: x["probability"], reverse=True)
        if top_k > 0:
            normalized = normalized[:top_k]

        # before we parsed the json in front, but since we needed date_created for historial, now we handle it here,
        # meaning that now front will just need to call and get the data instead of parsing, simplifying it~
        out = PredictOut(
            model_version=raw.get("model_version"),
            top_k=top_k,
            lang=raw.get("lang"),
            date_created=datetime.now(timezone.utc),
            predictions=[PredictionOut(**p) for p in normalized],
            disclaimer=raw.get("disclaimer"),
        )
        if out.predictions:
            top1 = out.predictions[0]
            db.add(
                PredictionRecord(
                    user_id=current_user.id,
                    title=top1.title,
                    severity=top1.severity,
                    advice=top1.advice,
                    probability=float(top1.probability),
                    model_version=out.model_version,
                )
            )
            db.commit()
        return out
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"fetch_failed: {e!s}")


@router.get("/predict/history", response_model=List[PredictionRecordOut])
async def get_predict_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    rows = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.user_id == current_user.id)
        .order_by(PredictionRecord.date_created.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return rows


@router.get("/predict/summary", response_model=PredictSummaryOut)
def get_predict_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    # this entire call is only for the home section, to finally remove the static stuff
    # this could be a boolean, but i dont feel like changing the db again currently, so this will do.
    healthy_case = case(
        (func.trim(func.lower(PredictionRecord.title)) == "sano", 1),
        else_=0,
    )
    query = (
        db.query(
            func.count(PredictionRecord.id),
            func.sum(healthy_case),
            func.avg(PredictionRecord.probability),
        )
        .filter(PredictionRecord.user_id == current_user.id)
    )
    # simple math to fill up our summary schema
    total_count, healthy_sum, avg_conf = query.one()
    total_count = int(total_count or 0)
    healthy_count = int(healthy_sum or 0)
    diseased_count = max(total_count - healthy_count, 0)
    avg_confidence = float(avg_conf) if avg_conf is not None else None
    healthy_pct = (healthy_count / total_count * 100.0) if total_count else 0.0
    diseased_pct = 100.0 - healthy_pct if total_count else 0.0
    # make sure we always get the latest params of the current user
    last = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.user_id == current_user.id)
        .order_by(PredictionRecord.date_created.desc())
        .limit(1)
        .one_or_none()
    )

    return PredictSummaryOut(
        last_analysis=last.date_created.isoformat() if last else None,
        last_title=last.title if last else None,
        last_probability=float(last.probability) if last else None,
        total_count=total_count,
        healthy_count=healthy_count,
        diseased_count=diseased_count,
        avg_confidence=avg_confidence,
        healthy_pct=healthy_pct,
        diseased_pct=diseased_pct,
    )
