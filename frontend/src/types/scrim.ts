export type Scrim = {
  id: number;
  teamId: number;
  format: string;       // ex: "BO5"
  date: string;         // format: YYYY-MM-DD
  time: string;         // format: HH:mm
  region: string;       // ex: "EUW"
  rank: number;         // ex: 2000
  createdAt: string;
};

export type TagType = "date" | "time" | "format" | "region" | "rank";