from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_router
from app.api.routers.auth import router as auth_router
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.routers.users import router as users_router


app = FastAPI(title="PlantGuard API")



app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok"}

app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.mount(settings.MEDIA_URL_PREFIX, StaticFiles(directory=settings.MEDIA_DIR), name="media")
app.include_router(users_router, prefix="/api")

