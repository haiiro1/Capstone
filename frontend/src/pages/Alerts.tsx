import MainContent from "../components/MainContent";
import { useEffect, useState } from "react";
import GoogleMaps from "../components/GoogleMaps";
import { useLocation } from "../contexts/LocationContext";
import api from "../lib/api";

interface AddressData {
  city: string;
  country: string;
}

interface WeatherResponse {
  weather: WeatherData;
  address: AddressData;
}

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

interface ForecastItem {
  date: string;
  min_temp: number;
  max_temp: number;
  condition: string;
  description: string;
  icon: string;
}

interface AlertItem {
  date: string;
  alerts: string[];
}

function Alerts() {
  const { address, setLocation } = useLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [address_dsply, setAddress] = useState<AddressData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseISODateAsLocal = (isoDate: string) => {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const formatLocalDate = (
    isoDate: string,
    options?: Intl.DateTimeFormatOptions
  ) => {
    const date = parseISODateAsLocal(isoDate);
    return date.toLocaleDateString("es-CL", options);
  };

  useEffect(() => {
    if (!address) {
      setWeather(null);
      setForecast([]);
      setAlerts([]);
      setError("Por favor ingrese su dirección.");
      return;
    }

    let cancelled = false;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const encoded = encodeURIComponent(address);
        const [nowRes, forecastRes, eventsRes] = await Promise.all([
          api.get<WeatherResponse>(
            `/api/alerts/weather/now?address=${encoded}`
          ),
          api.get(
            `/api/alerts/weather/forecast?address=${encoded}&ts=${Date.now()}`
          ),
          api.get(`/api/alerts/weather/events?address=${encoded}`),
        ]);

        if (cancelled) return;
        setWeather(nowRes.data.weather);
        setAddress(nowRes.data.address);
        const rawForecast: ForecastItem[] = Array.isArray(forecastRes.data)
          ? forecastRes.data
          : forecastRes.data?.forecast ?? [];

        const today = new Date();
        const forecastData: ForecastItem[] = rawForecast.filter((day) => {
          const d = parseISODateAsLocal(day.date);
          return !(
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          );
        });

        setForecast(forecastData);
        setAlerts(eventsRes.data || []);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("No se pudo cargar la información del clima en este momento.");
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <MainContent title="Alertas climáticas">
      <div className="row">
        {/* Columna: Clima Actual - API */}
        <GoogleMaps
          onSelect={({ address: a, lat, lon }) =>
            setLocation({ address: a, lat, lon })
          }
        />
        {loading && <p>Cargando...</p>}
        {error && <p className="text-danger">{error}</p>}
        <div className="col-lg-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">
                Clima actual en{" "}
                {address_dsply ? `${address_dsply.city}, ${address_dsply.country}` : "tu zona"}
              </h5>
              {loading && <p className="text-muted">Cargando clima...</p>}
              {error && <div className="alert alert-warning py-2">{error}</div>}
              {weather && (
                <div className="d-flex align-items-center">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                    alt={weather.condition}
                    style={{
                      width: "100px",
                      height: "100px",
                      imageRendering: "pixelated",
                    }}
                  />
                  <div className="ms-3">
                    <h2 className="display-4 fw-bold">
                      {Math.round(weather.temp)}°C
                    </h2>
                    <p className="lead text-capitalize mb-0">
                      {weather.condition}
                    </p>
                  </div>
                  <div className="ms-auto text-end">
                    <p className="mb-1">Humedad: {weather.humidity}%</p>
                    <p className="mb-0">
                      Viento: {Math.round(weather.wind_speed)} km/h
                    </p>
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
              <h5 className="card-title">Próximas alertas</h5>
              {alerts.length === 0 ? (
                <p className="text-muted mt-3">
                  No hay alertas activas en tu zona.
                </p>
              ) : (
                <ul className="list-group list-group-flush mt-3">
                  {alerts.map((alert) => (
                    <li key={alert.date} className="list-group-item px-0">
                      <strong>
                        {formatLocalDate(alert.date, {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                        })}
                      </strong>
                      <ul className="mt-1 mb-0 ps-3">
                        {alert.alerts.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Preferencias */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Preferencias</h5>
              <div className="form-check my-3 pt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value=""
                  id="checkEmail"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="checkEmail">
                  Notificar por email
                </label>
              </div>
              <div className="form-check my-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value=""
                  id="checkWeb"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="checkWeb">
                  Notificar en la web
                </label>
              </div>
              <div className="form-check my-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value=""
                  id="checkSevere"
                />
                <label className="form-check-label" htmlFor="checkSevere">
                  Notificar solo alertas severas
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Pronóstico</h5>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                {forecast.map((day) => (
                  <div
                    key={day.date}
                    className="d-flex align-items-center border rounded p-2"
                  >
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}@4x.png`}
                      alt={day.description}
                      style={{
                        width: "100px",
                        height: "100px",
                        imageRendering: "pixelated",
                      }}
                    />
                    <div className="ms-2">
                      <h6 className="mb-1">
                        {formatLocalDate(day.date, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </h6>
                      <p className="mb-0">
                        {day.min_temp}°C / {day.max_temp}°C
                      </p>
                      <small className="text-muted text-capitalize">
                        {day.description}
                      </small>
                    </div>
                  </div>
                ))}
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
