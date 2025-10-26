import { type WeatherPrefs } from "../types/weather";
import api, { extractErrorMessage } from "../lib/api";

const BASE = "/api/users/me/prefs";

export async function getWeatherPrefs() {
  try {
    const { data } = await api.get<WeatherPrefs>(BASE);
    return data;
  } catch (err) {
    if ((err as any)?.response?.status === 404) return null;
    throw new Error(extractErrorMessage(err));
  }
}

export async function upsertWeatherPrefs(payload: WeatherPrefs) {
  try {
    const { data } = await api.put<WeatherPrefs>(BASE, payload);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}
