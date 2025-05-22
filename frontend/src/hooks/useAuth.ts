import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode"


interface DecodedToken {
  username: string;
  // ajoute d'autres champs si ton token les contient
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  
  const getUserEmail = (): string | null => {
    if (!context.token) return null;
    try {
      const decoded: DecodedToken = jwtDecode(context.token);
      return decoded.username;
    } catch (err) {
      return null;
    }
  };
  return { ...context, getUserEmail };

  
};
