import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Team = {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  role: 'owner' | 'member';
};