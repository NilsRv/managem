import { Team } from "@/types/team";
import { getAuthHeaders } from "@/api/auth";
import axios from "axios";
import { User } from "@/types/user";

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

export const updateTeamName = async (teamId: string, name: string) => {
  const headers = await getAuthHeaders();
  const teamID = Number(teamId);
  const response = await fetch(`${API_URL}/api/teams/${teamID}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la mise à jour du nom de l'équipe.");
  }

  return response.json();
};

export const getTeamMembers = async (teamId: string): Promise<User[]> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/api/teams/${teamId}/members`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la récupération des membres.");
  }

  return response.json(); 
};