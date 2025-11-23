import { useLocation, useNavigate } from "react-router-dom";
import MainContent from "../components/MainContent";

type MembershipPlan = {
  name: string;
  price: string;
};

type Status = "processing" | "completed";

type LocationState = {
  status?: Status;
  plan?: MembershipPlan;
};

export default function MembresiaEstado() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };

  const status: Status = state?.status ?? "processing";
  const plan = state?.plan;

  const isCompleted = status === "completed";

  const title = isCompleted
    ? "¡Tu membresía está activa!"
    : "Procesando tu orden…";

  const subtitle = isCompleted
    ? "Tu suscripción ya está configurada. Gracias por unirte a PlantGuard."
    : "Esto puede tardar unos segundos, no cierres esta página.";

  return (
    <MainContent title="Estado de la Membresía">
      <div className="container py-4 d-flex justify-content-center">
        <div className="card shadow-sm text-center" style={{ maxWidth: 420 }}>
          <div className="card-body">

            {/* Título */}
            <h5 className="fw-bold mb-2">{title}</h5>
            <p className="text-muted small mb-3">{subtitle}</p>

            {/* Datos del plan */}
            {plan && (
              <div className="mb-4">
                <p className="fw-semibold mb-1">
                  Plan seleccionado: <span className="text-primary">{plan.name}</span>
                </p>
                <p className="text-muted">{plan.price}</p>
              </div>
            )}

            {/* Botón Dashboard */}
            <button
              onClick={() => navigate("/home")}
              className="btn btn-outline-primary w-100"
            >
              Ir al Dashboard
            </button>

            {/* Mensaje adicional cuando está procesando */}
            {!isCompleted && (
              <p className="text-muted small mt-3">
                Si esto demora demasiado, revisa tu correo o vuelve más tarde.
              </p>
            )}
          </div>
        </div>
      </div>
    </MainContent>
  );
}