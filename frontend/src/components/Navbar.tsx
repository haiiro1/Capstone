import { Link, useLocation,useNavigate } from "react-router-dom";
import { TOKEN_KEY } from "../lib/api";
import ThemeToggleSwitch from "./ThemeToggleSwitch";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const getLinkClass = (path: string) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  const getButtonSpan = (path: string, text: string) =>
    location.pathname === path ? <span className="btn btn-dark btn-sm">{text}</span> : text;

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("pg_user");
     navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom shadow-sm">
      <style>{`.navbar { background-color: var(--bs-body-bg); }`}</style>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/home">🌱 PlantGuard</Link>
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
            <li className="nav-item"><Link className={getLinkClass("/Help")} to="/Help">{getButtonSpan("/Help", "Help")}</Link></li>
            <li className="nav-item"><Link className={getLinkClass("/membresia")} to="/membresia">{getButtonSpan("/Membresia", "Membresia")}</Link></li>
            <li className="nav-item ms-3"><ThemeToggleSwitch /></li>
            <li className="nav-item ms-3"><button onClick={handleLogout} className="btn btn-outline-danger btn-sm">Cerrar sesión</button></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;