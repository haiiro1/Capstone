import MainContent from "../components/MainContent";

function Profile() {
  return (
    <MainContent title="Perfil">
      <div className="row">
        {/* Columna Izquierda: Información del perfil */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Información del Usuario</h5>

              {/* Sección superior con Avatar y Datos */}
              <div className="d-flex align-items-center mb-4">
                {/* Avatar */}
                <div 
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center me-4" 
                  style={{ width: '80px', height: '80px' }}
                >
                  <span className="fs-3 fw-bold text-secondary">PG</span>
                </div>

                {/* Datos del usuario */}
                <div>
                  <div className="mb-3">
                    <small className="text-muted d-block">NOMBRE</small>
                    <span className="fw-bold">Ignacia Ciero</span>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">EMPRESA</small>
                    <span>🏢 PlantGuard Labs</span>
                  </div>
                  <div>
                    <small className="text-muted d-block">UBICACIÓN</small>
                    <span>📍 Santiago, CL</span>
                  </div>
                </div>
              </div>

              <hr />

              {/* Sección Cultivos Principales */}
              <div>
                <h6 className="text-muted small">🌱 CULTIVOS PRINCIPALES (TOP 5)</h6>
                <div className="mt-3">
                  <span className="badge bg-secondary me-2 mb-2 p-2">Tomate</span>
                  <span className="badge bg-secondary me-2 mb-2 p-2">Lechuga</span>
                  <span className="badge bg-secondary me-2 mb-2 p-2">Papa</span>
                  <span className="badge bg-secondary me-2 mb-2 p-2">Arándano</span>
                  <span className="badge bg-secondary me-2 mb-2 p-2">Maíz</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Clima de hoy */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Clima de hoy</h5>
              <div className="text-center my-4">
                <div className="display-4">🌦️</div>
                <div className="fs-1 fw-bold">22°C</div>
                <div className="text-muted">Parcialmente nublado</div>
              </div>
              <div className="d-flex justify-content-around text-center mb-4">
                <div>
                  <small className="text-muted">Mín</small>
                  <div>12°</div>
                </div>
                <div>
                  <small className="text-muted">Máx</small>
                  <div>25°</div>
                </div>
                <div>
                  <small className="text-muted">Humedad</small>
                  <div>58%</div>
                </div>
              </div>
              <div className="d-grid">
                <button className="btn btn-success">Configurar alertas</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}

const Perfil = Profile;
export default Perfil;
