# PlantGuard — Backend

Backend del proyecto PlantGuard, desarrollado con FastAPI, PostgreSQL y Alembic.  
Este servicio expone una API REST que permite:

- Autenticación de usuarios (JWT)
- Análisis de imágenes (sana / plaga) y almacenamiento de resultados
- Alertas climáticas vía proxy a proveedores externos
- Historial de análisis por usuario
- Servir archivos subidos (media)

Stack: FastAPI · Uvicorn · SQLAlchemy · Alembic · PostgreSQL · Docker · Render · Neon

---

## Estructura del proyecto


```
backend/
├─ alembic/ # Migraciones
│ ├─ versions/ # Archivos de migración
│ ├─ env.py # Config Alembic (lee DATABASE_URL)
│ └─ script.py.mako
│
├─ app/
│ ├─ api/
│ │ └─ routers/
│ │ ├─ auth.py # Rutas de autenticación
│ │ ├─ users.py # Rutas de usuarios
│ │ └─ routes.py # Registro de routers
│ ├─ core/
│ │ ├─ config.py # Configuración (lee .env)
│ │ ├─ rate_limit.py # Limitación de peticiones
│ │ └─ security.py # JWT y hashing
│ ├─ db/
│ │ ├─ base.py # Base declarativa
│ │ ├─ init_db.py # Inicialización de datos
│ │ ├─ models.py # Modelos ORM
│ │ └─ session.py # Sesión de DB
│ ├─ schemas/
│ │ ├─ auth.py # Schemas de autenticación
│ │ └─ user.py # Schemas de usuario
│ ├─ services/
│ │ └─ auth_service.py # Lógica de autenticación
│ ├─ utils/
│ │ └─ time.py # Helpers de tiempo
│ ├─ main.py # Punto de entrada FastAPI
│ └─ init.py
│
├─ Docs/ # Documentación (ej. clima)
├─ storage/uploads/ # Archivos subidos
│
├─ deploy/ # Infraestructura y dependencias
│ ├─ Dockerfile # Imagen backend
│ ├─ docker-compose.yml # Orquestación local (API + DB)
│ └─ requirements.txt # Dependencias Python
│
├─ .env # Variables de entorno
├─ alembic.ini # Config Alembic
├─ test_bdd.py # Tests básicos
└─ README.md # Este archivo
```
---
## Variables de entorno

### Crear el archivo `backend/.env` con las siguientes variables:

```env
# CORS (agregar dominio de Vercel)
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000","https://<tu-frontend>.vercel.app"]
ALLOW_ORIGIN_REGEX=

# Modelo / Uploads
MAX_IMAGE_MB=10
MIN_IMAGE_PX=256
MODEL_VERSION=v0.1.0

# Base de datos local (Docker)
POSTGRES_DB=plantguard
POSTGRES_USER=plantguard
POSTGRES_PASSWORD=plantguard

# Base de datos remota (Neon)
DATABASE_URL=postgresql://neondb_owner:********@ep-xxxxx-pooler.sa-east-1.aws.neon.tech/PlantGuard_DB?sslmode=require&channel_binding=require

# Media
MEDIA_DIR=storage/uploads
MEDIA_URL_PREFIX=/media

# API base URL (para el front)
API_BASE_URL=https://<tu-backend-en-render>.onrender.com/api

# Cookie
SECRET_KEY=super-super-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

```

---

## Ejecución local

### Con Docker (recomendado)

Los archivos de despliegue están en backend/deploy/:

```
cd backend/deploy
docker compose up --build
```

- API disponible en: http://localhost:8000

- Documentación interactiva: http://localhost:8000/docs

### Sin Docker (entorno virtual)

```
cd backend/deploy
pip install -r requirements.txt

cd ..
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Migraciones (Alembic)

```
cd backend
alembic revision --autogenerate -m "init tables"
alembic upgrade head
```

---

## Despliegue en Producción
### Base de datos — Neon

- Crear proyecto y base (ejemplo: PlantGuard_DB).

- Usar el connection pooler con SSL requerido.

- Guardar la cadena DATABASE_URL en las variables de entorno de Render.

### Backend — Render (FastAPI)

- Root del servicio: backend/

- Build Command:
```
pip install -r deploy/requirements.txt
```

- Start Command:

```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

- Variables de entorno: mismas que en .env.

### Frontend — Vercel (React/Vite)

- En Vercel → Project → Settings → Environment Variables:
```
VITE_API_URL = https://<tu-servicio-en-render>.onrender.com/api
```

---

## Endpoints principales

- GET /health

- POST /api/auth/register

- POST /api/auth/login

- GET /api/auth/me

- POST /api/analysis/upload

- GET /api/analysis/history

- GET /api/alerts/weather/current?lat=&lon=

- GET /media/{filename}

---

## Licencia