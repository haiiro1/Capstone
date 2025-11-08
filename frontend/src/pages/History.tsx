import { useEffect, useState } from "react";
import MainContent from "../components/MainContent";
import {
  fetchPredictHistory,
  type PredictionRecord,
} from "../lib/predictHistory";

function History() {
  const [items, setItems] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const ctrl = new AbortController();
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchPredictHistory(50, 0, ctrl.signal)
      .then((data) => {
        if (!isMounted) return;
        setItems(data);
      })
      .catch((e: any) => {
        if (
          axios.isCancel?.(e) ||
          e?.code === "ERR_CANCELED" ||
          e?.name === "AbortError"
        ) {
          return;
        }
        if (!isMounted) return;
        setError(e?.message ?? "No se pudo cargar el historial");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
      if (!ctrl.signal.aborted) ctrl.abort();
    };
  }, []);

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  const hasData = items.length > 0;

  return (
    <MainContent title="Historial de análisis">
      <div className="card">
        <div className="card-body">
          <div className="list-group list-group-flush">
            <div className="list-group-item d-none d-md-flex">
              <div className="row w-100">
                <div className="col-md-3 fw-bold">Fecha</div>
                <div className="col-md-3 fw-bold">Etiqueta</div>
                <div className="col-md-3 fw-bold">Confianza</div>
                <div className="col-md-3 fw-bold">Acciones</div>
              </div>
            </div>
            {loading && (
              <div className="list-group-item">
                <div className="placeholder-glow">
                  <span className="placeholder col-3"></span>
                  <span className="placeholder col-4"></span>
                  <span className="placeholder col-2"></span>
                </div>
              </div>
            )}
            {!loading && error && (
              <div className="list-group-item">
                <div className="alert alert-danger mb-0">{error}</div>
              </div>
            )}
            {!loading && !error && !hasData && (
              <div className="list-group-item text-muted">
                No tienes ningun análisis!
              </div>
            )}
            {!loading &&
              !error &&
              hasData &&
              items.map((item) => {
                const open = !!expanded[item.id];
                const dateStr = new Date(item.date_created).toLocaleString();
                const pct = Math.round(item.probability * 100);
                return (
                  <div
                    key={item.id}
                    className="list-group-item list-group-item-action"
                  >
                    <div className="row w-100 align-items-center">
                      <div className="col-md-3">
                        <span className="d-md-none fw-bold">Fecha: </span>
                        {dateStr}
                      </div>
                      <div className="col-md-3">
                        <span className="d-md-none fw-bold">Etiqueta: </span>
                        <span className="me-2">{item.title}</span>
                        {item.title.toLowerCase().includes("sano") ? (
                          <span className="badge bg-success">Sana</span>
                        ) : item.severity ? (
                          <span className="badge bg-warning text-dark">
                            {item.severity}
                          </span>
                        ) : null}
                      </div>
                      <div className="col-md-3">
                        <span className="d-md-none fw-bold">Confianza: </span>
                        {pct}%
                      </div>
                      <div className="col-md-3 text-md-start">
                        <button
                          className="btn btn-outline-secondary btn-sm mt-2 mt-md-0"
                          onClick={() => toggle(item.id)}
                          aria-expanded={open}
                          aria-controls={`adv-${item.id}`}
                        >
                          {open ? "Ocultar" : "Ver"}
                        </button>
                      </div>
                    </div>
                    {open && (
                      <div id={`adv-${item.id}`} className="mt-2">
                        {item.advice?.length ? (
                          <ul className="small mb-0">
                            {item.advice.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="small text-muted mb-0">
                            Sin recomendaciones específicas.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </MainContent>
  );
}

const Historial = History;
export default Historial;
