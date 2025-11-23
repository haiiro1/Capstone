import { useNavigate } from "react-router-dom";
import MainContent from "../components/MainContent";

function Membresia() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "Gratis",
      features: ["5 requests diarias", "Lo demás: por definir"],
    },
    {
      name: "Premium",
      price: "Por definir",
      features: ["Requests ilimitadas", "Lo demás: por definir"],
    },
  ];

  return (
    <MainContent title="Membresía PlantGuard">
      <div className="container py-5 text-center">
        <h1 className="mb-4 fw-bold">Planes de Membresía</h1>

        <div className="row g-4 justify-content-center">
          {plans.map((plan) => (
            <div key={plan.name} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title fw-semibold">{plan.name}</h5>
                    <p className="card-text text-primary fw-bold">{plan.price}</p>

                    <ul className="list-unstyled mt-3 mb-4 small text-muted">
                      {plan.features.map((f: string) => (
                        <li
                          key={f}
                          className="d-flex justify-content-center align-items-center gap-2"
                        >
                          <span className="text-success">✔</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Botón solo para Premium */}
                  {plan.name === "Premium" && (
                    <button
                      className="btn btn-outline-primary w-100 mt-3"
                      onClick={() =>
                        navigate("/membresia/confirmar", { state: { plan } })
                      }
                    >
                      Elegir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainContent>
  );
}

export default Membresia;