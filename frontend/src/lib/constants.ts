import {
  Home,
  Map,
  BookOpen,
  Users,
  Award,
  Crown,
  Shield,
  Gem,
  Sparkles,
  Zap
} from "lucide-react";

// --- Original Constants Required by wiki-client.tsx ---

export interface Tier {
  name: string;
  icon: string;
  gradient: string;
  avatarGradient: string;
  roleTitle: string;
  benefits: string[];
}

export const TIERS: Record<string, Tier> = {
  bronze: {
    name: "Bronze",
    icon: "🥉",
    gradient: "from-amber-800 via-amber-600 to-amber-700 text-white",
    avatarGradient: "from-amber-950 via-amber-800 to-amber-700",
    roleTitle: "Bronze Contributor",
    benefits: ["Can only read articles", "Post comments on discussion pages"]
  },
  silver: {
    name: "Silver",
    icon: "🥈",
    gradient: "from-zinc-400 via-slate-200 to-zinc-500 text-zinc-900",
    avatarGradient: "from-zinc-600 via-slate-400 to-zinc-500",
    roleTitle: "Silver Editor",
    benefits: ["Edit unprotected articles", "Upload images to pages"]
  },
  gold: {
    name: "Gold",
    icon: "🥇",
    gradient: "from-yellow-500 via-amber-400 to-yellow-600 text-amber-950",
    avatarGradient: "from-yellow-600 via-amber-500 to-yellow-400",
    roleTitle: "Gold Editor",
    benefits: ["Edit semi-protected pages", "Approve pending drafts"]
  },
  platinum: {
    name: "Platinum",
    icon: "🛡️",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500 text-white",
    avatarGradient: "from-cyan-600 via-blue-500 to-cyan-400",
    roleTitle: "Platinum Mod",
    benefits: ["Lock pages & delete files", "Revert vandalism edits"]
  },
  diamond: {
    name: "Diamond",
    icon: "💎",
    gradient: "from-cyan-400 via-teal-300 to-indigo-500 text-slate-800",
    avatarGradient: "from-cyan-500 via-teal-400 to-indigo-500",
    roleTitle: "Diamond Admin",
    benefits: ["Ban problem users", "Change wiki's visual theme"]
  },
  stardust: {
    name: "Stardust",
    icon: "✨",
    gradient: "from-fuchsia-600 via-purple-600 to-pink-500 text-white",
    avatarGradient: "from-fuchsia-700 via-purple-600 to-pink-500",
    roleTitle: "Stardust Archon",
    benefits: ["Ultimate active control of extensions", "Promote / demote site administrators"]
  },
  singularity: {
    name: "Singularity",
    icon: "🌀",
    gradient: "from-gray-950 via-slate-900 to-violet-950 text-amber-300 border border-amber-400/30",
    avatarGradient: "from-black via-slate-950 to-violet-950",
    roleTitle: "Singularity Admin",
    benefits: ["Root administrative override control", "Absolute permissions over wiki configurations"]
  }
};

export const TIER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bronze: Award,
  silver: Award,
  gold: Crown,
  platinum: Shield,
  diamond: Gem,
  stardust: Sparkles,
  singularity: Zap,
};

export const menuItems = [
  { title: "Home", icon: Home, link: "/" },
  { title: "Campus Map", icon: Map, link: "#" },
  { title: "Academics", icon: BookOpen, link: "#" },
  { title: "Student Life", icon: Users, link: "#" },
];

// --- New Navigation and Portal Constants for Redesigned Homepage ---

