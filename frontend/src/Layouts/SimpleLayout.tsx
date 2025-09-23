import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function SimpleLayout() {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Encabezado simple para lectura sencilla */}
      <header className="py-3 bg-white border-bottom shadow-sm">
        <div className="container">
           <button onClick={handleGoBack} className="btn btn-link text-decoration-none text-dark fw-bold p-0">
            🌱 PlantGuard
          </button>
        </div>
      </header>

      {/* Contenido de la página de Términos) */}
      <main className="flex-grow-1 py-5">
        <div className="container">
            <div className="col-md-8 mx-auto bg-white p-4 p-md-5 rounded shadow-sm">
                 <Outlet /> 
                <div className="text-center">
                    <button onClick={handleGoBack} className="btn btn-outline-secondary">
                      ← Volver
                    </button>
                </div>
            </div>
        </div>

      </main>

       {/* Footer simple */}
      <Footer />
    </div>
  );
}

export default SimpleLayout;
