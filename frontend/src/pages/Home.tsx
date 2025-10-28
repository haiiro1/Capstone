import MainContent from "../components/MainContent";
import { useLocation } from "../contexts/LocationContext";
import { useWeatherAlerts } from "../hooks/userWeatherAlerts";
import { usePredictSummary } from "../hooks/usePredictSummary";

function Home() {
  const { address } = useLocation();
  const { alerts, loading: alertsLoading } = useWeatherAlerts(address);
  const { summary, loading: summaryLoading } = usePredictSummary();
  const alertsTotal = alerts.reduce((acc, item) => acc + item.alerts.length, 0);
  const lastDate = summary?.last_analysis
    ? new Date(summary.last_analysis).toLocaleString()
    : "—";
  const lastConf =
    typeof summary?.last_probability === "number"
      ? `${Math.round(summary.last_probability * 100)}%`
      : "—";
  const total = summary?.total_count ?? 0;
  const diseased = summary?.diseased_count ?? 0;
  const healthyPct = Math.round(summary?.healthy_pct ?? 0);
  const diseasedPct = Math.round(summary?.diseased_pct ?? 0);
  const avgConf =
    typeof summary?.avg_confidence === "number"
      ? `${Math.round(summary.avg_confidence * 100)}%`
      : "—";

  return (
    <MainContent title="Dashboard">
      <div className="row mb-4">
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted small">
                Plantas analizadas
              </h5>
              <p className="card-text fs-2 fw-bold">
                {summaryLoading ? "…" : <>🍃 {total}</>}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted small">
                Riesgos detectados
              </h5>
              <p className="card-text fs-2 fw-bold">
                {summaryLoading ? "…" : <>⚠️ {diseased}</>}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted small">
                Alertas climáticas
              </h5>
              <p className="card-text fs-2 fw-bold">
                {alertsLoading ? "…" : <>🌦️ {alertsTotal}</>}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted small">Último análisis</h5>
              <p className="card-text fs-2 fw-bold">
                {summaryLoading ? "…" : <>🕙 {lastDate}</>}
              </p>
              {!summaryLoading && summary?.last_title && (
                <p className="mb-0 text-muted small">
                  {summary.last_title} {lastConf !== "—" && <>({lastConf})</>}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Subir imagen rápida</h5>
              <div className="text-center p-4 border-2 border-dashed rounded bg-Body mt-3 flex-grow-1 d-flex align-items-center justify-content-center">
                <div>
                  <p className="text-muted mb-0">📤 Arrastra una imagen aquí</p>
                  <p className="small text-muted mb-0">
                    o haz clic para seleccionar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Resumen de salud</h5>
              {summaryLoading ? (
                <ul className="list-unstyled mt-3">
                  <li className="mb-2 text-muted">Cargando…</li>
                </ul>
              ) : (
                <ul className="list-unstyled mt-3">
                  <li className="mb-2">✔️ {healthyPct}% sanas</li>
                  <li className="mb-2">🔶 {diseasedPct}% enfermas</li>
                  <li className="mb-2">❔ Prom. confianza: {avgConf}</li>
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Alertas del clima</h5>
              <ul className="list-unstyled mt-3">
                {alertsLoading && (
                  <li className="mb-2 text-muted">Cargando alertas...</li>
                )}
                {!alertsLoading && alerts.length === 0 && (
                  <li className="mb-2 text-success">
                    ✅ No hay alertas climáticas activas
                  </li>
                )}
                {!alertsLoading &&
                  alerts.map((item) =>
                    item.alerts.map((a, i) => (
                      <li key={`${item.date}-${i}`} className="mb-2">
                        ⚠️ {a}{" "}
                        <small className="text-muted">({item.date})</small>
                      </li>
                    ))
                  )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}

export default Home;