export interface SidebarItem {
  name: string;
  path: string;
  iconName: string; // Lucide icon name to be dynamically rendered
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface QuickPortalItem {
  name: string;
  path: string;
  iconName: string;
  colorTheme: {
    bg: string;       // Background color for icon container
    icon: string;     // Color for icon
    textBg: string;   // Optional hover backgrounds
  };
}

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "NAVIGATION",
    items: [
      { name: "Main Page", path: "/", iconName: "Home" },
      { name: "Random Article", path: "/wiki/random", iconName: "Shuffle" },
    ],
  },
  {
    title: "BROWSE WIKI",
    items: [
      { name: "Departments", path: "/wiki/departments", iconName: "Building2" },
      { name: "Faculty Profiles", path: "/wiki/faculty", iconName: "Users2" },
      { name: "Courses Info", path: "/wiki/courses", iconName: "BookOpen" },
      { name: "Research & Labs", path: "/wiki/research", iconName: "FlaskConical" },
    ],
  },
  {
    title: "RESIDENTIAL & LIFE",
    items: [
      { name: "Hostels Guide", path: "/wiki/hostels", iconName: "Tent" },
      { name: "Campus Facilities", path: "/wiki/facilities", iconName: "MapPin" },
      { name: "Student Clubs", path: "/wiki/clubs", iconName: "Trophy" },
      { name: "Student Life (Fests)", path: "/wiki/fests", iconName: "Sparkles" },
    ],
  },
  {
    title: "INSTITUTE DETAILS",
    items: [
      { name: "Academic Calendar", path: "/wiki/calendar", iconName: "Calendar" },
      { name: "Institute Policies", path: "/wiki/policies", iconName: "Shield" },
      { name: "Placement Stats", path: "/wiki/placements", iconName: "TrendingUp" },
    ],
  },
];

export const QUICK_PORTALS: QuickPortalItem[] = [
  {
    name: "Departments",
    path: "/wiki/departments",
    iconName: "Building2",
    colorTheme: {
      bg: "bg-rose-50 text-rose-500",
      icon: "text-rose-500",
      textBg: "hover:bg-rose-50/50",
    },
  },
  {
    name: "Faculty",
    path: "/wiki/faculty",
    iconName: "Users2",
    colorTheme: {
      bg: "bg-amber-50 text-amber-600",
      icon: "text-amber-600",
      textBg: "hover:bg-amber-50/50",
    },
  },
  {
    name: "Courses",
    path: "/wiki/courses",
    iconName: "BookOpen",
    colorTheme: {
      bg: "bg-emerald-50 text-emerald-600",
      icon: "text-emerald-600",
      textBg: "hover:bg-emerald-50/50",
    },
  },
  {
    name: "Clubs",
    path: "/wiki/clubs",
    iconName: "Trophy",
    colorTheme: {
      bg: "bg-indigo-50 text-indigo-600",
      icon: "text-indigo-600",
      textBg: "hover:bg-indigo-50/50",
    },
  },
  {
    name: "Hostels",
    path: "/wiki/hostels",
    iconName: "Tent",
    colorTheme: {
      bg: "bg-sky-50 text-sky-500",
      icon: "text-sky-500",
      textBg: "hover:bg-sky-50/50",
    },
  },
  {
    name: "Campus Facilities",
    path: "/wiki/facilities",
    iconName: "MapPin",
    colorTheme: {
      bg: "bg-purple-50 text-purple-600",
      icon: "text-purple-600",
      textBg: "hover:bg-purple-50/50",
    },
  },
  {
    name: "Research Labs",
    path: "/wiki/research",
    iconName: "FlaskConical",
    colorTheme: {
      bg: "bg-teal-50 text-teal-600",
      icon: "text-teal-600",
      textBg: "hover:bg-teal-50/50",
    },
  },
  {
    name: "Student Life",
    path: "/wiki/fests",
    iconName: "Sparkles",
    colorTheme: {
      bg: "bg-fuchsia-50 text-fuchsia-600",
      icon: "text-fuchsia-600",
      textBg: "hover:bg-fuchsia-50/50",
    },
  },
];

export const PROFILE_MENU_ITEMS = [
  { name: "My Profile", path: "/wiki/profile" },
  { name: "My Contributions", path: "/wiki/contributions" },
  { name: "Settings", path: "/wiki/settings" },
  { name: "Sign Out", path: "/wiki/signout", isDanger: true },
];
