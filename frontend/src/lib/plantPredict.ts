import api from "../lib/api";

export interface PredictionItem {
  label: string;
  score: number;
}

export interface PredictResponse {
  top_k: number;
  predictions: PredictionItem[];
}

export async function predictDisease(file: File, signal?: AbortSignal): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await api.post<PredictResponse>("/api/plant/predict", form, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });
  return res.data as { top_k: number; predictions: { label: string; score: number }[] };
}
