export type Team = {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  role: 'owner' | 'member';
};