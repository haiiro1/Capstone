import api from "../lib/api";

export type PredictionRecord = {
  id: string;
  date_created: string;
  title: string;
  probability: number;
  severity?: string | null;
  advice: string[];
};

export async function fetchPredictHistory(
  limit = 50,
  offset = 0,
  signal?: AbortSignal
): Promise<PredictionRecord[]> {
  const { data } = await api.get<PredictionRecord[]>(
    `/api/plant/predict/history`,
    { params: { limit, offset }, signal }
  );
  return data;
}
