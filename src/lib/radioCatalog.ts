import type { RadioCategory } from "../types/pomo";

export interface RadioCategoryDefinition {
  value: RadioCategory;
  label: string;
  tags: string[];
}

export const RADIO_CATEGORIES: RadioCategoryDefinition[] = [
  { value: "lofi", label: "Lo-fi", tags: ["lofi", "lo-fi", "chillout"] },
  { value: "pop", label: "Pop", tags: ["pop", "hits", "top40"] },
  { value: "anime", label: "Anime", tags: ["anime", "japan", "j-pop"] },
  { value: "kpop", label: "K-pop", tags: ["kpop", "k-pop", "korean"] },
  { value: "rock", label: "Rock", tags: ["rock", "alternative", "classic rock"] },
];

export const getRadioCategoryDefinition = (category: RadioCategory) =>
  RADIO_CATEGORIES.find((item) => item.value === category) ?? RADIO_CATEGORIES[0];
