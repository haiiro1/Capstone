export interface PredictionItem {
  label: string;
  score: number;
}

export interface PredictResponse {
  top_k: number;
  predictions: PredictionItem[];
}

const MODEL_BASE = import.meta.env.VITE_PREDICT_API;

export async function predictDisease(file: File, abortSignal?: AbortSignal): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", file, file.name);

  const res = await fetch(`${MODEL_BASE}/predict`, {
    method: "POST",
    body: form,
    signal: abortSignal,
  });

  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(`Respuesta: ${res.status}: ${msg || res.statusText}`);
  }

  const json = (await res.json()) as PredictResponse;
  if (!json || typeof json.top_k !== "number" || !Array.isArray(json.predictions)) {
    throw new Error("API_UNEXPECTED_RESPONSE");
  }
  return json;
}

async function safeText(r: Response) {
  try { return await r.text(); } catch { return ""; }
}
