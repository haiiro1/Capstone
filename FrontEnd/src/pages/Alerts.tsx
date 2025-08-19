import MainContent from "../components/MainContent";

function Alerts() {
  return (
    <MainContent title="Alertas climáticas">
      <div className="row">
        {/* Columna Izquierda: Próximas alertas */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Próximas alertas (wireframe)</h5>
              <ul className="list-group list-group-flush mt-3">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <span>☔️</span> Lluvias intensas (mañana)
                  </div>
                  <span className="text-muted">Severidad: Media</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <span>❄️</span> Heladas (72h)
                  </div>
                  <span className="text-muted">Severidad: Alta</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
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
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Preferencias</h5>
              <div className="form-check my-3 pt-2">
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
    </MainContent>
  );
}

const Alertas = Alerts;
export default Alertas;