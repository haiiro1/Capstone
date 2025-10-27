import { lazy, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import AuthLayout from "./Layouts/AuthLayout";
import SimpleLayout from "./Layouts/SimpleLayout";
import { LocationProvider } from "./contexts/LocationContext";
import { loadGoogleMaps } from "./utils/GoogleMaps";

// Relativo a la página
import Analizar from "./pages/Analytics";
import Historial from "./pages/History";
import Help from "./pages/Help";
import Faq from "./pages/Faq";

const Alertas = lazy(() => import("./pages/Alerts"));
const Home = lazy(() => import("./pages/Home"));
const Perfil = lazy(() => import("./pages/Profile"));

// Relativo al Login
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Verify from "./pages/Auth/Verify";
import ReVerify from "./pages/Auth/ReVerify";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

function App() {
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsReady(true))
      .catch((err) => console.error("Google Maps failed to load:", err));
  }, []);

  if (!mapsReady) {
    return <p>Cargando librerías de Google Maps...</p>;
  }

  return (
    <LocationProvider>
      <Routes>
        {/* Rutas de AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/resend" element={<ReVerify />} />
        </Route>

        {/* Rutas SimpleLayout */}
        <Route element={<SimpleLayout />}>
          <Route path="/Terms" element={<Terms />} />
          <Route path="/privacidad" element={<Privacy />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/Help" element={<Help />} />
        </Route>

        {/* Rutas MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/analizar" element={<Analizar />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </LocationProvider>
  );
}

export default App;
