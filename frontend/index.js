import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';  // No es necesario aún, pero puede venir de ayuda más tarde, a decidir con el diseño

// --- COMPONENTES ---

// Barra de Navegación
function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container">
        {/* Logo/Nombre de la App (se queda a la izquierda) */}
        <a className="navbar-brand fw-bold" href="#!">
          🌱 PlantGuard
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* Contenedor de todos los enlaces que irán a la derecha */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* 'ms-auto' empuja todo este bloque de enlaces a la derecha */}
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <a className="nav-link" href="#!">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#!">Analizar</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#!">Historial</a>
            </li>
            <li className="nav-item">
              {/* Le damos un estilo de botón oscuro al elemento activo */}
              <a className="nav-link active" href="#!">
                <span className="btn btn-dark btn-sm">Alertas</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#!">Perfil</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

// Contenido Principal - Contenedor de Vistas
function MainContent(props) {
  return (
    <div className="container py-4">
      {/* Fila superior con Título y Botones */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">{props.title}</h2>
        <div>
          <button className="btn btn-light me-2">Feedback</button>
          <button className="btn btn-light">Ayuda</button>
        </div>
      </div>

      {/* Aquí se renderizará el contenido específico de la vista (ej: Alertas) */}
      <div>
        {props.children}
      </div>
    </div>
  );
}

// -- Vistas --
// NUEVO COMPONENTE: La vista de Alertas Climáticas
function AlertasView() {
  return (
    // Usamos el sistema de Grid de Bootstrap (row/col) para las dos columnas
    <div className="row">

      {/* Columna Izquierda: Próximas alertas */}
      <div className="col-lg-6 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Próximas alertas (wireframe)</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span>☔️</span> Lluvias intensas (mañana)
                </div>
                <span className="text-muted">Severidad: Media</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span>❄️</span> Heladas (72h)
                </div>
                <span className="text-muted">Severidad: Alta</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span>☀️</span> Ola de calor (5 días)
                </div>
                <span className="text-muted">Severidad: Baja</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Preferencias */}
      <div className="col-lg-6 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Preferencias</h5>
            
            <div className="form-check my-3">
              <input className="form-check-input" type="checkbox" value="" id="checkEmail" defaultChecked />
              <label className="form-check-label" htmlFor="checkEmail">
                Notificar por email
              </label>
            </div>
            <div className="form-check my-3">
              <input className="form-check-input" type="checkbox" value="" id="checkWeb" defaultChecked />
              <label className="form-check-label" htmlFor="checkWeb">
                Notificar en la web
              </label>
            </div>
            <div className="form-check my-3">
              <input className="form-check-input" type="checkbox" value="" id="checkSevere" />
              <label className="form-check-label" htmlFor="checkSevere">
                Notificar solo alertas severas
              </label>
            </div>
            
          </div>
        </div>
      </div>
      
    </div>
  );
}




// Pie de Página
function Footer() {
  return (
    <footer className="mt-auto py-3 bg-light text-center">
      <div className="container">
        <span className="text-muted">© 2025 PlantGuard — Capstone</span>
      </div>
    </footer>
  );
}

// Aplicación Principal
function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <MainContent title="Título de la Vista">
          {/* Aquí dentro va el componente de la vista específica */}
        </MainContent>
      </main>
      <Footer />
    </div>
  );
}


// --- RENDERIZADO DE LA APP ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);