import { getMyTeams } from "@/api/team";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Team } from "@/types/team";

import React, { useEffect, useState } from "react";

export default function MyTeamsList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyTeams()
      .then(setTeams)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mes équipes</h2>
      {teams.length === 0 ? (
        <p className="text-gray-500">Aucune équipe trouvée.</p>
      ) : (
        <ul className="space-y-2">
          {teams.map((team) => (
            <li
              key={team.id}
              className="p-4 rounded-md border shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{team.name}</h3>
                  <p className="text-sm text-gray-500">
                    Rôle : {team.role === "owner" ? "Propriétaire" : "Membre"}
                  </p>
                </div>
                <a
                  href={`/teams/${team.slug}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Voir
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
