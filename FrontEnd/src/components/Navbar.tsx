import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const getLinkClass = (path: string) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  const getButtonSpan = (path: string, text: string) =>
    location.pathname === path ? <span className="btn btn-dark btn-sm">{text}</span> : text;

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">🌱 PlantGuard</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><Link className={getLinkClass("/home")} to="/home">{getButtonSpan("/home", "Home")}</Link></li>
            <li className="nav-item"><Link className={getLinkClass("/analizar")} to="/analizar">{getButtonSpan("/analizar", "Analizar")}</Link></li>
            <li className="nav-item"><Link className={getLinkClass("/historial")} to="/historial">{getButtonSpan("/historial", "Historial")}</Link></li>
            <li className="nav-item"><Link className={getLinkClass("/alertas")} to="/alertas">{getButtonSpan("/alertas", "Alertas")}</Link></li>
            <li className="nav-item"><Link className={getLinkClass("/perfil")} to="/perfil">{getButtonSpan("/perfil", "Perfil")}</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
