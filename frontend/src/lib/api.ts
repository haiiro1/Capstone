
import axios from "axios";

export const TOKEN_KEY = "pg_token";

function resolveBaseURL() {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (import.meta.env.DEV) {
    // usa la env si existe; si no, localhost:8000
    return (envUrl || "http://localhost:8000").replace(/\/+$/, "");
  }
  // en build/prod (por si algún día haces vercel)
  if (!envUrl) return "";
  return envUrl.replace(/\/+$/, "");
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: { "Content-Type": "application/json" },
});

// ——— Interceptor de request: token + FormData ———
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  // Si NO es FormData, fuerza application/json (evita multipart inesperado)
  config.headers = config.headers ?? {};
  if (isFormData) {
    delete (config.headers as any)["Content-Type"];
  } else {
    (config.headers as any)["Content-Type"] = "application/json";
  }

  return config;
});

// ——— Interceptor de response: 401 cleanup ———
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (location.pathname !== "/") location.href = "/";
    }
    return Promise.reject(err);
  }
);

// ——— Helper robusto para mensajes de error ———
export function extractErrorMessage(err: any): string {
  const r = err?.response;
  // pydantic/fastapi suelen mandar { detail: "..."} o { detail: [{msg, loc, ...}, ...] }
  const detail = r?.data?.detail ?? r?.data?.message ?? r?.data?.error;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0];
    if (typeof first === "string") return first;
    if (first?.msg) return String(first.msg);
  }
  if (r?.status) return `Error ${r.status}`;
  if (err?.message === "Network Error") return "No se pudo contactar la API";
  return err?.message || "Error desconocido";
}

export default api;