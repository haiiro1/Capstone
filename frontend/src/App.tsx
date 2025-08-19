import { Routes, Route } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";

import Home from "./pages/Home";
import Analizar from "./pages/Analytics";
import Historial from "./pages/History";
import Alertas from "./pages/Alerts";
import Perfil from "./pages/Profile";

function App() {
  return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/analizar" element={<Analizar />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/perfil" element={<Perfil />} />
          
        </Route>
      </Routes>
  );
}

export default App;
