"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useSearchParams, useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "@/lib/api";
import { devBypass } from "@/api/user";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileEdit,
  FilePlus2,
  Flame,
  Heart,
  MapPin,
  Medal,
  MessageSquare,
  PenLine,
  Sparkles,
  TrendingUp,
  UsersRound,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  Cpu,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/api";
import { db } from "@/lib/db";

const activity = [
  { icon: FileEdit, tone: "text-primary bg-primary/10 font-bold", action: "edited", article: "Academic Calendar", detail: "Clarified the monsoon semester registration window", time: "2 hours ago" },
  { icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50", action: "reviewed", article: "Student Wellness Centre", detail: "Approved 3 suggested changes", time: "Yesterday" },
  { icon: FilePlus2, tone: "text-indigo-600 bg-indigo-50", action: "created", article: "Inter-IIT Sports Meet", detail: "Added a new campus guide", time: "Jun 18" },
  { icon: MessageSquare, tone: "text-amber-600 bg-amber-50", action: "commented on", article: "Hostel Allotment", detail: "Asked for the latest allotment notice", time: "Jun 15" },
];

const interests = ["Academics", "Campus life", "Student clubs", "Research"];

const DEV_ACCOUNTS = [
  { name: "Gold User A (Gold)", email: "gold1@meta-iitgn.edu", role: "admin" },
  { name: "Gold User B (Gold)", email: "gold2@meta-iitgn.edu", role: "admin" },
  { name: "Gold User C (Gold)", email: "gold3@meta-iitgn.edu", role: "admin" },
  { name: "Silver User A (Silver)", email: "silver1@meta-iitgn.edu", role: "moderator" },
  { name: "Silver User B (Silver)", email: "silver2@meta-iitgn.edu", role: "moderator" },
  { name: "Silver User C (Silver)", email: "silver3@meta-iitgn.edu", role: "moderator" },
  { name: "Bronze User A (Bronze)", email: "bronze1@meta-iitgn.edu", role: "normal" },
  { name: "Bronze User B (Bronze)", email: "bronze2@meta-iitgn.edu", role: "normal" },
  { name: "Bronze User C (Bronze)", email: "bronze3@meta-iitgn.edu", role: "normal" },
];

export default function ProfileContent() {
  const { user: currentUser, loading: authLoading, checkAuth } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const userIdParam = searchParams?.get("userId");
  const targetUserId = userIdParam ? Number(userIdParam) : currentUser?.user_id;

  const [profileUser, setProfileUser] = useState<any>(null);
  const [profileStats, setProfileStats] = useState<any>(null);
  const [profileReadme, setProfileReadme] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Login states
  const [loginLoading, setLoginLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [devEmail, setDevEmail] = useState(DEV_ACCOUNTS[0].email);
  const [devName, setDevName] = useState("Gold User A");
  const [devRole, setDevRole] = useState(DEV_ACCOUNTS[0].role);
  const [showDevBypass, setShowDevBypass] = useState(false);

  // OAuth Google authentication
  const googleAuth = async (tokenResponse: any) => {
    setLoginLoading(true);
    setStatus({ type: null, message: "" });
    try {
      if (tokenResponse.code) {
        const result = await api.get(
          `/user/auth/google?code=${encodeURIComponent(tokenResponse.code)}`,
          { withCredentials: true }
        );
        if (result.data.success) {
          setStatus({ type: "success", message: "Google Login Successful!" });
          await checkAuth();
        } else {
          setStatus({ type: "error", message: result.data.message || "Google auth failed on server." });
        }
      }
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.response?.data?.error || error.message || "An error occurred during Google sign-in.",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: googleAuth,
    onError: () => {
      setStatus({ type: "error", message: "Google authentication failed." });
    },
    flow: "auth-code",
    scope: "openid email profile",
  });

  const handleDevBypass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setStatus({ type: null, message: "" });
    try {
      const response = await devBypass({
        email: devEmail,
        name: devName,
        role: devRole,
      });
      if (response.success) {
        setStatus({ type: "success", message: "Sandbox Login Successful!" });
        await checkAuth();
      } else {
        setStatus({ type: "error", message: response.error || "Bypass failed." });
      }
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.response?.data?.error || error.message || "Bypass login failed.",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (!targetUserId) return;

    const fetchProfileData = async () => {
      // 1. Try to read from cache first
      try {
        const cacheKey = `profile-data-${targetUserId}`;
        const cached = await db.cachedpages.get(cacheKey);
        if (cached && cached.content) {
          const parsedCache = JSON.parse(cached.content);
          setProfileUser(parsedCache.user);
          setProfileStats(parsedCache.stats);
          setProfileReadme(parsedCache.readme);
          setDataLoading(false);
        }
      } catch (err) {
        console.error("Error reading profile cache:", err);
      }

      // 2. Fetch fresh data from API
      try {
        let targetUser = currentUser;
        if (userIdParam && Number(userIdParam) !== currentUser?.user_id) {
          const userRes = await apiService.getUserById(Number(userIdParam));
          targetUser = userRes.user;
        }
        setProfileUser(targetUser);

        let stats = null;
        const statsRes = await apiService.getUserStats(targetUserId);
        if (statsRes.success) {
          stats = statsRes.data;
          setProfileStats(stats);
        }

        let readme = "profile readme empty";
        try {
          const pageRes = await apiService.getPage(`profile-${targetUserId}`);
          if (pageRes && pageRes.content) {
            readme = pageRes.content;
          }
        } catch (err) {
          // ignore
        }
        setProfileReadme(readme);

        // Update IndexedDB cache
        try {
          const cacheKey = `profile-data-${targetUserId}`;
          await db.cachedpages.put({
            slug: cacheKey,
            content: JSON.stringify({ user: targetUser, stats, readme }),
            page_id: targetUserId,
            version: 1,
            metadata: {}
          });
        } catch (cacheErr) {
          console.error("Error writing profile cache:", cacheErr);
        }
      } catch (err) {
        console.error("Error fetching profile details:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUserId, currentUser, userIdParam]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-44 w-full bg-base-300 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-base-300 animate-pulse rounded-2xl" />)}
        </div>
        <div className="h-60 bg-base-300 animate-pulse rounded-3xl" />
      </div>
    );
  }

  // Inline login component if not authenticated
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md w-full my-12 bg-base-100 border border-base-200 shadow-xl rounded-3xl p-8 flex flex-col items-center">
        <div className="flex items-center gap-2.5 mb-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
            <BookOpen className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-xl font-serif font-black tracking-tight text-base-content">
            META <span className="text-primary">IITGN</span>
          </span>
        </div>
        <p className="text-base-content/50 text-xs text-center mb-8 font-medium tracking-wide uppercase">
          Login required to view user profiles
        </p>

        {status.type && (
          <div className={`w-full mb-5 p-3.5 rounded-2xl flex items-start gap-3 border text-xs ${
            status.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            {status.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <div>
              <p className="font-bold">{status.type === "success" ? "Success" : "Error"}</p>
              <p className="mt-0.5 opacity-90 font-medium leading-relaxed">{status.message}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => handleGoogleLogin()}
          disabled={loginLoading}
          className="w-full h-11 flex items-center justify-center gap-3 px-6 bg-primary hover:bg-slate-800 disabled:bg-slate-350 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:cursor-not-allowed select-none text-sm"
        >
          <svg className="w-4.5 h-4.5 text-white fill-current shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.58c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.84c2.24-2.06 3.53-5.1 3.53-8.41z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.84-2.98c-1.08.72-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-5.01H1.44v3.08C3.42 21.09 7.43 24 12 24z" />
            <path fill="#FBBC05" d="M5.24 14.26c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31V6.56H1.44C.52 8.4.02 10.46.02 12.63c0 2.17.5 4.23 1.42 6.07l3.8-2.97z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.43 0 3.42 2.91 1.44 6.56l3.8 2.97c.95-2.88 3.61-5.01 6.76-5.01z" />
          </svg>
          {loginLoading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="w-full flex items-center my-6">
          <div className="flex-1 h-px bg-slate-150" />
          <span className="px-3 text-[10px] text-base-content/50 font-bold uppercase tracking-wider">or bypass</span>
          <div className="flex-1 h-px bg-slate-150" />
        </div>

        <div className="w-full">
          <button
            onClick={() => setShowDevBypass(!showDevBypass)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-base-content/50 hover:text-base-content text-xs font-bold border border-dashed border-slate-300 hover:border-slate-400 rounded-xl transition-all duration-200 cursor-pointer bg-base-200/50"
          >
            <Cpu className="w-3.5 h-3.5" />
            {showDevBypass ? "Hide Sandbox Bypass" : "Show Sandbox Bypass"}
          </button>

          {showDevBypass && (
            <form onSubmit={handleDevBypass} className="mt-3.5 p-4 rounded-2xl bg-base-200 border border-base-200 flex flex-col gap-3.5 w-full">
              <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Local Sandbox Bypass</span>
              </div>
              <div className="space-y-1">
                <select
                  value={devEmail}
                  onChange={(e) => {
                    const selected = DEV_ACCOUNTS.find(acc => acc.email === e.target.value);
                    if (selected) {
                      setDevEmail(selected.email);
                      setDevName(selected.name.replace(/\s*\(.*\)/, ""));
                      setDevRole(selected.role);
                    }
                  }}
                  className="w-full h-9.5 px-3 bg-base-100 border border-base-300 rounded-xl text-xs font-bold text-base-content"
                >
                  {DEV_ACCOUNTS.map((acc) => (
                    <option key={acc.email} value={acc.email}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Bypass Sandbox
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const name = profileUser?.name || "Campus Contributor";
  const initials = name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
  const joined = profileUser?.created_at
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(profileUser.created_at))
    : "this semester";
  const role = profileUser?.role || "member";
  const tierLabel = profileUser?.role === "admin" ? "Gold contributor" : profileUser?.role === "moderator" ? "Silver contributor" : "Bronze contributor";

  const isOwner = targetUserId === currentUser?.user_id;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header Profile Info Card */}
      <section className="relative overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-28 border-b border-primary/10 bg-primary/10" />
        <div className="relative px-5 pb-6 pt-16 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-base-100 bg-base-200 text-xl font-black text-base-content shadow-lg shrink-0">
                {dataLoading ? (
                  <div className="h-full w-full bg-base-300 animate-pulse" />
                ) : profileUser?.avatar_url ? (
                  <img src={profileUser.avatar_url} alt={name} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="space-y-1">
                {dataLoading ? (
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-base-300 animate-pulse rounded-lg" />
                    <div className="h-4 w-32 bg-base-300 animate-pulse rounded-lg" />
                  </div>
                ) : (
                  <>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h1 className="font-display text-3xl font-black tracking-tight text-base-content">{name}</h1>
                      <span className="badge badge-sm border-primary/20 bg-primary/10 font-bold text-primary">{tierLabel}</span>
                    </div>
                    <p className="text-sm text-base-content/60">{role} · contributing since {joined}</p>
                  </>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {interests.map((interest) => <span key={interest} className="rounded-full bg-base-200 px-3 py-1 text-xs font-semibold text-base-content/70">{interest}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Contribution points", value: profileStats?.points?.toLocaleString(), icon: Sparkles, tone: "text-primary bg-primary/5 border border-primary/10" },
          { label: "Articles improved", value: profileStats?.articlesImproved?.toString(), icon: FileEdit, tone: "text-secondary bg-secondary/5 border border-secondary/10" },
          { label: "Edits this month", value: profileStats?.editsThisMonth?.toString(), icon: TrendingUp, tone: "text-accent bg-accent/5 border border-accent/10" },
          { label: "Current streak", value: profileStats?.streak !== undefined ? `${profileStats.streak} days` : undefined, icon: Flame, tone: "text-warning bg-warning/5 border border-warning/10" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={`rounded-2xl bg-base-100 p-4 shadow-sm flex flex-col justify-between ${tone}`}>
            <Icon className="mb-3 h-5 w-5" />
            <div>
              {dataLoading || value === undefined ? (
                <div className="h-7 w-16 bg-base-300 animate-pulse rounded-lg" />
              ) : (
                <p className="text-xl font-black text-base-content">{value}</p>
              )}
              <p className="mt-1 text-xs font-medium text-base-content/55">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* README Presentation Section */}
      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-base-200 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Profile README</p>
            <h2 className="mt-1 text-lg font-black text-base-content">A little about {name.split(" ")[0]}</h2>
          </div>
          {isOwner && !dataLoading && (
            <Link href={`/wiki/page/profile-${targetUserId}`} className="btn btn-outline btn-sm rounded-xl shrink-0">
              <PenLine className="h-4 w-4" /> Edit Profile README
            </Link>
          )}
        </div>
        <div className="prose prose-sm max-w-none text-base-content/75 prose-headings:font-display prose-headings:text-base-content prose-h2:mb-2 prose-h2:text-xl prose-h3:mb-2 prose-h3:mt-5 prose-h3:text-base prose-p:leading-7 prose-li:my-1 prose-blockquote:border-primary prose-blockquote:text-base-content/60">
          {dataLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-full bg-base-300 animate-pulse rounded-lg" />
              <div className="h-4 w-5/6 bg-base-300 animate-pulse rounded-lg" />
              <div className="h-4 w-4/5 bg-base-300 animate-pulse rounded-lg" />
            </div>
          ) : (
            <ReactMarkdown>{profileReadme || "profile readme empty"}</ReactMarkdown>
          )}
        </div>
      </section>

      <div className="grid gap-6 pt-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
        <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-black text-base-content">Recent activity</h2><p className="mt-1 text-sm text-base-content/55">A record of work across META IITGN.</p></div>
            <Link href="/user/contributions" className="btn btn-ghost btn-sm rounded-xl text-primary">View all <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="space-y-1">
            {activity.map(({ icon: Icon, tone, action, article, detail, time }) => (
              <Link href="/user/contributions" key={`${action}-${article}`} className="group flex gap-3 rounded-2xl p-3 transition-colors hover:bg-base-200/70">
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-base-content">
                    <span className="font-semibold">{isOwner ? "You" : name} {action}</span> <span className="font-bold text-primary group-hover:underline">{article}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-base-content/55">{detail}</span>
                </span>
                <span className="shrink-0 text-xs text-base-content/45">{time}</span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm bg-warning/5 border-warning/15">
            <div className="flex items-center justify-between"><h2 className="font-black text-base-content">Contribution goal</h2><Medal className="h-5 w-5 text-warning" /></div>
            <p className="mt-3 text-sm text-base-content/65">Make {Math.max(0, 36 - (profileStats?.articlesImproved || 0))} more improvements to reach the next contributor milestone.</p>
            {dataLoading ? (
              <div className="h-2 w-full bg-base-300 animate-pulse rounded-full mt-4" />
            ) : (
              <progress className="progress progress-primary mt-4 h-2 w-full" value={((profileStats?.articlesImproved || 0) / 36) * 100} max="100"></progress>
            )}
            <div className="mt-2 flex justify-between text-xs font-semibold text-base-content/50"><span>{profileStats?.articlesImproved || 0} edits</span><span>36 edits</span></div>
            <Link href="/wiki" className="btn btn-primary btn-sm mt-4 w-full rounded-xl"><BookOpen className="h-4 w-4" /> Find an article to improve</Link>
          </section>

          <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm bg-accent/5 border-accent/15">
            <h2 className="font-black text-base-content">Profile details</h2>
            <div className="mt-4 space-y-3 text-sm"><div className="flex items-center gap-3 text-base-content/65"><MapPin className="h-4 w-4 text-secondary" /> IIT Gandhinagar community</div><div className="flex items-center gap-3 text-base-content/65"><CalendarDays className="h-4 w-4 text-accent" /> Joined {joined}</div><div className="flex items-center gap-3 text-base-content/65"><Heart className="h-4 w-4 text-error" /> {interests.length} areas of interest</div></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
