import { useEffect, useState } from "react";

export type ViewMode =
  | "default"
  | "tiles"
  | "details"
  | "icon-sm"
  | "icon-md"
  | "icon-lg"
  | "icon-xl";

const VALID_VIEWS: ViewMode[] = [
  "default",
  "tiles",
  "details",
  "icon-sm",
  "icon-md",
  "icon-lg",
  "icon-xl",
];

/**
 * Persisted article-list view preference (Default / Tiles / Details / Icons S–XL).
 *
 * Each caller passes its own `storageKey`, so different surfaces keep fully
 * independent settings (e.g. the category page, updated pages, news, featured
 * modal each remember their own view). The persisted value is hydrated in an
 * effect after mount to avoid a SSR/CSR hydration mismatch.
 */
export function useViewMode(storageKey: string, initial: ViewMode = "default") {
  const [view, setViewState] = useState<ViewMode>(initial);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) as ViewMode | null;
      if (saved && VALID_VIEWS.includes(saved)) {
        setViewState(saved);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const setView = (next: ViewMode) => {
    setViewState(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* ignore */
    }
  };

  return [view, setView] as const;
}
