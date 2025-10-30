// Componente Encargado de Cerrar Sesión correctamente. (no mostrar Footer ni el navbar al salir)

import { useAuth } from "../context/AuthContext";
import { useNavigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="container py-3">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}


