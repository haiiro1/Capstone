import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-auto py-3 bg-light text-center">
      <div className="container d-flex justify-content-between align-items-center">
        <span className="text-muted">© 2025 PlantGuard — Capstone</span>
        <ul className="nav list-inline mb-0">
          <li className="list-inline-item"><Link to="/ayuda" className="text-muted">Ayuda</Link></li>
          <li className="list-inline-item"><Link to="/faq" className="text-muted">FAQ</Link></li>
          <li className="list-inline-item"><Link to="/terminos" className="text-muted">Términos</Link></li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
