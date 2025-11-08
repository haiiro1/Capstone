import { useEffect, useRef, useState } from "react";
import {
  fetchPredictSummary,
  type PredictSummary,
} from "../lib/predictSummary";

export function usePredictSummary() {
  const [summary, setSummary] = useState<PredictSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ctrlRef = useRef<AbortController | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setLoading(true);
    setError(null);

    fetchPredictSummary(ctrl.signal)
      .then(setSummary)
      .catch((e) => {
        if (ctrl.signal.aborted || e?.code === "ERR_CANCELED") return;
        setError("No se pudo cargar el resumen.");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  return { summary, loading, error };
}
