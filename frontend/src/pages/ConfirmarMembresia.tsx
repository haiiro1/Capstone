import { useLocation, useNavigate } from "react-router-dom";
import MainContent from "../components/MainContent";

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

  const plan: MembershipPlan =
    state?.plan ?? {
      name: "Premium",
      price: "Por definir",
      features: ["Requests ilimitadas", "Más beneficios próximamente"],
    };

  const handleConfirm = () => {
    // Luego llamas tu endpoint para crear orden o iniciar pago
    navigate("/membresia/estado", {
      state: { status: "processing", plan },
    });
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
                <li
                  key={f}
                  className="d-flex align-items-center gap-2 mb-1"
                >
                  <span className="text-success">✔</span> {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleConfirm}
              className="btn btn-primary w-100"
            >
              Confirmar
            </button>

            <p className="text-muted small mt-3 text-center">
              Serás redirigido al proceso de pago.
            </p>
          </div>
        </div>
      </div>
    </MainContent>
  );
}

export default ConfirmarMembresia;