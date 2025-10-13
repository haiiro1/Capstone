import api from "../lib/api";

export interface PredictionItem {
  label: string;
  score: number;
}

export interface PredictResponse {
  top_k: number;
  predictions: PredictionItem[];
}

const BACKEND = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function predictDisease(file: File, signal?: AbortSignal): Promise<PredictResponse> {
  const url = `${BACKEND}/api/plant/predict`;
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await api.post<PredictResponse>(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });
  return res.data as { top_k: number; predictions: { label: string; score: number }[] };
}
