"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import GenericOverlayModal from "@/components/GenericOverlayModal";

interface TriviaOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  triviaPages: any[];
  activeTriviaItem: any | null;
  setActiveTriviaItem: (item: any | null) => void;
  showAddTriviaForm: boolean;
  setShowAddTriviaForm: (show: boolean) => void;
  newTriviaTitle: string;
  setNewTriviaTitle: (title: string) => void;
  newTriviaContent: string;
  setNewTriviaContent: (content: string) => void;
  isSubmittingTrivia: boolean;
  handleAddTrivia: (e: React.FormEvent) => Promise<void>;
  getRelativeTime: (dateString: string) => string;
}

export default function TriviaOverlay({
  isOpen,
  onClose,
  triviaPages,
  activeTriviaItem,
  setActiveTriviaItem,
  showAddTriviaForm,
  setShowAddTriviaForm,
  newTriviaTitle,
  setNewTriviaTitle,
  newTriviaContent,
  setNewTriviaContent,
  isSubmittingTrivia,
  handleAddTrivia,
  getRelativeTime,
}: TriviaOverlayProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <GenericOverlayModal
      isOpen={isOpen}
      onClose={() => {
        if (activeTriviaItem) {
          setActiveTriviaItem(null);
        } else if (showAddTriviaForm) {
          setShowAddTriviaForm(false);
        } else {
          onClose();
        }
      }}
      title={showAddTriviaForm ? "Add Trivia" : activeTriviaItem ? "Read Trivia" : "Campus Trivia"}
      headerColorClass="text-blue-500 bg-base-200"
    >
      <div className="max-w-3xl mx-auto space-y-4 w-full">
        <div className="flex justify-end gap-2 mb-2">
          {activeTriviaItem && !showAddTriviaForm && (
            <button
              onClick={() => {
                onClose();
                router.push(`/wiki/campus/${activeTriviaItem.slug}`);
              }}
              className="p-2 hover:bg-base-200 rounded-lg text-base-content transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center border border-base-300"
              title="Edit Wiki Page"
            >
              <Pencil className="h-4 w-4 text-base-content" />
            </button>
          )}
          {!activeTriviaItem && !showAddTriviaForm && (
            <button
              onClick={() => setShowAddTriviaForm(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-content font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all duration-150 active:scale-97"
            >
              Add Trivia
            </button>
          )}
        </div>

        {showAddTriviaForm ? (
          <form onSubmit={handleAddTrivia} className="space-y-4 bg-base-100 p-6 border border-base-300 rounded-2xl shadow-xs text-left w-full">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase text-base-content/90">Trivia Title</label>
              <input
                type="text"
                required
                value={newTriviaTitle}
                onChange={(e) => setNewTriviaTitle(e.target.value)}
                placeholder="e.g. Sabarmati Hostel Architecture Secret"
                className="w-full border border-base-300 bg-base-100 text-base-content/85 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase text-base-content/90">Content</label>
              <textarea
                required
                rows={8}
                value={newTriviaContent}
                onChange={(e) => setNewTriviaContent(e.target.value)}
                placeholder="Write the trivia details here..."
                className="w-full border border-base-300 bg-base-100 text-base-content/85 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingTrivia}
              className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-content font-bold text-sm rounded-xl cursor-pointer transition-all duration-150 active:scale-97"
            >
              {isSubmittingTrivia ? "Submitting..." : "Submit Trivia Page"}
            </button>
          </form>
        ) : activeTriviaItem ? (
          <div className="text-left space-y-4 pt-2">
            <h3 className="text-2xl font-bold text-base-content leading-snug">{activeTriviaItem.title}</h3>
            <span className="text-[10px] text-base-content/50 font-semibold block">
              Posted: {getRelativeTime(activeTriviaItem.created_at)}
            </span>
            <div className="text-sm text-base-content/80 leading-relaxed whitespace-pre-wrap pt-4 font-semibold border-t border-base-200">
              {activeTriviaItem.content ? activeTriviaItem.content.replace(/---[\s\S]*?---/, "").replace(/#[\s\S]*?\n/, "").trim() : activeTriviaItem.description}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {triviaPages.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-base-300 bg-base-100 rounded-2xl">
                <p className="text-base-content/60 font-medium">No trivia pages found.</p>
              </div>
            ) : (
              triviaPages.map((item, idx) => (
                <div
                  key={item.slug || idx}
                  onClick={() => setActiveTriviaItem(item)}
                  className="p-5 border border-base-300 bg-base-100 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-150 cursor-pointer text-left animate-in fade-in"
                >
                  <h4 className="text-base font-bold text-base-content">{item.title}</h4>
                  <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
                    {item.content ? item.content.replace(/---[\s\S]*?---/, "").replace(/#[\s\S]*?\n/, "").trim() : item.description}
                  </p>
                  <span className="text-[9px] text-base-content/50 font-semibold block mt-2">
                    Posted: {getRelativeTime(item.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </GenericOverlayModal>
  );
}
