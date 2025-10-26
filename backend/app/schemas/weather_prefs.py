from pydantic import BaseModel, Field, conint


class WeatherPrefsBase(BaseModel):
    dangerous_frost_threshold: conint(ge=-50, le=10) = Field(1, description="°C")
    dangerous_temp_threshold: conint(ge=11, le=60) = Field(32, description="°C")
    rain_mm_threshold: conint(ge=0, le=200) = Field(2, description="mm/3h")
    wind_kph_threshold: conint(ge=0, le=200) = Field(40, description="km/h")


class WeatherPrefsUpdate(BaseModel):
    dangerous_frost_threshold: conint(ge=-50, le=10) | None = None
    dangerous_temp_threshold: conint(ge=11, le=60) | None = None
    rain_mm_threshold: conint(ge=0, le=200) | None = None
    wind_kph_threshold: conint(ge=0, le=200) | None = None


class WeatherPrefsOut(WeatherPrefsBase):
    user_id: str
