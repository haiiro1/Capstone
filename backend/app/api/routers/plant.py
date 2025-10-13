import os
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import httpx

router = APIRouter(prefix="/api/plant", tags=["plant"])
PREDICT_URL = os.getenv("PREDICT_URL")
PREDICT_TIMEOUT = float(os.getenv("PREDICT_TIMEOUT", "60"))


@router.post("/predict")
async def proxy_predict(request: Request, file: UploadFile = File(...)):
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
        return resp.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"fetch_failed: {e!s}")
