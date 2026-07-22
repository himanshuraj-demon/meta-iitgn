import { create } from "zustand";
import { getPageStats } from "../api/page";

interface PageStats {
  totalPages: number;
}

interface CommonState {
  stats: PageStats | null;
  loadingStats: boolean;
  loadStats: (forceRefresh?: boolean) => Promise<void>;
}

export const useCommonStore = create<CommonState>((set, get) => ({
  stats: null,
  loadingStats: false,

  loadStats: async (forceRefresh = false) => {
    // Return early if stats are already loaded (and we aren't forcing a refresh) or if currently loading
    if (get().stats && !forceRefresh) return;
    if (get().loadingStats) return;

    set({ loadingStats: true });
    try {
      const stats = await getPageStats();
      if (stats && typeof stats.totalPages === "number") {
        set({ stats });
        localStorage.setItem("wiki-total-pages-count", JSON.stringify(stats.totalPages));
      }
    } catch (err) {
      console.error("Failed to load page stats in commonStore:", err);
    } finally {
      set({ loadingStats: false });
    }
  }
}));
