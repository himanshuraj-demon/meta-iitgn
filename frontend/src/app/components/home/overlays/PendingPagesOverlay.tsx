"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";

interface PendingPagesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  pendingPages: any[];
  getRelativeTime: (dateString: string) => string;
  handleReview: (pending_id: number, action: "approve" | "reject") => Promise<void>;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function PendingPagesOverlay({
  isOpen,
  onClose,
  pendingPages,
  getRelativeTime,
  handleReview,
  hasMore,
  onLoadMore,
}: PendingPagesOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-base-100 z-[99999] flex flex-col h-dvh w-screen overflow-hidden select-none animate-in fade-in duration-200 text-base-content">
      <header className="h-16 border-b border-base-200 flex items-center gap-4 px-6 shrink-0 bg-base-100 shadow-sm select-none">
        <button
          onClick={onClose}
          className="p-2 hover:bg-base-200 rounded-lg text-base-content transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center"
        >
          <ChevronLeft className="h-6 w-6 text-base-content" />
        </button>
        <span className="text-sm font-bold text-accent uppercase tracking-wider">Pending Changes Review</span>
      </header>
      <div className="flex-1 overflow-y-auto overscroll-contain bg-base-200/50 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col gap-1 text-left">
            <h2 className="text-2xl font-serif font-black text-base-content tracking-tight">Pending Approval</h2>
            <p className="text-xs text-base-content/50 font-semibold uppercase tracking-wider">Review proposed community revisions before publishing</p>
          </div>

          {pendingPages.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-base-300 bg-base-100 rounded-2xl">
              <p className="text-base-content/60 font-medium">No pending drafts awaiting review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPages.map((pending) => {
                const authorName = pending.users?.name || `User #${pending.editor_id}`;
                const initials = authorName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "U";
                const timeString = getRelativeTime(pending.created_at);

                return (
                  <div key={pending.pending_id} className="p-5 border border-base-300 bg-base-100 rounded-2xl shadow-xs hover:shadow-md transition-all duration-150 relative text-left">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center font-bold text-sm text-base-content/85 shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-base font-bold text-base-content truncate">{pending.title}</h4>
                          <span className="text-xs text-base-content/50 shrink-0 font-medium">{timeString}</span>
                        </div>
                        <p className="text-sm text-base-content/70 mt-2 leading-relaxed line-clamp-3">
                          {pending.content.replace(/---[\s\S]*?---/, "").trim()}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-base-200 border-dashed">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-base-content/80">{authorName}</span>
                            <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {pending.page_id ? "Edit Proposal" : "New Page Proposal"}
                            </span>
                            {pending.status === "approved" && (
                              <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20">Approved</span>
                            )}
                            {pending.status === "rejected" && (
                              <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-error/10 text-error border border-error/20">Rejected</span>
                            )}
                            {pending.status === "in_review" && (
                              <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">Pending Review</span>
                            )}
                          </div>
                          {pending.status === "in_review" && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleReview(pending.pending_id, "approve")}
                                className="text-xs font-extrabold text-success hover:text-success/80 transition-colors cursor-pointer duration-150"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReview(pending.pending_id, "reject")}
                                className="text-xs font-extrabold text-error hover:text-error/80 transition-colors cursor-pointer duration-150"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={onLoadMore}
                    className="inline-flex items-center gap-2 px-6 py-2 border border-base-300 hover:border-primary text-base-content/80 bg-base-100 hover:bg-base-200 rounded-xl text-xs font-bold shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    Load More Drafts
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
