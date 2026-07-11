import {
  Building2,
  BookOpen,
  Users2,
  Trophy,
  FlaskConical,
  Shield,
  Sparkles,
  LucideIcon
} from "lucide-react";

export interface SearchableItem {
  title: string;
  category: string;
  path: string;
  description: string;
}

export const allSearchableItems: SearchableItem[] = [];

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Campus: Building2,
  Academics: BookOpen,
  Clubs: Users2,
  Fests: Trophy,
  Research: FlaskConical,
  Policies: Shield,
  All: Sparkles,
};
