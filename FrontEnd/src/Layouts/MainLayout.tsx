import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 container py-4">
        <Outlet />
         {/* aquí se inyectan las vistas */}
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
