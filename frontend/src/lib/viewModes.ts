import { ViewMode } from "@/hooks/useViewMode";

// Container grid classes per view. `default`/`details` are multi-column lists;
// `tiles` is a denser card grid; the icon views shrink column count as size grows.
export const getGridClass = (view: ViewMode): string => {
  switch (view) {
    case "tiles":
      return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
    case "icon-sm":
      return "grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3";
    case "icon-md":
      return "grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-4";
    case "icon-lg":
      return "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-5";
    case "icon-xl":
      return "grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-6";
    case "default":
    case "details":
    default:
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3";
  }
};

// Icon box size (Tailwind height/width) per icon view.
export const getIconBoxClass = (view: ViewMode): string => {
  switch (view) {
    case "icon-sm":
      return "h-7 w-7";
    case "icon-md":
      return "h-9 w-9";
    case "icon-lg":
      return "h-12 w-12";
    case "icon-xl":
      return "h-16 w-16";
    default:
      return "h-9 w-9";
  }
};

// Pixel size for an icon glyph (Lucide or emoji) rendered inside a view item's
// icon box. Kept a touch smaller than the box so the glyph sits comfortably
// within the rounded container across every view mode.
export const getIconSize = (view: ViewMode): number => {
  switch (view) {
    case "icon-sm":
      return 16;
    case "icon-md":
      return 20;
    case "icon-lg":
      return 28;
    case "icon-xl":
      return 36;
    case "tiles":
      return 20;
    case "details":
      return 16;
    case "default":
    default:
      return 18;
  }
};

export const humanizeSlug = (slug: string): string =>
  slug.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
