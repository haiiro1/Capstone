# Definición — API Clima (PlantGuard, prototipo con OWM free)

## Decisión de proveedor
Para este prototipo he decidido usar el **plan freemium de OpenWeatherMap (One Call API 3.0)**.
Las razones son las siguientes:

- No necesito pagar ni pensar en escalamiento todavía, ya que el proyecto se encuentra en fase de **prototipo académico**.
- El plan gratuito incluye **1.000 requests por día**, lo cual es más que suficiente para las pruebas iniciales y para manejar clima actual + forecast en un MVP.
- Usaré principalmente:
  - **Clima actual** por lat/lon → para mostrar en la pantalla de alertas.
  - **Forecast básico** de 5 días con pasos de 3 horas → para anticipar lluvia, heladas o calor.
  - Variables como **temperatura, humedad, viento, precipitación** que son críticas para el cuidado de cultivos.
- Tomé esta decisión porque OpenWeatherMap es un proveedor confiable, con buena documentación, y me permite **probar rápidamente** sin costos asociados.
- Si el proyecto evoluciona a una etapa profesional, se evaluará migrar a un plan pago o a un esquema híbrido con otros proveedores para cubrir mayor volumen y funcionalidades avanzadas.

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
- **Endpoints previstos:**
  - `GET /api/alerts/weather/now?lat&lon` → clima actual normalizado.
  - `GET /api/alerts/weather/forecast?lat&lon&hours=24` → pronóstico horario.
  - (luego) `GET /api/alerts/evaluate?lat&lon` → devuelve alertas según umbrales.
- **Manejo de API key:** variable de entorno `OPENWEATHER_API_KEY` (solo en backend).
- **Caché:** TTL 2–5 min en memoria para reducir consumo.

---

## Variables de entorno (Render)
```
OPENWEATHER_API_KEY=xxxxxx
WEATHER_PROVIDER=openweather
WEATHER_LANG=es
WEATHER_UNITS=metric
```

---

## Modelos de datos
**Tabla `user_weather_prefs`:**
- user_id
- lat, lon
- frost_threshold_c (ej. ≤ 1°C)
- heatwave_threshold_c (ej. ≥ 32°C)
- rain_mm_threshold (ej. ≥ 2mm/h)
- wind_kph_threshold (ej. ≥ 40 km/h)
- notify_hours (ej. 07:00–22:00)
- enabled

**Tabla `weather_alerts`:**
- id, user_id
- type (rain, frost, heat, wind, etc.)
- level (info, warning, critical)
- observed_at, valid_until
- payload_json
- delivered (bool), delivered_at

---

## Cron Job (más adelante, no en prototipo)
- Frecuencia: cada 15–30 min.
- Acción: consulta clima → evalúa reglas de umbral → inserta en `weather_alerts` → notifica (ej. email).

---

## Frontend (React/Vercel local)
- Consulta siempre a **backend** (`/api/alerts/weather/...`).
- **Pantalla Alertas**:
  - Tarjeta con clima actual (temp, humedad, viento, condición).
  - Forecast 24–48h (gráfico simple).
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
