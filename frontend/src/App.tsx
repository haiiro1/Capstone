import { Routes, Route } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import AuthLayout from "./Layouts/AuthLayout";

// Relativo a la página
import Home from "./pages/Home";
import Analizar from "./pages/Analytics";
import Historial from "./pages/History";
import Alertas from "./pages/Alerts";
import Perfil from "./pages/Profile";

// Relativo al Login
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";


function App() {
  return (
      <Routes>
        {/* Rutas de AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
  );
}

export default App;
