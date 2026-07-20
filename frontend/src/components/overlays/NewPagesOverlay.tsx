"use client";

import React from "react";
import GenericOverlayModal from "@/components/overlays/GenericOverlayModal";
import { useViewMode } from "@/hooks/useViewMode";
import ViewSwitcher from "@/components/helpers/ViewSwitcher";
import { getGridClass, getIconSize } from "@/lib/viewModes";
import { CategoryIcon } from "@/lib/categoryIcon";
import UnifiedViewItem from "@/components/helpers/UnifiedViewItem";

interface NewPagesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  newPages: any[];
  getRelativeTime: (dateString: string) => string;
  hasMore: boolean;
  onLoadMore: () => void;
}

const STORAGE_KEY = "meta_iitgn_new_pages_view";

export default function NewPagesOverlay({
  isOpen,
  onClose,
  newPages,
  getRelativeTime,
  hasMore,
  onLoadMore,
}: NewPagesOverlayProps) {
  const [view, setView] = useViewMode(STORAGE_KEY);
  if (!isOpen) return null;

  const renderItem = (page: any) => {
    const href = `/wiki/${(page.metadata as any)?.category || "campus"}/${page.slug}`;
    const subtitle = `Created: ${getRelativeTime(page.created_at)} (${new Date(page.created_at).toLocaleString()})`;
    const pageColor = page.color || "#4f46e5";
    const iconBoxStyle = {
      backgroundColor: `${pageColor}1a`,
      borderColor: `${pageColor}33`,
      color: pageColor,
    };

    return (
      <UnifiedViewItem
        key={page.page_id}
        view={view}
        href={href}
        onClick={onClose}
        title={page.title}
        subtitle={subtitle}
        icon={<CategoryIcon icon={page.icon} size={getIconSize(view)} />}
        iconBoxStyle={iconBoxStyle}
      />
    );
  };

  return (
    <GenericOverlayModal
      isOpen={isOpen}
      onClose={onClose}
      title="Recently Created Pages"
      headerColorClass="text-primary bg-base-200"
    >
      <div className="max-w-3xl mx-auto space-y-4 w-full">
        {newPages.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-base-300 bg-base-100 rounded-2xl">
            <p className="text-base-content/60 font-medium">No new pages created yet.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end">
              <ViewSwitcher view={view} onChange={setView} />
            </div>

            <div className={getGridClass(view)}>
              {newPages.map(renderItem)}
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
