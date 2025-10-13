import api from "../lib/api";

export interface PredictionItem {
  label: string;
  score: number;
}

export interface PredictResponse {
  top_k: number;
  predictions: PredictionItem[];
}

export async function predictDisease(
  file: File,
  signal?: AbortSignal
): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", file, file.name);

  const res = await api.post("/api/plant/predict", form, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });

  const raw = res.data;
  const top_k = Number(raw?.top_k ?? 0);

  const predictions = (raw?.predictions ?? []).map((p: any) => ({
    label: p.labels_es || p.label_en || "—",
    score:
      typeof p.probabilty === "number"
        ? p.probabilty
        : typeof p.probability === "number"
        ? p.probability
        : 0,
  }));

  return { top_k, predictions };
}
