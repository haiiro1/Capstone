import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// --- COMPONENTES ESTRUCTURALES (Estos no los toques por ahora) ---

// Barra de Navegación
function Navbar() {
  const location = useLocation();
  const getLinkClass = (path) => location.pathname === path ? "nav-link active" : "nav-link";
  const getButtonSpan = (path, text) => {
    if (location.pathname === path) {
      return <span className="btn btn-dark btn-sm">{text}</span>;
    }
    return text;
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">🌱 PlantGuard</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><Link className={getLinkClass("/")} to="/">{getButtonSpan("/", "Home")}</Link></li>
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

// Molde para el contenido de cada página
function MainContent(props) {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">{props.title}</h2>
        <div>
          <button className="btn btn-light me-2">Feedback</button>
          <button className="btn btn-light">Ayuda</button>
        </div>
      </div>
      <div>{props.children}</div>
    </div>
  );
}




// --- VISTAS (Aquí es donde debes trabajar) ---
// Cada función es una "página". Modifica el contenido dentro de cada una.

function HomeView() {
  return (
    // 1. Usamos el molde MainContent
    // 2. Le pasamos el TÍTULO que queremos
    <MainContent title="Bienvenido a PlantGuard">
      {/* 3. Adentro, ponemos el contenido JSX de esta vista */}
      <div className="card">
        <div className="card-body">
          <p>Esta es la página principal. Desde aquí puedes navegar a las diferentes secciones de la aplicación para cuidar de tus plantas.</p>
        </div>
      </div>
    </MainContent>
  );
}

function AnalizarView() {
  return (
    <MainContent title="Analizar Planta">
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Sube una imagen</h5>
                <div className="text-center p-5 border-2 border-dashed rounded bg-light mt-3">
                  <p className="text-muted">📷 Arrastra la foto aquí</p>
                  <p className="small text-muted">o haz clic para seleccionar</p>
                </div>
                <div className="mt-3 text-end">
                  <button className="btn btn-outline-secondary me-2">Limpiar</button>
                  <button className="btn btn-dark">Analizar</button>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Sugerencias</h5>
                <ul>
                  <li>Tomar la foto con buena luz natural.</li>
                  <li>Enfocar hojas afectadas a 20-30 cm.</li>
                  <li>Evitar fondos muy complejos.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Resultado (wireframe)</h5>
                <div className="mt-4">
                  <p className="mb-1 text-muted small">Etiqueta</p>
                  <h4>Sana ✅</h4>
                  <hr/>
                  <p className="mb-1 text-muted small">Confianza del modelo</p>
                  <p className="fw-bold">92%</p>
                  <p className="mb-1 text-muted small">Notas</p>
                  <p>No se observan manchas ni decoloraciones.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </MainContent>
  );
}

function HistorialView() {
  return (
    <MainContent title="Historial de Análisis">
      <p>Aquí irá el contenido para mostrar la lista de análisis anteriores.</p>
    </MainContent>
  );
}

function AlertasView() {
  return (
    <MainContent title="Alertas Climáticas">
      <p>Aquí irá el contenido para configurar y mostrar las alertas.</p>
    </MainContent>
  );
}

function PerfilView() {
  return (
    <MainContent title="Mi Perfil">
      <p>Aquí irá el contenido para que el usuario vea y edite su perfil.</p>
    </MainContent>
  );
}


// --- APLICACIÓN PRINCIPAL ---
function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/analizar" element={<AnalizarView />} />
            <Route path="/historial" element={<HistorialView />} />
            <Route path="/alertas" element={<AlertasView />} />
            <Route path="/perfil" element={<PerfilView />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

// --- RENDERIZADO DE LA APP ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
