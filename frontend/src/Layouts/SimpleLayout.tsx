import { Outlet, Link } from "react-router-dom";
import Footer from "../components/Footer";

function SimpleLayout() {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Encabezado simple para lectura sencilla */}
      <header className="py-3 bg-white border-bottom shadow-sm">
        <div className="container">
           <Link className="navbar-brand fw-bold" to="/">🌱 PlantGuard</Link>
        </div>
      </header>

      {/* Contenido de la página de Términos) */}
      <main className="flex-grow-1 py-5">
        <div className="container">
            <div className="col-md-8 mx-auto bg-white p-4 p-md-5 rounded shadow-sm">
                 <Outlet /> 
                <div className="text-center">
                    <Link to="/register" className="btn btn-outline-secondary">
                        Volver
                    </Link>
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
