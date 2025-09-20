# PlantGuard — Backend

Backend de PlantGuard desarrollado con FastAPI, PostgreSQL y Alembic.  
Se ejecuta en contenedores Docker junto a la base de datos y soporta migraciones.

---
## Estructura del proyecto

```
backend/
├─ alembic/ # Infraestructura de migraciones de base de datos
│ ├─ versions/ # Archivos de migración autogenerados/aplicados
│ │ ├─ <rev>_<msg>.py # Ej.: e5afccb4ce4f_init.py, etc.
│ ├─ env.py # Config de Alembic: metadata, URL BD, context/run_migrations
│ ├─ script.py.mako # Plantilla para nuevas migraciones
│ └─ README # Notas internas de Alembic (opcional)
├─ app/
│ ├─ api/ # Definición de endpoints y enrutadores
│ │ ├─ routers/ # Archivos de rutas agrupadas por funcionalidad
│ │ └─ routes.py # Rutas principales de la API
│ ├─ core/ # Configuración y utilidades de núcleo
│ │ ├─ config.py # Variables de configuración globales
│ │ ├─ rate_limit.py # Lógica de limitación de peticiones
│ │ └─ security.py # Funciones de seguridad y autenticación
│ ├─ db/ # Configuración de base de datos
│ │ ├─ base.py # Declaraciones base para modelos
│ │ ├─ init_db.py # Inicialización de la BD con datos iniciales
│ │ ├─ models.py # Modelos de SQLAlchemy
│ │ └─ session.py # Sesión de conexión a la BD
│ ├─ schemas/ # Definiciones de Pydantic para validación
│ │ ├─ auth.py # Esquemas de autenticación
│ │ └─ user.py # Esquemas de usuario
│ ├─ services/ # Lógica de negocio
│ │ └─ auth_service.py # Servicio de autenticación y JWT
│ ├─ utils/ # Funciones auxiliares
│ │ └─ time.py # Utilidades relacionadas con fechas/horas
│ └─ main.py # Punto de entrada de la aplicación FastAPI
├─ deploy/
│ ├─ docker-compose.yml # Orquestación de contenedores (API y DB)
│ └─ Dockerfile # Imagen de la aplicación FastAPI
├─ storage/ # Carpeta para almacenar archivos/imágenes
├─ .env # Variables de entorno
├─ alembic.ini # Configuración principal de Alembic
├─ requirements.txt # Dependencias de Python
└─ README.md # Documentación del backend
```
---
## Variables de entorno

### Crear el archivo `backend/.env` con las siguientes variables:

```
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000"]
MAX_IMAGE_MB=10
MIN_IMAGE_PX=256
MODEL_VERSION=v0.1.0

POSTGRES_DB=plantguard
POSTGRES_USER=plantguard
POSTGRES_PASSWORD=plantguard
# Neon
DATABASE_URL='postgresql://neondb_owner:npg_1OZ3bgmpCIkd@ep-lingering-darkness-ackvhvh8-pooler.sa-east-1.aws.neon.tech/PlantGuard_DB?sslmode=require&channel_binding=require'

VITE_API_BASE_URL=http://127.0.0.1:8000/api
SECRET_KEY=super-super-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

```

---

## Docker Compose

### El archivo `backend/deploy/docker-compose.yml` permite levantar el backend y la base de datos:


```

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-plantguard}
      POSTGRES_USER: ${POSTGRES_USER:-plantguard}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-plantguard}
  
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build:
      # OJO: las rutas se resuelven RELATIVAS a ESTE archivo (deploy/)
      context: ..
      dockerfile: deploy/Dockerfile
    env_file:
      # Usa el .env del backend para tu app FastAPI
      - ../.env
    volumes:
      # Monta todo el backend dentro del contenedor para que existan /app/alembic.ini y /app/alembic/
      - ../:/app
    depends_on:
      - db
    ports:
      - "8000:8000"
    working_dir: /app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  pgdata: {}

```

---

## Levantar el Backend

```
cd backend/deploy
docker compose up --build
```

---

## La API estará disponible en:

```
http://localhost:8000/docs
```

---

## Migraciones con Alembic

### Crear nueva migración:

```
docker compose exec api alembic revision --autogenerate -m "mensaje"
```

### Aplicar migraciones:

```
docker compose exec api alembic upgrade head
```

### Revertir la última migración:

```
docker compose exec api alembic downgrade -1

```

