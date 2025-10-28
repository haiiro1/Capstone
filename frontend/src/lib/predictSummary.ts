import api from "../lib/api";

export type PredictSummary = {
  last_analysis?: string | null;
  last_title?: string | null;
  last_probability?: number | null;
  total_count: number;
  healthy_count: number;
  diseased_count: number;
  avg_confidence?: number | null;
  healthy_pct: number;
  diseased_pct: number;
};

export async function fetchPredictSummary(
  signal?: AbortSignal
): Promise<PredictSummary> {
  const { data } = await api.get<PredictSummary>("/api/plant/predict/summary", {
    signal,
  });
  return data;
}
