import { Scrim } from "@/types/scrim";
import { getAuthHeaders } from "@/api/auth";

const API_URL = import.meta.env.VITE_API_URL;

export const getScrims = async (): Promise<Scrim[]> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/api/scrims`, { headers });

  if (!response.ok) {
    throw new Error("Échec de récupération des scrims");
  }

  return response.json();
};

export const createScrim = async (
  teamId: number,
  format: string,
  date: string,
  time: string,
  region: string,
  rank: number
): Promise<Scrim> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/api/scrims`, {
    method: "POST",
    headers,
    body: JSON.stringify({ teamId, format, date, time, region, rank }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la création du scrim.");
  }

  return response.json();
};
