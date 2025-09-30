import { Routes, Route } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import AuthLayout from "./Layouts/AuthLayout";
import SimpleLayout from "./Layouts/SimpleLayout";
import { LocationProvider } from "./contexts/LocationContext";

// Relativo a la página
import Home from "./pages/Home";
import Analizar from "./pages/Analytics";
import Historial from "./pages/History";
import Alertas from "./pages/Alerts";
import Perfil from "./pages/Profile";
import Help from "./pages/Help";
import Faq from "./pages/Faq";

// Relativo al Login
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";


function App() {
  return (
    <LocationProvider>
      <Routes>
        {/* Rutas de AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Rutas SimpleLayout */}
        <Route element={<SimpleLayout />}>
          <Route path="/terminos" element={<Terms />} />
          <Route path="/privacidad" element={<Privacy />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/ayuda" element={<Help />} />
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
