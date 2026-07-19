"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, Loader2, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHomeStore } from "@/store/useHomeStore";
import { apiService } from "@/api";
import GenericOverlayModal from "@/components/overlays/GenericOverlayModal";
import Link from "next/link";
import { useViewMode } from "@/hooks/useViewMode";
import ViewSwitcher from "@/components/helpers/ViewSwitcher";
import { getGridClass, getIconBoxClass } from "@/lib/viewModes";

interface FeaturedEditOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeaturedEditOverlay({
  isOpen,
  onClose,
}: FeaturedEditOverlayProps) {
  const { user } = useAuth();
  const canManageFeatured = user?.role === "admin" || user?.role === "moderator";

  const router = useRouter();
  const featuredPages = useHomeStore((s) => s.featuredPages);
  const setFeaturedPages = useHomeStore((s) => s.setFeaturedPages);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Article-list view (Default / Tiles / Details / Icons S–XL). Persisted to
  // localStorage under a featured-specific key so it's independent of other surfaces.
  const [view, setView] = useViewMode("meta_iitgn_featured_view");

  // Re-fetch the featured list from the server and sync the store so the
  // home carousel updates live.
  const refresh = async () => {
    try {
      const res = await apiService.getFeaturedPages();
      const data = (res.data || []).map((item: any) => ({
        ...item,
        id: String(item.featured_id),
      }));
      setFeaturedPages(data);
    } catch (err) {
      console.error("Failed to refresh featured pages:", err);
    }
  };

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await apiService.searchPages(q, 1, 8, "All");
      const featuredSlugs = new Set(
        featuredPages.map((f: any) => f.slug)
      );
      const pages = (res.results || []).filter(
        (r: any) =>
          r.type === "page" &&
          !r.is_pending &&
          !featuredSlugs.has(r.slug)
      );
      setResults(pages);
    } catch (err) {
      console.error("Featured search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (result: any) => {
    setBusyId(`add-${result.slug}`);
    try {
      let pageId = result.page_id;
      if (pageId == null) {
        const page = await apiService.getPage(result.slug);
        pageId = page?.page_id;
      }
      if (pageId == null) {
        alert("That page can't be featured (no page id).");
        return;
      }
      await apiService.setFeaturedPage({ page_id: pageId });
      setResults([]);
      setQuery("");
      await refresh();
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to add featured page.";
      alert(msg);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (featuredId: number) => {
    setBusyId(`remove-${featuredId}`);
    try {
      await apiService.removeFeaturedPage(featuredId);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to remove featured page.");
    } finally {
      setBusyId(null);
    }
  };

  const renderFeatured = (f: any) => {
    const open = () => router.push(`/wiki/page/${f.slug}`);
    const removeBtn = canManageFeatured ? (
      <button
        type="button"
        disabled={busyId === `remove-${f.featured_id}`}
        onClick={(e) => {
          e.stopPropagation();
          handleRemove(f.featured_id);
        }}
        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10 shrink-0 cursor-pointer"
        aria-label={`Remove ${f.title}`}
        title="Remove from featured"
      >
        {busyId === `remove-${f.featured_id}` ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    ) : null;

    if (view.startsWith("icon-")) {
      return (
        <div
          key={f.id}
          onClick={open}
          className="group relative flex flex-col items-center justify-center gap-2 p-2 rounded-xl hover:bg-primary/5 hover:border hover:border-primary cursor-pointer text-center"
        >
          <div
            className={`${getIconBoxClass(view)} rounded-xl overflow-hidden border border-base-300 bg-base-200 flex items-center justify-center`}
          >
            {f.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.image} alt={f.title || "Featured"} className="w-full h-full object-cover" />
            ) : (
              <FileText className={getIconBoxClass(view)} />
            )}
          </div>
          <span className="text-xs font-medium text-base-content/80 group-hover:text-primary transition-colors duration-200 max-w-full break-words text-center">
            {f.title}
          </span>
          {removeBtn && <div className="absolute top-1 right-1">{removeBtn}</div>}
        </div>
      );
    }

    if (view === "tiles") {
      return (
        <div
          key={f.id}
          onClick={open}
          className="flex flex-col gap-2 p-3 border border-base-300 bg-base-100 rounded-2xl shadow-xs hover:border-primary transition-all duration-150 cursor-pointer text-left"
        >
          <div className="w-full h-24 rounded-lg overflow-hidden border border-base-300 bg-base-200">
            {f.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.image} alt={f.title || "Featured"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content/40">
                <FileText className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-base-content hover:text-primary transition-colors truncate">
              {f.title}
            </span>
            <p className="text-[10px] uppercase tracking-wider text-base-content/50 truncate">
              {f.tag || "Featured"}
              {f.location ? ` · ${f.location}` : ""}
            </p>
          </div>
          {removeBtn}
        </div>
      );
    }

    if (view === "details") {
      return (
        <div
          key={f.id}
          onClick={open}
          className="flex items-center gap-3 p-3 rounded-xl border border-base-300 bg-base-100 shadow-xs hover:border-primary transition-all duration-150 cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-lg border border-base-300 bg-base-200 flex items-center justify-center text-primary shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-base-content hover:text-primary transition-colors truncate">
              {f.title}
            </span>
            <p className="text-[10px] uppercase tracking-wider text-base-content/50 truncate">
              {f.tag || "Featured"}
              {f.location ? ` · ${f.location}` : ""}
            </p>
          </div>
          {removeBtn}
        </div>
      );
    }

    // default (current)
    return (
      <div
        key={f.id}
        onClick={open}
        className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-2.5 shadow-xs hover:border-primary transition-all duration-150 cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={f.image || "/homepage_bg.png"}
          alt={f.title || "Featured"}
          className="w-14 h-14 object-cover rounded-lg shrink-0 bg-base-200"
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-base-content hover:text-primary transition-colors block truncate">
            {f.title}
          </span>
          <p className="text-[10px] uppercase tracking-wider text-base-content/50 truncate">
            {f.tag || "Featured"}
            {f.location ? ` · ${f.location}` : ""}
          </p>
        </div>
        {removeBtn}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <GenericOverlayModal
      isOpen={isOpen}
      onClose={onClose}
      title="Featured Pages"
      headerColorClass="text-primary bg-base-200"
    >
      <div className="space-y-6 w-full">
        {!canManageFeatured && (
          <div className="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3 text-xs text-base-content/70 font-semibold">
            You&rsquo;re viewing the featured list. Editing is available to gold
            members and moderators.
          </div>
        )}

        {/* Gold-only: search & add / create */}
        {canManageFeatured && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search pages to feature…"
                  className="w-full border border-base-300 hover:border-base-content/30 focus:border-primary rounded-xl pl-9 pr-3 py-2.5 text-sm text-base-content placeholder-base-content/40 bg-base-100 focus:outline-none transition-all duration-150 shadow-sm"
                />
              </div>
              <Link
                href="/wiki/page/new?title=New%20Featured%20Article&category=Featured"
                className="btn btn-primary rounded-xl font-bold text-xs gap-1.5 shrink-0 cursor-pointer flex items-center justify-center text-primary-content hover:text-primary-content"
              >
                <Plus className="h-4 w-4" /> Create & Feature
              </Link>
            </div>

            {searching && (
              <div className="flex items-center gap-2 text-xs text-base-content/50 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
              </div>
            )}

            {!searching && results.length > 0 && (
              <div className="space-y-2">
                {results.map((r) => (
                  <button
                    key={r.slug}
                    type="button"
                    disabled={busyId === `add-${r.slug}`}
                    onClick={() => handleAdd(r)}
                    className="w-full flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-100 px-3 py-2.5 text-left shadow-xs hover:border-primary hover:bg-primary/5 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-base-content truncate">
                        {r.title}
                      </span>
                      <span className="block text-[10px] uppercase tracking-wider text-base-content/50">
                        {r.category || "Page"}
                      </span>
                    </span>
                    {busyId === `add-${r.slug}` ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                    ) : (
                      <Plus className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {!searching && query.trim() && results.length === 0 && (
              <p className="text-xs text-base-content/50 py-2">
                No new pages match &ldquo;{query}&rdquo;.
              </p>
            )}
          </div>
        )}

        {/* Listing (everyone) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[10px] font-bold text-base-content/50 tracking-wider uppercase">
              {canManageFeatured ? "Currently Featured" : "Featured List"}
            </h4>
            <ViewSwitcher view={view} onChange={setView} />
          </div>

          {featuredPages.length === 0 ? (
            <p className="text-sm text-base-content/50 py-6 text-center border border-dashed border-base-300 rounded-2xl">
              No featured pages yet.
            </p>
          ) : (
            <div className={getGridClass(view)}>
              {featuredPages.map(renderFeatured)}
            </div>
          )}
        </div>
      </div>
    </GenericOverlayModal>
  );
}
