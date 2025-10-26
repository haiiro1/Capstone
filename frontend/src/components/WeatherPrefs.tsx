import React, { useEffect, useMemo, useState } from "react";
import { getWeatherPrefs, upsertWeatherPrefs } from "../api/weatherPrefs";
import type { WeatherPrefs } from "../types/weather";

type Props = {
  show: boolean;
  onClose: () => void;
  onSaved?: (prefs: WeatherPrefs) => void;
};

const DEFAULTS: WeatherPrefs = {
  dangerous_frost_threshold: 1,
  dangerous_temp_threshold: 32,
  rain_mm_threshold: 2,
  wind_kph_threshold: 40,
};

export default function WeatherPrefs({ show, onClose, onSaved }: Props) {
  const [values, setValues] = useState<WeatherPrefs>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!show) return;
      setLoading(true);
      setError(null);
      try {
        const prefs = await getWeatherPrefs();
        if (!ignore) setValues(prefs ?? DEFAULTS);
      } catch (e: any) {
        if (!ignore)
          setError(e.message ?? "No se pudieron cargar las preferencias.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [show]);
  function setNum<K extends keyof WeatherPrefs>(key: K, raw: string) {
    const n = Number(raw);
    setValues((v) => ({ ...v, [key]: Number.isFinite(n) ? n : ("" as any) }));
  }

  const invalids = useMemo(() => {
    const i: Partial<Record<keyof WeatherPrefs, string>> = {};
    const {
      dangerous_frost_threshold,
      dangerous_temp_threshold,
      rain_mm_threshold,
      wind_kph_threshold,
    } = values;
    if (!Number.isFinite(dangerous_frost_threshold))
      i.dangerous_frost_threshold = "Número inválido";
    if (!Number.isFinite(dangerous_temp_threshold))
      i.dangerous_temp_threshold = "Número inválido";
    if (
      !Number.isFinite(rain_mm_threshold) ||
      (rain_mm_threshold as number) < 0
    )
      i.rain_mm_threshold = "Debe ser un número positivo";
    if (
      !Number.isFinite(wind_kph_threshold) ||
      (wind_kph_threshold as number) < 0
    )
      i.wind_kph_threshold = "Debe ser un número positivo";
    return i;
  }, [values]);

  const canSave = Object.keys(invalids).length === 0 && !saving;
  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const payload: WeatherPrefs = {
        dangerous_frost_threshold: Number(values.dangerous_frost_threshold),
        dangerous_temp_threshold: Number(values.dangerous_temp_threshold),
        rain_mm_threshold: Number(values.rain_mm_threshold),
        wind_kph_threshold: Number(values.wind_kph_threshold),
      };
      const saved = await upsertWeatherPrefs(payload);
      onSaved?.(saved);
      onClose();
    } catch (e: any) {
      setError(e.message ?? "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      style={{
        display: show ? "block" : "none",
        background: "rgba(0,0,0,0.5)",
      }}
      aria-modal={show}
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Configurar alertas</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            />
          </div>
          <div className="modal-body">
            {loading ? (
              <p className="text-muted mb-0">Cargando…</p>
            ) : (
              <>
                {error && (
                  <div className="alert alert-warning py-2">{error}</div>
                )}
                <div className="mb-3">
                  <label className="form-label">Temperatura baja (°C)</label>
                  <input
                    type="number"
                    className={`form-control ${
                      invalids.dangerous_frost_threshold ? "is-invalid" : ""
                    }`}
                    value={values.dangerous_frost_threshold}
                    onChange={(e) =>
                      setNum("dangerous_frost_threshold", e.target.value)
                    }
                  />
                  {invalids.dangerous_frost_threshold && (
                    <div className="invalid-feedback">
                      {invalids.dangerous_frost_threshold}
                    </div>
                  )}
                  <small className="text-muted">
                    Se activara una alerta si la temperatura es inferior a el valor.
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Temperatura alta (°C)</label>
                  <input
                    type="number"
                    className={`form-control ${
                      invalids.dangerous_temp_threshold ? "is-invalid" : ""
                    }`}
                    value={values.dangerous_temp_threshold}
                    onChange={(e) =>
                      setNum("dangerous_temp_threshold", e.target.value)
                    }
                  />
                  {invalids.dangerous_temp_threshold && (
                    <div className="invalid-feedback">
                      {invalids.dangerous_temp_threshold}
                    </div>
                  )}
                  <small className="text-muted">
                    Se activara una alerta si la temperatura es superior a el valor.
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Lluvia (mm/3h)</label>
                  <input
                    type="number"
                    min={0}
                    className={`form-control ${
                      invalids.rain_mm_threshold ? "is-invalid" : ""
                    }`}
                    value={values.rain_mm_threshold}
                    onChange={(e) =>
                      setNum("rain_mm_threshold", e.target.value)
                    }
                  />
                  {invalids.rain_mm_threshold && (
                    <div className="invalid-feedback">
                      {invalids.rain_mm_threshold}
                    </div>
                  )}
                  <small className="text-muted">
                   Se activara una alerta si se detecta lluvia superior a el valor.
                  </small>
                </div>
                <div className="mb-0">
                  <label className="form-label">Viento (km/h)</label>
                  <input
                    type="number"
                    min={0}
                    className={`form-control ${
                      invalids.wind_kph_threshold ? "is-invalid" : ""
                    }`}
                    value={values.wind_kph_threshold}
                    onChange={(e) =>
                      setNum("wind_kph_threshold", e.target.value)
                    }
                  />
                  {invalids.wind_kph_threshold && (
                    <div className="invalid-feedback">
                      {invalids.wind_kph_threshold}
                    </div>
                  )}
                  <small className="text-muted">
                    Se activara una alerta si la velocidad de viento es superior a el valor.
                  </small>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={!canSave}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
