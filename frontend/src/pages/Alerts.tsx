import MainContent from "../components/MainContent";
import { useEffect, useState } from "react";
import api from "../lib/api";

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

function Alerts() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Coordenadas de ejemplo (Santiago). Próximamente: Modificar para obtener del perfil del usuario.
        const response = await api.get("/api/weather/current?lat=-33.45&lon=-70.66");
        setWeather(response.data);
      } catch (err) {
        setError("No se pudo cargar la información del clima en este momento.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  return (
    <MainContent title="Alertas climáticas">
      <div className="row">
        {/* Columna: Clima Actual - API */}
        <div className="col-lg-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Clima Actual en tu Zona</h5>
              {loading && <p className="text-muted">Cargando clima...</p>}
              {error && <div className="alert alert-warning py-2">{error}</div>}
              {weather && (
                <div className="d-flex align-items-center">
                  <img 
                    src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`} 
                    alt={weather.condition} 
                    style={{ width: '100px', height: '100px', imageRendering: 'pixelated' }}
                  />
                  <div className="ms-3">
                    <h2 className="display-4 fw-bold">{Math.round(weather.temp)}°C</h2>
                    <p className="lead text-capitalize mb-0">{weather.condition}</p>
                  </div>
                  <div className="ms-auto text-end">
                    <p className="mb-1">Humedad: {weather.humidity}%</p>
                    <p className="mb-0">Viento: {Math.round(weather.wind_speed)} km/h</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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