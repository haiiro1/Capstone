import api from "../lib/api";

export type PredictionItem = {
  title: string;
  severity?: string | null;
  advice: string[];
  probability: number;
};

export type PredictResponse = {
  model_version?: string;
  top_k: number;
  lang?: string;
  date_created: string;
  predictions: PredictionItem[];
  disclaimer?: string;
};

// so much more simplified after dealing w the parse directly in back ;w;
export async function predictDisease(
  file: File,
  signal?: AbortSignal
): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", file, file.name);

  const { data } = await api.post<PredictResponse>("/api/plant/predict", form, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });

  return data;
}
