// components/ScrimWall.tsx
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useEffect, useState } from "react";

type Scrim = {
  time: string;
  team: string;
  format: string;
  region: string;
  rank: number;
};

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
  }, []);

  const formatColor = (format: string) => "bg-green-200 text-green-800";
  const regionColor = (region: string) => "bg-blue-200 text-blue-800";
  const rankColor = () => "bg-purple-200 text-purple-800";

  return (
    <div className="mt-6 rounded-2xl bg-gray-100 p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Scrim Wall</h2>
      <div className="space-y-4">
        {scrims
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((scrim, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-800 w-14">
                  {scrim.time}
                </span>
                <span className="font-medium text-gray-600">{scrim.team}</span>
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
  );
}
