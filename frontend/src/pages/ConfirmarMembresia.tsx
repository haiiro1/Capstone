import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainContent from "../components/MainContent";
import { isAxiosError } from "axios";
import api from "../lib/api";

type MembershipPlan = {
  name: string;
  price: string;
  features: string[];
};

type LocationState = {
  plan?: MembershipPlan;
};

function ConfirmarMembresia() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan: MembershipPlan = state?.plan ?? {
    name: "PlantGuard Premium",
    price: "$9.990",
    features: ["Análisis ilimitados", "Más beneficios próximamente"],
  };

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/api/transaction/start");
      const form = document.createElement("form");

      form.method = "POST";
      form.action = data.payment_url;

      const tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "token_ws";
      tokenInput.value = data.token;

      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
      setLoading(false);

      if (isAxiosError(err)) {
        if (err.response?.status === 400) {
          const detail = err.response.data?.detail;
          if (detail === "active_subscription_exists") {
            navigate("/membresia/estado", {
              state: {
                status: "active",
                message: "Ya tienes una suscripción activa.",
              },
            });
            return;
          }
        }
        setError("Error al comunicarse con el servidor.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    }
  };

  return (
    <MainContent title="Confirmar Membresía">
      <div className="container py-4 d-flex justify-content-center">
        <div className="card shadow-sm" style={{ maxWidth: 420 }}>
          <div className="card-body">
            <h5 className="card-title fw-bold text-center mb-3">
              Revisa tu plan
            </h5>
            <div className="text-center mb-3">
              <p className="fw-semibold mb-1">{plan.name}</p>
              <p className="text-primary fw-bold">{plan.price}</p>
            </div>
            <ul className="list-unstyled small text-muted mb-4">
              {plan.features.map((f: string) => (
                <li key={f} className="d-flex align-items-center gap-2 mb-1">
                  <span className="text-success">✔</span> {f}
                </li>
              ))}
            </ul>
            {error && (
              <div className="alert alert-danger py-2 small text-center">
                {error}
              </div>
            )}
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="btn btn-primary w-100"
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Procesando...
                </span>
              ) : (
                "Ir a Pagar"
              )}
            </button>
            <p className="text-muted small mt-3 text-center">
              Serás redirigido a Webpay (Transbank) de forma segura.
            </p>
          </div>
        </div>
      </div>
    </MainContent>
  );
}

export default ConfirmarMembresia;
