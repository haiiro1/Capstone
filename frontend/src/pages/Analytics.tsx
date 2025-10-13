import { useCallback, useMemo, useRef, useState } from "react";
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

  const top1 = useMemo(() => {
    if (!result?.predictions?.length) return null;
    return [...result.predictions].sort((a, b) => b.score - a.score)[0];
  }, [result]);

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
                className="text-center p-5 border-2 border-dashed rounded bg-light mt-3"
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
                    className="btn btn-dark"
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
                    {(() => {
                      const top1 = [...result.predictions].sort(
                        (a, b) => b.score - a.score
                      )[0];
                      return (
                        <h4 className="mb-2">
                          {top1?.label ?? "—"}{" "}
                          {typeof top1?.score === "number" && (
                            <span className="fs-6 text-muted">
                              ({Math.round(top1.score * 100)}%)
                            </span>
                          )}
                        </h4>
                      );
                    })()}
                    <hr />
                    <p className="mb-1 text-muted small">Predicciones</p>
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Enfermedades</th>
                            <th className="text-end">Confianza</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...result.predictions]
                            .sort((a, b) => b.score - a.score)
                            .map((p, idx) => (
                              <tr key={`${p.label}-${idx}`}>
                                <td>{p.label}</td>
                                <td className="text-end">
                                  {Math.round(p.score * 100)}%
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <details className="mt-3">
                      <summary className="small text-muted">Ver JSON</summary>
                      <pre className="mt-2 mb-0 small">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </details>
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
