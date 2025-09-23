import httpx
import os
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"

async def get_current_weather(lat: float, lon: float):
    if not OPENWEATHER_API_KEY:
        # Esto es un control de seguridad por si olvidaste poner la llave
        return {"error": "Weather API key not configured"}

    # Parámetros que le enviaremos a la API de OpenWeatherMap
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",  # Para que la temperatura venga en Celsius
        "lang": "es",       # Para que la descripción venga en español
    }

    # Hacemos la llamada a la API externa
    async with httpx.AsyncClient() as client:
        response = await client.get(OPENWEATHER_URL, params=params)

    if response.status_code != 200:
        # Si algo salió mal en la llamada externa
        return {"error": "Failed to fetch weather data"}

    data = response.json()

    # Procesamos la respuesta para devolver solo lo que nos interesa
    processed_data = {
        "temp": data["main"]["temp"],
        "condition": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"],
        "humidity": data["main"]["humidity"],
        "wind_speed": data["wind"]["speed"] * 3.6,  # Convertir de m/s a km/h
    }

    return processed_data