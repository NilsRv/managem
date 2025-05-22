import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { CalendarDays, Clock, Swords, Globe, Castle } from "lucide-react";
import { createScrim } from "@/api/scrim";

export default function PostScrimCard() {
  const [teamName, setTeamName] = useState("");
  const [pseudo, setPseudo] = useState("");

  const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
  const now = new Date().toTimeString().slice(0, 5); // format HH:mm

  const [date, setDate] = useState(today);
  const [time, setTime] = useState(now);
  const [format, setFormat] = useState("BO5");
  const [region, setRegion] = useState("EUW");
  const [rank, setRank] = useState("2000");

  const handlePost = async () => {
    try {
      const teamId = 1; // à remplacer avec le vrai teamId

      await createScrim(teamId, format, date, time, region, parseInt(rank, 10));
      alert("Scrim posté !");
    } catch (error: any) {
      alert(error.message || "Erreur lors du post du scrim");
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-4 bg-white rounded-2xl shadow-md">
      <CardBody className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="flex-1 bg-gray-100"
          />
          <Input
            placeholder="Pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            className="flex-1 bg-gray-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput
            icon={<CalendarDays className="text-rose-500 w-5 h-5" />}
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <LabeledInput
            icon={<Clock className="text-yellow-500 w-5 h-5" />}
            label="Heure"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <LabeledInput
            icon={<Swords className="text-green-500 w-5 h-5" />}
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          />
          <LabeledInput
            icon={<Globe className="text-blue-600 w-5 h-5" />}
            label="Région"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
          <LabeledInput
            icon={<Castle className="text-purple-600 w-5 h-5" />}
            label="Rank"
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handlePost}
            className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-xl"
          >
            Post
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function LabeledInput({
  icon,
  label,
  type = "text",
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl">
      {icon}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <Input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
