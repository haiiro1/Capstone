import { useEffect, useRef, useState } from "react";
import api from "../lib/api";

export type AlertItem = { date: string; alerts: string[] };

export function useWeatherAlerts(address?: string) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ctrlRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!address) {
      setAlerts([]);
      setError("Por favor ingresa una dirección para ver el clima.");
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const encoded = encodeURIComponent(address);
        const { data } = await api.get<AlertItem[]>(
          `/api/alerts/weather/events?address=${encoded}`,
          { signal: ctrl.signal }
        );
        setAlerts(data || []);
      } catch (err: any) {
        if (ctrl.signal.aborted || err?.code === "ERR_CANCELED") return;
        console.error(err);
        setError("No se pudo cargar la información del clima en este momento.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [address]);

  return { alerts, loading, error };
}
