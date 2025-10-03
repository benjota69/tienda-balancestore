import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { obtenerUsuarios } from "../api";
//import {getUsers} from "./api";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // usuario o email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const usuarios = await obtenerUsuarios()
    const usuarioEncontrado = usuarios.users.find((u) => u.username === identifier || u.email === identifier)

    

    if (!usuarioEncontrado) {
      setError("Usuario o correo no encontrado");
      return;
    }

    // ⚠️ Aquí deberías comparar la contraseña hasheada con bcrypt en el backend
    if (password.length < 3) {
      setError("Contraseña inválida (mínimo 3 caracteres en este demo)");
      return;
    }

    setUser(usuarioEncontrado);
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <h2>Inicio de Sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuario o correo"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", margin: "8px 0" }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", margin: "8px 0" }}
        />
        <button type="submit" style={{ padding: "10px 15px" }}>
          Ingresar
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}