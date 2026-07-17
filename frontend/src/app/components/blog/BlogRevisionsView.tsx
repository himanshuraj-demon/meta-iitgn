"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GenericOverlayModal from "@/components/GenericOverlayModal";
import { apiService } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import ConfirmationModal from "@/components/ConfirmationModal";

interface BlogRevisionsViewProps {
  setShowRevisions: (show: boolean) => void;
  slug: string;
}

interface RevisionRecord {
  revision_id: number;
  blog_id: number;
  created_by_user_id: number;
  commit_message: string | null;
  title: string | null;
  description: string | null;
  slug: string;
  content: string | null;
  original_author_id: number;
  created_at: string;
  version: number | null;
  creator: {
    user_id: number;
    name: string;
    avatar_url: string | null;
    role: string;
  };
}

export default function BlogRevisionsView({ setShowRevisions, slug }: BlogRevisionsViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [revisions, setRevisions] = useState<RevisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [revertingId, setRevertingId] = useState<number | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [revisionToRestore, setRevisionToRestore] = useState<number | null>(null);

  const limit = 5;

  const isAdminOrMod = user?.role === "admin" || user?.role === "moderator";

  const fetchRevisions = async (pageNum: number, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const res = await apiService.getBlogRevisions(slug, { page: pageNum, limit });
      if (res && res.success) {
        if (append) {
          setRevisions((prev) => [...prev, ...res.revisions]);
        } else {
          setRevisions(res.revisions);
        }
        setHasMore(res.hasMore);
      }
    } catch (err: any) {
      console.error("Error loading blog revisions:", err);
      setError(err.response?.data?.error || err.message || "Failed to load revisions.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchRevisions(1, false);
    }
  }, [slug]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchRevisions(next, true);
  };

  const handleRestore = (revisionId: number) => {
    setRevisionToRestore(revisionId);
    setShowRestoreConfirm(true);
  };

  const confirmRestore = async () => {
    if (revisionToRestore === null) return;
    try {
      setRevertingId(revisionToRestore);
      const res = await apiService.revertBlog(slug, revisionToRestore);
      if (res && res.success) {
        alert("Blog post reverted successfully!");
        setShowRevisions(false);
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || "Failed to revert blog post.");
    } finally {
      setRevertingId(null);
      setRevisionToRestore(null);
    }
  };

  const closeModal = () => {
    setShowRevisions(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown time";
    }
  };

  const getBadgeStyle = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-primary/10 text-primary border border-primary/20";
      case "moderator":
        return "bg-warning/10 text-warning border border-warning/20";
      default:
        return "bg-neutral/20 text-base-content/85 border border-base-300";
    }
  };

  return (
    <GenericOverlayModal isOpen={true} onClose={closeModal} title="Recent Blog Revisions">
      <div className="max-w-3xl mx-auto space-y-6 w-full">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-serif font-black text-base-content tracking-tight">Recent Blog Revisions</h2>
          <p className="text-xs text-base-content/50 font-semibold uppercase tracking-wider">Track and restore past versions for this blog post</p>
        </div>

        {loading ? (
          <div className="space-y-4 pt-4">
            <div className="h-24 w-full bg-base-200 animate-pulse rounded-2xl"></div>
            <div className="h-24 w-full bg-base-200 animate-pulse rounded-2xl"></div>
          </div>
        ) : error ? (
          <div className="p-6 border border-error/20 bg-error/10 text-error rounded-2xl text-center">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => { setPage(1); fetchRevisions(1, false); }}
              className="btn btn-sm btn-error mt-4 text-error-content rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : revisions.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-base-300 bg-base-100 rounded-2xl">
            <p className="text-base-content/60 font-medium">No revision history found for this blog post.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-4 pb-12">
            {revisions.map((revision) => {
              const authorName = revision.creator?.name || `User #${revision.created_by_user_id}`;
              const initials = authorName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "U";
              const timeString = formatDate(revision.created_at);
              const badgeStyle = getBadgeStyle(revision.creator?.role || "normal");

              return (
                <div key={revision.revision_id} className="p-4 sm:p-5 border border-base-300 bg-base-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 relative group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center font-bold text-sm text-base-content/80 shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                        <h4 className="text-base font-bold text-base-content truncate leading-snug">
                          {revision.title || "Untitled Version"}
                        </h4>
                        <span className="text-xs text-base-content/50 shrink-0 font-medium">{timeString}</span>
                      </div>
                      <p className="text-sm text-base-content/60 mt-1.5 leading-relaxed">
                        {revision.commit_message || `Version backup (v${revision.version})`}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-base-200 border-dashed">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-base-content/80">{authorName}</span>
                          <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
                            {revision.creator?.role || "Contributor"}
                          </span>
                          {revision.version !== null && (
                            <span className="text-[9px] font-bold bg-base-200 px-2 py-0.5 rounded-md text-base-content/60">
                              v{revision.version}
                            </span>
                          )}
                        </div>

                        {isAdminOrMod && (
                          <button
                            onClick={() => handleRestore(revision.revision_id)}
                            disabled={revertingId !== null}
                            className="text-xs font-extrabold text-primary hover:text-blue-700 disabled:text-gray-400 transition-colors cursor-pointer duration-150"
                          >
                            {revertingId === revision.revision_id ? "Restoring..." : "Restore Version"}
                          </button>
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
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn btn-sm btn-outline rounded-xl font-bold"
                >
                  {loadingMore ? "Loading..." : "Load More Revisions"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showRestoreConfirm}
        onClose={() => {
          setShowRestoreConfirm(false);
          setRevisionToRestore(null);
        }}
        onConfirm={confirmRestore}
        title="Revert Blog Post"
        message="Are you sure you want to revert the live blog post to this previous version? This will overwrite the current live version (a backup will be saved)."
        confirmText="Revert"
        cancelText="Cancel"
        type="warning"
      />
    </GenericOverlayModal>
  );
}
