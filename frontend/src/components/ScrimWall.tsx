import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useEffect, useState } from "react";

type Scrim = {
  id: number;
  date: string; // "2025-05-23"
  time: string; // "21:00"
  team: string;
  format: string;
  region: string;
  rank: number;
};

// Pour formater le nom du jour en français
const joursFr = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];
const moisFr = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function formatDateTitle(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";

  return `${joursFr[d.getDay()]}, ${d.getDate()} ${moisFr[d.getMonth()]}`;
}

export default function ScrimWall() {
  const [scrims, setScrims] = useState<Scrim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScrims() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/scrims", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ou autre méthode d'auth
          },
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        // Suppose que data est un tableau compatible avec Scrim[]
        setScrims(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch scrims");
      } finally {
        setLoading(false);
      }
    }

    fetchScrims();
  }, [scrims]);
  const formatColor = (format: string) => "bg-green-200 text-green-800";
  const regionColor = (region: string) => "bg-blue-200 text-blue-800";
  const rankColor = () => "bg-purple-200 text-purple-800";

  // Date du jour à 00:00:00 pour filtre
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  // Filtrer les scrims à partir d'aujourd'hui (exclure scrims antérieurs)
  const filteredScrims = scrims.filter((scrim) => {
    const scrimDate = new Date(scrim.date);
    scrimDate.setHours(0, 0, 0, 0);
    return scrimDate >= todayDate;
  });

  // Grouper par date
  const groupedScrims = filteredScrims.reduce(
    (acc, scrim) => {
      if (!acc[scrim.date]) {
        acc[scrim.date] = [];
      }
      acc[scrim.date].push(scrim);
      return acc;
    },
    {} as Record<string, Scrim[]>
  );

  // Trier les clés (dates) asc
  const sortedDates = Object.keys(groupedScrims).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-md">
      <div className="space-y-2">
        {sortedDates.map((date) => (
          <div key={date}>
            <h3 className=" flex justify-center py-4 font-semibold text-gray-700">
              {formatDateTitle(date)}
            </h3>

            <div className="space-y-4">
              {groupedScrims[date]
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((scrim) => (
                  <div
                    key={scrim.id}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-800 w-14">
                        {scrim.time}
                      </span>
                      <span className="font-medium text-gray-600">
                        {scrim.team}
                      </span>
                      <Chip className={formatColor(scrim.format)}>
                        {scrim.format}
                      </Chip>
                      <Chip className={regionColor(scrim.region)}>
                        {scrim.region}
                      </Chip>
                      <Chip className={rankColor()}>{scrim.rank}</Chip>
                    </div>
                    <Button className="rounded-xl bg-gray-800 px-4 py-1.5 text-white hover:bg-gray-700 transition">
                      Book
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
