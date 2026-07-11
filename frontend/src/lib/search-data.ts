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

export const allSearchableItems: SearchableItem[] = [
  {
    title: "Computer Science & Engineering",
    category: "Academics",
    path: "/wiki/departments/computer-science",
    description:
      "A leading department focused on AI, machine learning, systems, theory, and cryptography.",
  },
  {
    title: "Electrical Engineering",
    category: "Academics",
    path: "/wiki/departments/electrical-engineering",
    description:
      "Pioneering research in power systems, microelectronics, control systems, and signal processing.",
  },
  {
    title: "Amalthea Technical Summit",
    category: "Fests",
    path: "/wiki/fests/amalthea",
    description: "IITGN's annual student-run technical festival showcasing global tech innovations.",
  },
  {
    title: "Aibaan Hostel & Life",
    category: "Campus",
    path: "/wiki/hostels/aibaan-hostel",
    description:
      "Everything about hostel capacities, mascots, mess dining, and residential guidelines.",
  },
  {
    title: "The Coding Club",
    category: "Clubs",
    path: "/wiki/clubs/coding-club",
    description:
      "The premier student developers community holding hackathons, developer talks, and programming contests.",
  },
  {
    title: "CS 101: Introduction to Computing",
    category: "Academics",
    path: "/wiki/courses/cs-101",
    description: "Foundational coursework introducing Python programming, algorithms, and computational logic.",
  },
  {
    title: "Cognitive Science Research Laboratory",
    category: "Research",
    path: "/wiki/research/cognitive-science-lab",
    description:
      "Directory of advanced research instrumentation combining neuroscience, AI, and cognitive behavior studies.",
  },
  {
    title: "Sports Complex",
    category: "Campus",
    path: "/wiki/facilities/sports-complex",
    description: "Olympic size swimming pool, squash, badminton, and state-of-the-art gym amenities.",
  },
  {
    title: "Academic Grading Policies",
    category: "Policies",
    path: "/wiki/policies/grading-policy",
    description: "Details on letter grades, cumulative performance indices (CPI), and graduation criteria guidelines.",
  },
];

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Campus: Building2,
  Academics: BookOpen,
  Clubs: Users2,
  Fests: Trophy,
  Research: FlaskConical,
  Policies: Shield,
  All: Sparkles,
};
