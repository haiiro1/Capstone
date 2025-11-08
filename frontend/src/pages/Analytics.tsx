import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import MainContent from "../components/MainContent";
import { predictDisease, type PredictResponse } from "../lib/plantPredict";

function Analytics() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const sortedPreds = useMemo(() => {
    if (!result?.predictions) return [];
    return [...result.predictions].sort(
      (a, b) => b.probability - a.probability
    );
  }, [result]);

  function toggleExpand(id: string) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  function isHealthy(p: { title: string }) {
    const t = p.title.toLowerCase();
    return (t.includes("sano"));
  }

  const onPickClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onFilesChosen = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      setFile(f);
      setResult(null);
      setError(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(f));
    },
    [previewUrl]
  );

  const onDrop = useCallback(
    (ev: React.DragEvent<HTMLDivElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.dataTransfer.files?.length) {
        onFilesChosen(ev.dataTransfer.files);
      }
    },
    [onFilesChosen]
  );

  const onDragOver = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
  }, []);

  const onClear = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    abortRef.current?.abort();
    abortRef.current = null;
  }, [previewUrl]);

  const onAnalyze = useCallback(async () => {
    if (!file) {
      setError("Recuerda subir una imagen.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const data = await predictDisease(file, ctrl.signal);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "model_couldnt_analyze_img");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [file]);
  const top1 = sortedPreds[0];

  return (
    <MainContent title="Analizar planta">
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Sube una imagen</h5>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onFilesChosen(e.target.files)}
              />
              <div
                className="text-center p-5 border-2 border-dashed rounded bg-body mt-3"
                style={{ cursor: "pointer" }}
                onClick={onPickClick}
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 320,
                      borderRadius: 12,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <>
                    <p className="text-muted">📷 Arrastra la foto aquí</p>
                    <p className="small text-muted">
                      o haz clic para seleccionar
                    </p>
                  </>
                )}
              </div>
              {error && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  {error}
                </div>
              )}
              <div className="mt-3 text-end">
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={onClear}
                  disabled={loading && !!abortRef.current}
                >
                  Limpiar
                </button>
                {!loading ? (
                  <button
                    className="btn btn-body"
                    onClick={onAnalyze}
                    disabled={!file}
                  >
                    Analizar
                  </button>
                ) : (
                  <button
                    className="btn btn-warning"
                    onClick={() => abortRef.current?.abort()}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Sugerencias</h5>
              <ul className="mb-0">
                <li>Tomar la foto con buena luz natural.</li>
                <li>Enfocar hojas afectadas a 20–30 cm.</li>
                <li>Evitar fondos muy complejos.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Resultado</h5>
              {loading && (
                <div className="mt-3">
                  <div className="placeholder-glow">
                    <span className="placeholder col-7"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-6"></span>
                    <span className="placeholder col-8"></span>
                  </div>
                  <p className="text-muted small mt-3">Analizando imagen…</p>
                </div>
              )}
              {!loading && error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                </div>
              )}
              {!loading && !result && !error && (
                <div className="text-muted">
                  Sube una imagen y presiona “Analizar”.
                </div>
              )}
              {!loading &&
                result &&
                result.predictions.length === 0 &&
                !error && (
                  <div className="alert alert-success mt-3" role="alert">
                    No se detectaron enfermedades!
                  </div>
                )}
              {!loading &&
                result &&
                result.predictions.length > 0 &&
                !error && (
                  <div className="mt-2">
                    <p className="mb-1 text-muted small">Análisis</p>
                    {top1 && (
                      <h4 className="mb-2">
                        {top1.title}{" "}
                        <span className="fs-6 text-muted">
                          ({Math.round(top1.probability * 100)}%)
                        </span>
                      </h4>
                    )}
                    <hr />
                    <p className="mb-1 text-muted small">Predicciones</p>
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Enfermedad</th>
                            <th className="text-end">Confianza</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedPreds.map((p, idx) => {
                            const id = `${p.title}-${idx}`;
                            const isTop = idx === 0;
                            const isOpen = !!expanded[id];
                            return (
                              <Fragment key={id}>
                                <tr>
                                  <td>
                                    {isTop ? (
                                      <div className="d-flex align-items-center gap-2">
                                        <span>{p.title}</span>
                                        {!isHealthy(p) && p.severity ? (
                                          <span className="badge bg-warning text-dark">{p.severity}</span>
                                        ) : isHealthy(p) ? (
                                          <span className="badge bg-success">Sana</span>
                                        ) : null}
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        className="btn btn-link p-0 text-start"
                                        onClick={() => toggleExpand(id)}
                                        aria-expanded={isOpen}
                                        aria-controls={`rec-${id}`}
                                        style={{ textDecoration: "none" }}
                                      >
                                        <span className="me-1" aria-hidden="true">
                                          {isOpen ? "▾" : "▸"}
                                        </span>
                                        {p.title}
                                        {!isHealthy(p) && p.severity ? (
                                          <span className="badge bg-warning text-dark ms-2">{p.severity}</span>
                                        ) : isHealthy(p) ? (
                                          <span className="badge bg-success">Sana</span>
                                        ) : null}
                                      </button>
                                    )}
                                  </td>
                                  <td className="text-end">
                                    {Math.round(p.probability * 100)}%
                                  </td>
                                </tr>
                                {!isTop && isOpen && (
                                  <tr id={`rec-${id}`}>
                                    <td colSpan={2}>
                                      {p.advice?.length ? (
                                        <ul className="small mb-0">
                                          {p.advice.map((a, i) => (
                                            <li key={i}>{a}</li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="small text-muted mb-0">
                                          Sin recomendaciones específicas.
                                        </p>
                                      )}
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {top1 && (
                      <div className="mt-3">
                        <p className="mb-1 text-muted small">Recomendación</p>
                        {isHealthy(top1) ? (
                          <div className="badge bg-success text-light mb-1">
                            Tu planta parece sana. Sigue así!
                          </div>
                        ) : top1.severity && (
                          <div className="mb-2">
                            <span className="badge bg-warning text-dark">
                              Severidad: {top1.severity}
                            </span>
                          </div>
                        )}
                        {top1.advice?.length ? (
                          <ul className="small mb-0">
                            {top1.advice.map((a, i) => (
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
                    <div className="mt-3">
                      <small className="text-muted d-block">
                        {result.disclaimer || ""}
                      </small>
                      {result.date_created && (
                        <small className="text-muted d-block">
                          <hr />
                          Analizado:{" "}
                          {new Date(result.date_created).toLocaleString()}
                        </small>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}

const Analizar = Analytics;
export default Analizar;
