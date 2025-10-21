import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../lib/api";

type ApiResponse = { message?: string; detail?: string };

export default function ResendVerification() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverErr, setServerErr] = useState<string | null>(null);

  useEffect(() => {
    const e = params.get("email");
    if (e) setEmail(e);
  }, [params]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let cancelled = false;
    try {
      setIsSubmitting(true);
      setServerMsg(null);
      setServerErr(null);
      const res = await api.post<ApiResponse>(
        "api/auth/verify/resend",
        null,
        {
          params: { email },
        }
      );
      if (!cancelled) {
        setServerMsg(
          res.data?.message ||
            "Recibirás un correo de verificación en breve. Revisa tu carpeta de SPAM en caso de no estar en tu inbox."
        );
      }
    } catch (err: any) {
      if (!cancelled) {
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "No fue posible procesar la solicitud.";
        setServerErr(detail);
      }
    } finally {
      if (!cancelled) setIsSubmitting(false);
    }
    return () => {
      cancelled = true;
    };
  };

  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2 text-center">
            No te ha llegado el link de validación?
          </h2>
          <p className="text-muted text-center mb-4">
            Ingresa tu correo y para recibir un nuevo enlace de verificación.
          </p>
          {serverMsg && <div className="alert alert-success">{serverMsg}</div>}
          {serverErr && <div className="alert alert-danger">{serverErr}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Correo
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="d-grid mb-3">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
          <p className="text-center small text-muted mb-0">
            Ya validaste tu cuenta? <Link to="/">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
