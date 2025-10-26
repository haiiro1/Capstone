from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.exceptions import RequestValidationError

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.api.routes import router as api_router
from app.api.routers.auth import router as auth_router
from app.api.routers.users import router as users_router
from app.api.routers.weather import router as weather_router
from app.api.routers.plant import router as plant_router
from app.db.session import SessionLocal


app = FastAPI(title="PlantGuard API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.ALLOW_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)


# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Health / root (útil en Render) ---
@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}


@app.head("/", include_in_schema=False)
def root_head():
    return JSONResponse({}, status_code=200)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse("/docs")


# --- Chequeo DB (SQLAlchemy 2.x) ---
@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    row = db.execute(text("select 'hello neon'")).fetchone()  # <- usa text(...)
    return {"db": row[0] if row else None}


# --- Routers ---
app.include_router(api_router, prefix="/api")
app.include_router(plant_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(weather_router, prefix="/api", tags=["Weather"])

# --- Archivos estáticos (Revisar que exista la carpeta) ---
# settings.MEDIA_URL_PREFIX debe empezar con "/" (ej. "/media")
# settings.MEDIA_DIR debe existir en runtime
app.mount(
    settings.MEDIA_URL_PREFIX, StaticFiles(directory=settings.MEDIA_DIR), name="media"
)

# traduccion de los errores tirados como json response (parcial)
ERROR_MSG_ES = {
    "less_than_equal": lambda ctx: f"Debe ser menor o igual a {ctx.get('le')}",
    "greater_than_equal": lambda ctx: f"Debe ser mayor o igual a {ctx.get('ge')}",
    "less_than": lambda ctx: f"Debe ser menor que {ctx.get('lt')}",
    "greater_than": lambda ctx: f"Debe ser mayor que {ctx.get('gt')}",
    "int_parsing": lambda ctx: "Debe ser un número entero",
    "float_parsing": lambda ctx: "Debe ser un número",
    "missing": lambda ctx: "Campo obligatorio",
}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    translated_errors = []
    for e in exc.errors():
        typ = e.get("type")
        ctx = e.get("ctx") or {}
        translator = ERROR_MSG_ES.get(typ)
        if translator:
            e_copy = dict(e)
            e_copy["msg"] = translator(ctx)
            translated_errors.append(e_copy)
        else:
            translated_errors.append(e)

    return JSONResponse(status_code=422, content={"detail": translated_errors})
