from fastapi import FastAPI, Depends  
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_router
from app.api.routers.auth import router as auth_router
from fastapi.staticfiles import StaticFiles
from app.api.routers.users import router as users_router
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from fastapi.responses import RedirectResponse, JSONResponse



app = FastAPI(title="PlantGuard API")



app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 👉 Health & raíz (para evitar 404 de Render)
@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}

@app.get("/", include_in_schema=False)
def root():
    # redirige a /docs, o devuelve un JSON
    return RedirectResponse("/docs")

@app.head("/", include_in_schema=False)
def root_head():
    return JSONResponse({}, status_code=200)

# chequeo DB
@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    row = db.execute("select 'hello neon'").fetchone()
    return {"db": row[0]}

app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.mount(settings.MEDIA_URL_PREFIX, StaticFiles(directory=settings.MEDIA_DIR), name="media")

