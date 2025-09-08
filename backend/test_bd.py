import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Cargar variables de entorno
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("Falta DATABASE_URL en .env")

# Crear engine de SQLAlchemy
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Probar consulta
with engine.connect() as conn:
    result = conn.execute(text("select 'hello neon'"))
    print(result.fetchall())