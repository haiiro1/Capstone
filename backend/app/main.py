from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_router
from app.api.routers.auth import router as auth_router
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.routers.users import router as users_router
from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.config import settings

app = FastAPI(title="PlantGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age= 86400,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    row = db.execute(text("select 'hello neon'")).fetchone()
    return {"db": row[0]}

app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.mount(settings.MEDIA_URL_PREFIX, StaticFiles(directory=settings.MEDIA_DIR), name="media")
app.include_router(users_router, prefix="/api")