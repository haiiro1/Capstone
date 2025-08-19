import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (event: { preventDefault: () => void; }) => {
    event.preventDefault(); 
    navigate("/home"); 
  };

  return (
    <div>
      <h2 className="fw-bold mb-2">Inicia sesión</h2>
      <p className="text-muted mb-4">
        Accede a tu panel para analizar y configurar alertas
      </p>

      {/* Usamos onSubmit para que funcione al presionar Enter en un campo */}
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo</label>
          <input type="email" className="form-control" id="email" placeholder="tu@correo.com" />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input type="password" className="form-control" id="password" placeholder="********" />
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id="rememberMe" />
            <label className="form-check-label" htmlFor="rememberMe">Recordarme</label>
          </div>
          <a href="#!" className="small">¿Olvidaste tu contraseña?</a>
        </div>
        <div className="d-grid mb-3">
          {/* 4. El botón ahora llama a nuestra función. Lo dejamos como type="submit" */}
          <button type="submit" className="btn btn-success">Entrar</button>
        </div>
      </form>
      
      <p className="text-center small text-muted">
        No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}

export default Login;
