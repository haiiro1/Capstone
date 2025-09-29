import MainContent from "../components/MainContent";

// Para los íconos, puedes usar SVGs o una librería como react-icons.
// Por ahora, usaré emojis como marcadores de posición.
function Home() {
  return (
    // Usamos el componente MainContent y le pasamos el título "Dashboard"
    <MainContent title="Dashboard">
      {/* Fila 1: Las 4 tarjetas de resumen */}
      <div className="row mb-4">
        {/* Tarjeta 1: Plantas analizadas */}
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted small">Plantas analizadas</h5>
              <p className="card-text fs-2 fw-bold">🍃 128</p>
            </div>
          </div>
        </div>
        {/* Tarjeta 2: Riesgos detectados */}
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted small">Riesgos detectados</h5>
              <p className="card-text fs-2 fw-bold">⚠️ 12</p>
            </div>
          </div>
        </div>
        {/* Tarjeta 3: Alertas climáticas */}
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted small">Alertas climáticas activas</h5>
              <p className="card-text fs-2 fw-bold">🌦️ 3</p>
            </div>
          </div>
        </div>
        {/* Tarjeta 4: Último análisis */}
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-muted small">Último análisis</h5>
              <p className="card-text fs-2 fw-bold">🕙 hoy, 10:14</p>
            </div>
          </div>
        </div>
      </div>
      {/* Fila 2: Las 3 tarjetas de acciones y resúmenes */}
      <div className="row">
        {/* Tarjeta 1: Subir imagen */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Subir imagen rápida</h5>
              <div className="text-center p-4 border-2 border-dashed rounded bg-light mt-3 flex-grow-1 d-flex align-items-center justify-content-center">
                <div>
                  <p className="text-muted mb-0">📤 Arrastra una imagen aquí</p>
                  <p className="small text-muted mb-0">o haz clic para seleccionar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tarjeta 2: Resumen de salud */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Resumen de salud</h5>
              <ul className="list-unstyled mt-3">
                <li className="mb-2">✔️ 84% sanas</li>
                <li className="mb-2">🔶 11% con sospecha de plaga</li>
                <li className="mb-2">❔ 5% sin certeza (repetir foto)</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Tarjeta 3: Alertas del clima */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Alertas del clima</h5>
              <ul className="list-unstyled mt-3">
                <li className="mb-2">☔ Lluvias intensas en 24h</li>
                <li className="mb-2">❄️ Riesgo de heladas en 72h</li>
                <li className="mb-2">☀️ Ola de calor leve (5 días)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}

export default Home;