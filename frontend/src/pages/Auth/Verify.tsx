import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

type ApiResponse = { message?: string; detail?: string };

export default function Verify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMsg("Falta el token de verificación.");
      return;
    }

    const run = async () => {
      try {
        setStatus("loading");
        const res = await api.get<ApiResponse>("/api/auth/verify", {
          params: { token },
        });

        if (cancelled) return;
        setStatus("success");
        setMsg(res.data?.message || "Tu cuenta ha sido verificada!");
      } catch (err: any) {
        if (cancelled) return;
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "No fue posible verificar tu cuenta. El enlace puede estar vencido o ser inválido.";
        setStatus("error");
        setMsg(detail);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4 text-center">
          {isLoading && (
            <>
              <div className="spinner-border mb-3" role="status" />
              <h2 className="h5">Verificando…</h2>
              <p className="text-muted mb-0">Un momento por favor.</p>
            </>
          )}
          {isSuccess && (
            <>
              <div className="text-success display-6 mb-2">
                <i className="bi bi-check-circle-fill" />
              </div>
              <h2 className="fw-bold mb-2">¡Tu cuenta está verificada!</h2>
              <div className="d-grid gap-2 mt-3">
                <Link className="btn btn-success" to="/">
                  Ir a iniciar sesión
                </Link>
              </div>
            </>
          )}
          {isError && (
            <>
              <div className="text-danger display-6 mb-2">
                <i className="bi bi-x-circle-fill" />
              </div>
              <h2 className="fw-bold mb-2">No se logro validar tu cuenta</h2>
              <div className="d-grid gap-2 mt-3">
                <Link className="btn btn-primary" to="/verify/resend">
                  Reenviar verificación
                </Link>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/")}
                >
                  Volver al inicio
                </button>
              </div>
            </>
          )}
          {status === "idle" && (
            <>
              <h2 className="fw-bold mb-2">Verificación</h2>
              <p className="text-muted mb-0">Preparando el proceso…</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
