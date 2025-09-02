# alembic/env.py
from __future__ import annotations
from logging.config import fileConfig
import os, sys
from sqlalchemy import create_engine, pool
from alembic import context

# === asegurar que Python vea el proyecto ===
# /app/alembic -> /app (raíz) y /app/app (paquete)
THIS_DIR = os.path.abspath(os.path.dirname(__file__))
ROOT_DIR = os.path.abspath(os.path.join(THIS_DIR, ".."))
PKG_DIR  = os.path.join(ROOT_DIR, "app")

for p in (ROOT_DIR, PKG_DIR):
    if p not in sys.path:
        sys.path.insert(0, p)

# ahora ya podemos importar
from app.core.config import settings
from app.db.base import Base

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = create_engine(settings.DATABASE_URL, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()