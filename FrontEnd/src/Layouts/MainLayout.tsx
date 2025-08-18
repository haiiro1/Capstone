import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      {/* AJUSTE: Quitamos las clases 'container py-4' de aquí */}
      {/* Ahora este <main> solo se ocupa de crecer para empujar el footer hacia abajo */}
      <main className="flex-grow-1">
        <Outlet /> 
        {/* aquí se inyectan las vistas, y cada vista traerá su propio <MainContent> con su contenedor */}
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;