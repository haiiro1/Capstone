import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import MainContent from "../components/MainContent";
import api from "../lib/api";

interface PaymentStatusResponse {
  status: string;
  metadata: any;
}

export default function MembresiaEstado() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useLocation();

  const orderId = searchParams.get("order_id");
  const stateStatus = state?.status;

  const [loading, setLoading] = useState(true);
  const [displayStatus, setDisplayStatus] = useState<string | null>(null);

  useEffect(() => {
    if (stateStatus === "active") {
      setDisplayStatus("active");
      setLoading(false);
      return;
    }

    const verifyTransaction = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get<PaymentStatusResponse>(
          `/api/transaction/status/${orderId}`
        );
        setDisplayStatus(data.status);
      } catch (error) {
        console.error("Verification failed", error);
        setDisplayStatus("error");
      } finally {
        setLoading(false);
      }
    };

    verifyTransaction();
  }, [orderId, stateStatus]);

  const getUIContent = () => {
    if (loading)
      return {
        title: "Verificando...",
        subtitle: "Estamos confirmando tu pago con el banco.",
        icon: "🔄",
      };

    switch (displayStatus) {
      case "paid":
        return {
          title: "Pago Exitoso!",
          subtitle: `Tu orden #${orderId} fue confirmada y tu suscripción está activa.`,
          icon: "✅",
          action: () => navigate("/home"),
          btnText: "Ir al Dashboard",
          isSuccess: true,
        };

      case "active":
        return {
          title: "Membresía Activa!",
          subtitle: "Ya tienes una suscripción vigente.",
          icon: "🎉",
          action: () => navigate("/home"),
          btnText: "Ir al Dashboard",
          isSuccess: true,
        };

      case "failed":
      case "rejected":
        return {
          title: "Pago Fallido",
          subtitle:
            "El banco rechazó la transacción o anulaste la transacción.",
          icon: "❌",
          action: () => navigate("/membresia"),
          btnText: "Intentar con otro medio de pago",
          isSuccess: false,
        };

      case "pending":
        return {
          title: "Pago Pendiente",
          subtitle:
            "Aún no recibimos la confirmación del banco. Espera unos instantes.",
          icon: "⏳",
          action: () => window.location.reload(),
          btnText: "Actualizar Estado",
          isSuccess: false,
        };

      default:
        return {
          title: "Error de Verificación",
          subtitle: "No pudimos encontrar la información de esta orden.",
          icon: "❓",
          action: () => navigate("/Help"),
          btnText: "Contactar Soporte",
          isSuccess: false,
        };
    }
  };

  const ui = getUIContent();

  return (
    <MainContent title="Estado de la Membresía">
      <div className="container py-5 d-flex justify-content-center align-items-center">
        <div
          className="card shadow-lg border-0"
          style={{ maxWidth: 450, width: "100%" }}
        >
          <div className="card-body text-center p-5">
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
              {ui.icon}
            </div>

            <h3 className="fw-bold mb-3">{ui.title}</h3>
            <p className="text-muted mb-4">{ui.subtitle}</p>

            <div className="d-grid gap-2">
              <button
                onClick={ui.action}
                className={`btn btn-lg ${
                  ui.isSuccess ? "btn-success" : "btn-primary"
                }`}
              >
                {ui.btnText}
              </button>
            </div>
            {orderId && (
              <p className="small text-muted mt-3 mb-0">Order ID: {orderId}</p>
            )}
          </div>
        </div>
      </div>
    </MainContent>
  );
}
