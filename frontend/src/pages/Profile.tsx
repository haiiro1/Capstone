import { useEffect, useMemo, useState } from "react";
import MainContent from "../components/MainContent";
import api from "../lib/api";

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  // campos opcionales que puede devolver el backend
  company?: string | null;
  location?: string | null;
  crops?: string[] | null;
  avatar_url?: string | null; // p.ej. "/media/xxx.jpg"
};

type ProfileExtras = {
  company?: string;
  location?: string;
  crops?: string[]; // top 5
};

const LS_USER = "pg_user";
const LS_PROFILE = "pg_profile";

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [extras, setExtras] = useState<ProfileExtras>({});

  // soporte avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const API_ORIGIN = useMemo(() => {
  try { return new URL(import.meta.env.VITE_API_URL || "http://localhost:8000/api").origin; }
  catch { return "http://localhost:8000"; }
}, []);

  const fullAvatar = useMemo(() => {
  if (!user?.avatar_url) return null;
  if (user.avatar_url.startsWith("http")) return user.avatar_url;
  // si (por algún motivo) llega relativa, se hace absoluta con el ORIGEN, NO con /api
  return `${API_ORIGIN}${user.avatar_url}`;
}, [user, API_ORIGIN]);

  // cargar user de localStorage, con fallback a /me
  useEffect(() => {
    const cached = localStorage.getItem(LS_USER);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as User;
        setUser(parsed);
        const ex = localStorage.getItem(LS_PROFILE);
        if (!ex) {
          setExtras({
            company: parsed.company ?? undefined,
            location: parsed.location ?? undefined,
            crops: parsed.crops ?? [],
          });
        }
      } catch {}
    }

    api
      .get("/api/auth/me")
      .then((r) => {
        setUser(r.data);
        localStorage.setItem(LS_USER, JSON.stringify(r.data));
        // actualiza extras desde backend si existen y no hay LS_PROFILE
        const ex = localStorage.getItem(LS_PROFILE);
        if (!ex) {
          setExtras({
            company: r.data.company ?? undefined,
            location: r.data.location ?? undefined,
            crops: r.data.crops ?? [],
          });
        }
      })
      .catch(() => {});

    // si hay perfil en LS
    const ex = localStorage.getItem(LS_PROFILE);
    if (ex) {
      try {
        setExtras(JSON.parse(ex));
      } catch {}
    }
  }, []);

  const initials = useMemo(() => {
    const fn = user?.first_name?.[0] ?? "";
    const ln = user?.last_name?.[0] ?? "";
    return (fn + ln || "PG").toUpperCase();
  }, [user]);

  const [company, setCompany] = useState(extras.company || "");
  const [location, setLocation] = useState(extras.location || "");
  const [cropsText, setCropsText] = useState((extras.crops || []).join(", "));

  useEffect(() => {
    setCompany(extras.company || "");
    setLocation(extras.location || "");
    setCropsText((extras.crops || []).join(", "));
  }, [extras]);

  const saveExtras = async () => {
    const crops = cropsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);

    const next: ProfileExtras = {
      company: company || undefined,
      location: location || undefined,
      crops,
    };
    setExtras(next);
    localStorage.setItem(LS_PROFILE, JSON.stringify(next));

    try {
      const { data } = await api.patch<User>("/api/users/me", {
        company: next.company ?? null,
        location: next.location ?? null,
        crops: next.crops ?? [],
      });
      setUser(data);
      localStorage.setItem(LS_USER, JSON.stringify(data));
    } catch {
    }
  };

  // subir avatar
  const handleAvatarChange = async (file?: File) => {
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setAvatarPreview(blobUrl);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post<User>("/api/users/me/avatar", r.data);
      setUser(data);
      localStorage.setItem(LS_USER, JSON.stringify(data));
      setAvatarPreview(null);
    } catch {
    } finally {
      setUploading(false);
      URL.revokeObjectURL(blobUrl);
  }
};

  return (
    <MainContent title="Perfil">
      <div className="row">
        {/* Columna Izquierda: Información del perfil */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Información del Usuario</h5>

              {/* Avatar + Datos */}
              <div className="d-flex align-items-center mb-4">
                <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center me-4 position-relative"
                  style={{ width: 80, height: 80, overflow: "hidden" }}
                >
                  {/* muestra imagen si existe o preview; si no, iniciales */}
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : fullAvatar ? (
                    <img
                      src={fullAvatar}
                      alt="avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span className="fs-3 fw-bold text-secondary">{initials}</span>
                  )}

                  {/* input de archivo discreto */}
                  <label
                    className="btn btn-sm btn-outline-secondary position-absolute bottom-0 start-50 translate-middle-x"
                    style={{ lineHeight: 1 }}
                  >
                    {uploading ? "Subiendo..." : "Cambiar"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading}
                      onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                    />
                  </label>
                </div>

                <div>
                  <div className="mb-2">
                    <small className="text-muted d-block">NOMBRE</small>
                    <span className="fw-bold">
                      {user ? `${user.first_name} ${user.last_name}` : "—"}
                    </span>
                  </div>
                  <div>
                    <small className="text-muted d-block">EMAIL</small>
                    <span>{user?.email ?? "—"}</span>
                  </div>
                </div>
              </div>

              <hr />

              {/* Form extras (local + backend) */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Empresa</label>
                  <input
                    className="form-control"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Ubicación</label>
                  <input
                    className="form-control"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">
                    Cultivos principales (máx 5, separados por coma)
                  </label>
                  <input
                    className="form-control"
                    placeholder="Tomate, Lechuga, Papa"
                    value={cropsText}
                    onChange={(e) => setCropsText(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-success" onClick={saveExtras}>
                    Guardar
                  </button>
                </div>
              </div>

              {/* Badges de cultivos */}
              {!!extras.crops?.length && (
                <>
                  <hr />
                  <h6 className="text-muted small">🌱 CULTIVOS PRINCIPALES</h6>
                  <div className="mt-3">
                    {extras.crops.map((c) => (
                      <span key={c} className="badge bg-secondary me-2 mb-2 p-2">
                        {c}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Clima de hoy (placeholder) */}
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

export default Profile;