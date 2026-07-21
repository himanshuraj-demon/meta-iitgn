"use client";

import React, { useEffect, useState } from "react";
import Avatar from "@/components/helpers/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { getUserInterviewStats, InterviewUserStats } from "@/api/interviews";
import { Plus, FileText, CheckCircle2, Clock, Heart, LogIn } from "lucide-react";
import Link from "next/link";

interface UserStatsCardProps {
  onOpenCreateModal: () => void;
  refreshTrigger?: number;
}

export default function UserStatsCard({ onOpenCreateModal, refreshTrigger }: UserStatsCardProps) {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<InterviewUserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getUserInterviewStats();
        if (res && res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error("Error fetching interview stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser, refreshTrigger]);

  if (!currentUser) {
    return (
      <div className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LogIn className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-base-content tracking-tight">Join the Conversation</h3>
          <p className="text-xs text-base-content/60">
            Sign in to share your interview experiences and like posts.
          </p>
        </div>
        <Link href="/login" className="btn btn-primary btn-sm w-full rounded-xl font-bold">
          <LogIn className="h-4 w-4" /> Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm space-y-5">
      {/* Profile Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-base-200 border border-base-300 overflow-hidden shrink-0">
          <Avatar email={currentUser.email} name={currentUser.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-base-content truncate">{currentUser.name}</h3>
          <p className="text-xs text-base-content/60 font-medium truncate">{currentUser.email}</p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onOpenCreateModal}
        className="btn btn-primary w-full rounded-2xl font-bold shadow-sm gap-2 text-xs py-2.5"
      >
        <Plus className="h-4 w-4" />
        <span>Share Experience</span>
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-base-200/70">
        <div className="p-3 rounded-2xl bg-base-200/50 border border-base-200/80 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-base-content/60 font-semibold">
            <FileText className="h-3.5 w-3.5 text-primary" /> Posts
          </div>
          <span className="text-base font-black text-base-content">
            {loading ? "..." : stats?.totalPosts ?? 0}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-base-200/50 border border-base-200/80 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-base-content/60 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Approved
          </div>
          <span className="text-base font-black text-base-content">
            {loading ? "..." : stats?.approvedPosts ?? 0}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-base-200/50 border border-base-200/80 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-base-content/60 font-semibold">
            <Clock className="h-3.5 w-3.5 text-warning" /> Pending
          </div>
          <span className="text-base font-black text-base-content">
            {loading ? "..." : stats?.pendingPosts ?? 0}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-base-200/50 border border-base-200/80 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-base-content/60 font-semibold">
            <Heart className="h-3.5 w-3.5 text-rose-500" /> Likes
          </div>
          <span className="text-base font-black text-base-content">
            {loading ? "..." : stats?.totalLikes ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
