import { FormEvent, useState } from "react";
import api from "../../lib/api";

type ApiResponse = { message?: string; detail?: string };

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let cancelled = false;
    try {
      setIsSubmitting(true);
      setMsg(null);
      setErr(null);

      const res = await api.post<ApiResponse>("api/auth/password/reset/init", {
        email,
      });
      if (!cancelled) {
        setMsg(
          res.data?.message ??
            "Si existe una cuenta asociada a este mail, recibirás un correo para restablecer tu contraseña."
        );
      }
    } catch (e: any) {
      if (!cancelled) {
        const detail =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "No fue posible procesar la solicitud.";
        setErr(detail);
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
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-muted text-center mb-4">
            Ingresa tu correo y te enviaremos un correo para restablecerla.
          </p>
          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Correo
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="d-grid">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
