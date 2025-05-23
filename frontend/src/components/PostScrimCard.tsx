import { useEffect, useState } from "react";
import { addHours, format, isToday, isTomorrow, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";

import { CalendarDays, Clock, Swords, Globe, Castle } from "lucide-react";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Select, SelectItem } from "@heroui/select";
import { getMyTeams } from "@/api/team";
import { Team } from "@/types/team";
import { useTeamStore } from "@/store/teamStore";
import { createScrim } from "@/api/scrim";

export default function PostScrimCard() {
  const [teamName, setTeamName] = useState("");
  const { teams, selectedTeam, fetchTeams, selectTeam } = useTeamStore();
  const [loading, setLoading] = useState(true);
  const [pseudo, setPseudo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  });

  // Edition inline états
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [isEditingFormat, setIsEditingFormat] = useState(false);
  const [isEditingRegion, setIsEditingRegion] = useState(false);
  const [isEditingRank, setIsEditingRank] = useState(false);

  // Valeurs éditables
  const [formatText, setFormatText] = useState("Best of 7");
  const [regionText, setRegionText] = useState("EUW");
  const [rankNumber, setRankNumber] = useState<number>(2000);

  const formatDateLabel = (date?: Date) => {
    if (!date) return "Pick a date";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "d MMMM", { locale: fr });
  };

  const handlePostScrim = async () => {
    if (!selectedTeam) {
      alert("Veuillez sélectionner une équipe.");
      return;
    }
    if (!selectedDate) {
      alert("Veuillez sélectionner une date.");
      return;
    }
    try {
      setLoading(true);

      // Formatage de la date en ISO YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split("T")[0];

      console.log({
        teamId: Number(selectedTeam),
        format: formatText,
        date: formattedDate,
        time: selectedTime,
        region: regionText,
        rank: rankNumber,
      });
      // Appel à l'API
      const scrim = await createScrim(
        Number(selectedTeam),
        formatText,
        formattedDate,
        selectedTime,
        regionText,
        rankNumber
      );

      alert("Scrim posté avec succès !");
      // Tu peux reset les champs ou faire autre chose ici
    } catch (error: any) {
      alert(`Erreur lors de la création du scrim : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helpers pour gérer Enter + blur sur inputs
  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    setEditing: (b: boolean) => void
  ) => {
    if (e.key === "Enter") {
      setEditing(false);
      e.currentTarget.blur();
    }
  };

  return (
    <Card className="p-4 bg-white rounded-2xl shadow-md">
      <CardBody className="space-y-4">
        <div className="flex flex-row gap-4 items-center">
          <div className="flex-grow">
            <Select
              className="w-full"
              size="sm"
              label="Sélectionner une équipe"
              selectedKeys={selectedTeam ? [selectedTeam] : []}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];
                if (typeof key === "string") selectTeam(key);
              }}
              listboxProps={{
                itemClasses: {
                  base: [
                    "rounded-md",
                    "text-default-500",
                    "transition-opacity",
                    "data-[hover=true]:text-foreground",
                    "data-[hover=true]:bg-default-100",
                    "dark:data-[hover=true]:bg-default-50",
                    "data-[selectable=true]:focus:bg-default-50",
                    "data-[pressed=true]:opacity-70",
                    "data-[focus-visible=true]:ring-default-500",
                  ],
                },
              }}
              popoverProps={{
                classNames: {
                  base: "before:bg-default-200",
                },
              }}
            >
              {teams.map((team) => (
                <SelectItem key={team.id.toString()}>{team.name}</SelectItem>
              ))}
            </Select>
          </div>
          <Button
            className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-xl"
            onPress={() => handlePostScrim()}
          >
            Post
          </Button>
        </div>

        <div className="flex justify-center flex-wrap gap-3">
          {/* Date picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                <CalendarDays className="text-rose-500 w-5 h-5" />
                {formatDateLabel(selectedDate)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-xl">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) {
                    setSelectedDate(undefined);
                    return;
                  }
                  const correctedDate = addHours(startOfDay(date), 12);
                  setSelectedDate(correctedDate);
                }}
                locale={fr}
              />
            </PopoverContent>
          </Popover>

          {/* Time inline edit */}
          {isEditingTime ? (
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              onBlur={() => setIsEditingTime(false)}
              onKeyDown={(e) => handleInputKeyDown(e, setIsEditingTime)}
              autoFocus
              className="text-black bg-gray-100 rounded-full px-3 py-1.5 text-sm font-medium w-[90px]"
            />
          ) : (
            <button
              onClick={() => setIsEditingTime(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Clock className="text-yellow-500 w-5 h-5" />
              {selectedTime}
            </button>
          )}

          {/* Format inline edit (string) */}
          {isEditingFormat ? (
            <input
              type="text"
              value={formatText}
              onChange={(e) => setFormatText(e.target.value)}
              onBlur={() => setIsEditingFormat(false)}
              onKeyDown={(e) => handleInputKeyDown(e, setIsEditingFormat)}
              autoFocus
              className="text-black bg-gray-100 rounded-full px-3 py-1.5 text-sm font-medium w-auto max-w-[130px]"
            />
          ) : (
            <button
              onClick={() => setIsEditingFormat(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Swords className="text-green-500 w-5 h-5" />
              {formatText}
            </button>
          )}

          {/* Region inline edit (string) */}
          {isEditingRegion ? (
            <input
              type="text"
              value={regionText}
              onChange={(e) => setRegionText(e.target.value)}
              onBlur={() => setIsEditingRegion(false)}
              onKeyDown={(e) => handleInputKeyDown(e, setIsEditingRegion)}
              autoFocus
              className="text-black bg-gray-100 rounded-full px-3 py-1.5 text-sm font-medium w-auto max-w-[80px]"
            />
          ) : (
            <button
              onClick={() => setIsEditingRegion(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Globe className="text-blue-600 w-5 h-5" />
              {regionText}
            </button>
          )}

          {/* Rank inline edit (number) */}
          {isEditingRank ? (
            <input
              type="number"
              value={rankNumber}
              onChange={(e) => setRankNumber(Number(e.target.value))}
              onBlur={() => setIsEditingRank(false)}
              onKeyDown={(e) => handleInputKeyDown(e, setIsEditingRank)}
              autoFocus
              className="text-black bg-gray-100 rounded-full px-3 py-1.5 text-sm font-medium w-[70px]"
              min={0}
              max={9999}
            />
          ) : (
            <button
              onClick={() => setIsEditingRank(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Castle className="text-purple-600 w-5 h-5" />
              {rankNumber}
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
