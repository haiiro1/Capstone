import { Outlet } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";

function AuthLayout() {
  return (
    <div className="container-fluid">
      <div className="row" style={{ minHeight: '100vh' }}>
        {/* Columna Izquierda: Panel Verde */}
        <div className="col-lg-6 d-none d-lg-flex p-0">
          <AuthPanel />
        </div>

        {/* Columna Derecha: Contenido del Formulario */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-4">
          {/* Outlet renderizará aquí el componente Login o Register */}
          <div className="w-100" style={{ maxWidth: '450px' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;