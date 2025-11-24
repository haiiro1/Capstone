# Definición — API Clima (PlantGuard, prototipo con OWM free)

## Decisión de proveedor
Para este prototipo he decidido usar el **plan freemium de OpenWeatherMap (One Call API 3.0)**.
Las razones son las siguientes:

- No necesito pagar ni pensar en escalamiento todavía, ya que el proyecto se encuentra en fase de **prototipo académico**.
- El plan gratuito incluye **1.000 requests por día**, lo cual es más que suficiente para las pruebas iniciales y para manejar clima actual + forecast en un MVP.
- Usaré principalmente:
  - **Clima actual** por lat/lon → para mostrar en la pantalla de alertas.
  - **Forecast básico** de 4 días con pasos de 3 horas → para anticipar lluvia, heladas o calor.
  - Variables como **temperatura, humedad, viento, precipitación** que son críticas para el cuidado de cultivos.
- Tomé esta decisión porque OpenWeatherMap es un proveedor confiable, con buena documentación, y me permite **probar rápidamente** sin costos asociados.
- Si el proyecto evoluciona a una etapa profesional, se evaluará migrar a un plan pago o a un esquema híbrido con otros proveedores para cubrir mayor volumen y funcionalidades avanzadas.
- Tambien hacemos uso de las APIs ofrecidas por **Google Maps Platform**, para permitir al usuario ingresar su dirección, la cual se convertira a los parametros requeridos por OWM para realizar sus predicciones.

---

## Alcance prototipo
- **Proveedor:** OpenWeatherMap (One Call API 3.0, plan gratuito).
- **Uso esperado:**
  - Clima actual por lat/lon.
  - Forecast básico (hasta 5 días, paso 3h).
  - Alertas internas (lluvia, helada, calor, viento).
- **Cuota:** 1.000 requests/día → suficiente para MVP si usamos caché.

---

## Backend (FastAPI en Render)
- **Servicio interno `weather.py`:** conecta con OWM usando la API key.
- **Uso de APIs externas:** Utilizamos Geocoding y autocomplete de Google Maps Platform para tomar la direccion de cada usuario y convertirla a lat/lon, lo cual es usado por OWM para las predicciones del tiempo.
- **Endpoints previstos:**
  - `GET /api/alerts/weather/now` → clima actual normalizado.
  - `GET /api/alerts/weather/forecast` → pronóstico de tiempo.
  - `GET /api/alerts/events` → devuelve alertas según las preferencias asignadas por el usuario.
- **Manejo de API keys:** variables de entornos `OPENWEATHER_API_KEY` y `GOOGLE_MAPS_API_KEY` (solo en backend).
- **Caché:** TTL 2–5 min en memoria para reducir consumo.

---

## Variables de entorno (Render)
```
OPENWEATHER_API_KEY=xxxxxx
GOOGLE_MAPS_API_KEY=xxxxxx
GEOCODE_URL=xxxxxx
OPENWEATHER_URL=xxxxxx
OPENWEATHER_URL_FORECAST=xxxxxx
```

---

## Modelos de datos
**Tabla `UserWeatherPrefs`:**
- id
- user_id
- dangerous_frost_threshold
- dangerous_temp_threshold
- rain_mm_threshold
- wind_kph_threshold

---

## Cron Job (más adelante, no en prototipo)
- Frecuencia: cada 15–30 min.
- Acción: consulta clima → evalúa reglas de umbral → inserta en `weather_alerts` → notifica (ej. email).

---

## Frontend (React/Vercel local)
- Consulta siempre a **backend** (`/api/alerts/weather/...`).
- **Pantalla Alertas**:
  - Tarjeta con clima actual (temp, humedad, viento, condición).
  - Forecast (4 dias).
  - Lista de alertas activas (ej. “⚠️ Posible helada esta noche”).
  - Preferencias de usuario (umbrales, ubicación, horario notificaciones).

---

## Reglas iniciales de alertas (defaults MVP)
- Helada: `temp ≤ 1°C`.
- Ola de calor: `temp ≥ 32°C` por ≥ 3h seguidas.
- Lluvia: `precipitación ≥ 2 mm/h`.
- Viento: `≥ 40 km/h`.

---

## Futuro (producción)
- Proveedor híbrido (ej. Open-Meteo como respaldo).
- Redis para caché compartido.
- Jobs en Render Workers para notificaciones push.
- Datos históricos para reportes.
- Plan pago OWM (más cuotas, datos avanzados).
