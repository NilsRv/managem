import { create } from "zustand";
import { Team } from "@/types/team";
import { getMyTeams } from "@/api/team";

interface TeamStore {
  teams: Team[];
  selectedTeam: string | null; // id de l'équipe sélectionnée
  fetchTeams: () => Promise<void>;
  selectTeam: (teamId: string) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  selectedTeam: null,

  fetchTeams: async () => {
    const fetchedTeams = await getMyTeams();
    const storedId = localStorage.getItem("selectedTeam");
    let selectedId = fetchedTeams[0]?.id.toString() ?? null;

    if (storedId) {
      const found = fetchedTeams.find((t: Team) => t.id.toString() === storedId);
      if (found) selectedId = found.id.toString();
    }

    set({ teams: fetchedTeams, selectedTeam: selectedId });

    if (selectedId) {
      localStorage.setItem("selectedTeam", selectedId);
    }
  },

  selectTeam: (teamId) => {
    set({ selectedTeam: teamId });
    localStorage.setItem("selectedTeam", teamId);
  },
}));
