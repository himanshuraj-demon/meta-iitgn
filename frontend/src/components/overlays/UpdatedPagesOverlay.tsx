"use client";

import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import GenericOverlayModal from "@/components/overlays/GenericOverlayModal";
import { useViewMode } from "@/hooks/useViewMode";
import ViewSwitcher from "@/components/helpers/ViewSwitcher";
import { getGridClass, getIconBoxClass } from "@/lib/viewModes";

interface UpdatedPagesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  updatedPages: any[];
  getRelativeTime: (dateString: string) => string;
  hasMore: boolean;
  onLoadMore: () => void;
}

const STORAGE_KEY = "meta_iitgn_updated_pages_view";

export default function UpdatedPagesOverlay({
  isOpen,
  onClose,
  updatedPages,
  getRelativeTime,
  hasMore,
  onLoadMore,
}: UpdatedPagesOverlayProps) {
  const [view, setView] = useViewMode(STORAGE_KEY);
  if (!isOpen) return null;

  const renderItem = (page: any) => {
    const href = `/wiki/${(page.metadata as any)?.category || "campus"}/${page.slug}`;
    const subtitle = `Updated: ${getRelativeTime(page.updated_at)} (${new Date(page.updated_at).toLocaleString()})`;

    if (view.startsWith("icon-")) {
      return (
        <Link
          key={page.page_id}
          href={href}
          onClick={onClose}
          className="group flex flex-col items-center justify-center gap-2 p-2 rounded-xl hover:bg-primary/5 hover:border hover:border-primary cursor-pointer text-center"
        >
          <div
            className={`${getIconBoxClass(view)} rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary`}
          >
            <FileText className={getIconBoxClass(view)} />
          </div>
          <span className="text-xs font-medium text-base-content/80 group-hover:text-primary transition-colors duration-200 max-w-full break-words text-center">
            {page.title}
          </span>
        </Link>
      );
    }

    if (view === "tiles") {
      return (
        <Link
          key={page.page_id}
          href={href}
          onClick={onClose}
          className="flex flex-col gap-2 p-4 border border-base-300 bg-base-100 rounded-2xl shadow-xs hover:shadow-md hover:border-primary transition-all duration-150 cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <h4 className="text-sm font-bold text-base-content line-clamp-2">{page.title}</h4>
          <p className="text-[10px] text-base-content/50 font-semibold mt-auto">{subtitle}</p>
        </Link>
      );
    }

    if (view === "details") {
      return (
        <Link
          key={page.page_id}
          href={href}
          onClick={onClose}
          className="flex items-center gap-3 p-3 md:p-4 border border-base-300 bg-base-100 rounded-2xl shadow-xs hover:shadow-md hover:border-primary transition-all duration-150 cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm md:text-base font-bold text-base-content truncate">{page.title}</h4>
            <p className="text-[11px] text-base-content/50 truncate">{subtitle}</p>
          </div>
        </Link>
      );
    }

    // default
    return (
      <Link
        key={page.page_id}
        href={href}
        onClick={onClose}
        className="block p-5 border border-base-300 bg-base-100 rounded-2xl shadow-xs hover:shadow-md hover:border-primary transition-all duration-150 cursor-pointer text-left"
      >
        <h4 className="text-base font-bold text-primary">{page.title}</h4>
        <p className="text-[10px] text-base-content/50 font-semibold mt-1">{subtitle}</p>
      </Link>
    );
  };

  return (
    <GenericOverlayModal
      isOpen={isOpen}
      onClose={onClose}
      title="Recently Updated Pages"
      headerColorClass="text-secondary bg-base-200"
    >
      <div className="max-w-3xl mx-auto space-y-4 w-full">
        {updatedPages.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-base-300 bg-base-100 rounded-2xl">
            <p className="text-base-content/60 font-medium">No pages updated yet.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end">
              <ViewSwitcher view={view} onChange={setView} />
            </div>

            <div className={getGridClass(view)}>
              {updatedPages.map(renderItem)}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={onLoadMore}
                  className="inline-flex items-center gap-2 px-6 py-2 border border-base-300 hover:border-primary text-base-content/80 bg-base-100 hover:bg-base-200 rounded-xl text-xs font-bold shadow-xs transition-all duration-200 cursor-pointer active:scale-95 animate-in fade-in"
                >
                  Load More Pages
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </GenericOverlayModal>
  );
}
