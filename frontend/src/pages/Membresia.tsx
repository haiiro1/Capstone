import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MainContent from "../components/MainContent";
import api from "../lib/api";

function Membresia() {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const plans = [
    {
      name: "Free",
      price: "Gratis",
      features: ["5 análisis diarios", "Lo demás: por definir"],
    },
    {
      name: "PlantGuard Premium",
      price: "$9.990",
      features: ["Análisis ilimitados", "Lo demás: por definir"],
    },
  ];

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data } = await api.get("/api/subscription/status");
        setIsPremium(data.is_active);
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setIsPremium(false);
      } finally {
        setLoadingStatus(false);
      }
    };

    checkSubscription();
  }, []);

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
                    <p className="card-text text-primary fw-bold">
                      {plan.price}
                    </p>

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
                  {plan.name === "PlantGuard Premium" && (
                    <button
                      className={`btn w-100 mt-3 ${
                        isPremium
                          ? "btn-secondary disabled"
                          : "btn-outline-primary"
                      }`}
                      disabled={isPremium || loadingStatus}
                      onClick={() => {
                        if (!isPremium) {
                          navigate("/membresia/confirmar", { state: { plan } });
                        }
                      }}
                    >
                      {loadingStatus
                        ? "Verificando..."
                        : isPremium
                        ? "Ya eres PlantGuard Premium!"
                        : "Elegir"}
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
