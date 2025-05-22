import { Team } from "@/types/team";
import { getAuthHeaders } from "@/api/auth";

const API_URL = import.meta.env.VITE_API_URL;

export const getMyTeams = async (): Promise<Team[]> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/api/teams`, { headers });

  if (!response.ok) {
    throw new Error("Échec de récupération des équipes utilisateur");
  }

  return response.json();
};

export const createTeam = async (name: string): Promise<Team> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/api/teams`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la création de l'équipe.");
  }

  return response.json();
};
