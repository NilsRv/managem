import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login`,
        {
          email,
          password,
        }
      );

      login(res.data.token);
      navigate("/");
    } catch (err) {
      console.error("Erreur de login :", err);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow"
    >
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>
      <input
        type="email"
        placeholder="Email"
        className="input input-bordered w-full mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        className="input input-bordered w-full mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="btn btn-primary w-full">
        Se connecter
      </button>
    </form>
  );
};

export default Login;
