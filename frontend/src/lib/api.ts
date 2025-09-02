import axios from "axios";

export const TOKEN_KEY = "pg_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;
  if (isFormData) {
    delete (config.headers as any)["Content-Type"];
  } else {
    (config.headers as any)["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (location.pathname !== "/") location.href = "/";
    }
    return Promise.reject(err);
  }
);


export function extractErrorMessage(err: any): string {
  if (err?.response?.data?.detail) return String(err.response.data.detail);
  if (err?.response?.status) return `Error ${err.response.status}`;
  if (err?.message === "Network Error") return "No se pudo contactar la API";
  return err?.message || "Error desconocido";
}


export default api;