import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/");
    return null;
  }

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <div style={{ margin: "50px", textAlign: "center"}}>
      <h2>Bienvenido, {user.username} a la mejor página sío!</h2>
      <p>Email: {user.email}</p>
      <p>Nombre Completo: {user.full_name}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}
