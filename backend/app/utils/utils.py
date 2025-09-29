from fastapi import HTTPException
import httpx


async def get_weather(url: str, params: dict):
    '''
    Method to simplify the fetch of weather data from the Openweathermap API.
    '''
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            return {"error": f"Failed to fetch weather data: {response.text}"}
        return response.json()
