import axios from "axios";

export const register = async (email: string, password: string) => {
  return axios.post(`${import.meta.env.VITE_API_URL}/api/register`, {
    email,
    password,
  });

};

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token non disponible");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};