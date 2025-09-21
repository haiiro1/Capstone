import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1">
        <Outlet /> 
        {/* aquí se inyectan las vistas */}
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;