"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  ArrowRight,
  Sparkles,
  FlaskConical,
  Trophy,
  Calendar,
  BookOpen,
  Languages,
  Users2,
  Eye,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPinned,
  UtensilsCrossed,
  Bus,
  Camera,
} from "lucide-react";

import ParallaxBackground from "@/components/ParallaxBackground";
import { useAuth } from "@/hooks/useAuth";

interface HomeTabProps {
  mousePos: { x: number; y: number };
  imageLoaded: boolean;
  scrollToFeed: () => void;
  spawnHearts: (e: React.MouseEvent) => void;
  setShowAllNew: (show: boolean) => void;
  setShowAllUpdated: (show: boolean) => void;
  setShowAllPending: (show: boolean) => void;
  newPages: any[];
  updatedPages: any[];
  pendingPages: any[];
  loading: boolean;
  getRelativeTime: (dateString: string) => string;
  newsPages: any[];
  setShowAllNews: (show: boolean) => void;
  triviaPages: any[];
  setShowAllTrivia: (show: boolean) => void;
  setActiveTriviaItem: (item: any) => void;
  historyPages: any[];
  setShowAllHistory: (show: boolean) => void;
  setActiveHistoryItem: (item: any) => void;
  editors: any[];
  setShowAllEditors: (show: boolean) => void;
  totalPagesCount: number | null;
}

export default function HomeTab({
  mousePos,
  imageLoaded,
  scrollToFeed,
  spawnHearts,
  setShowAllNew,
  setShowAllUpdated,
  setShowAllPending,
  newPages,
  updatedPages,
  pendingPages,
  loading,
  getRelativeTime,
  newsPages,
  setShowAllNews,
  triviaPages,
  setShowAllTrivia,
  setActiveTriviaItem,
  historyPages,
  setShowAllHistory,
  setActiveHistoryItem,
  editors,
  setShowAllEditors,
  totalPagesCount,
}: HomeTabProps) {
  const { categories } = useAuth();
  const router = useRouter();
  const [categoriesCount, setCategoriesCount] = useState(11);
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoriesCount(categories.length);
    }
  }, [categories]);

  const featuredSlides = [
    {
      title: "Campus Design & Architecture",
      image: "/iitgn_campus.png",
      tag: "Featured Story",
      location: "Palaj Campus",
      description: "Explore the climate-responsive architecture, green corridors, and thoughtfully designed spaces that define IITGN.",
      href: "/wiki/campus/campuses-and-surroundings",
    },
    {
      title: "Student Life & Campus Culture",
      image: "/homepage_bg.png",
      tag: "Campus Life",
      location: "Student Experience",
      description: "From clubs and fests to everyday routines, discover the community stories that make the campus feel alive.",
      href: "/wiki/campus/hostels-guide",
    },
    {
      title: "Facilities & Everyday Guide",
      image: "/homepage_bg.png",
      tag: "Quick Guide",
      location: "Facilities",
      description: "A concise guide to transport, mess, labs, and the places students use most often on campus.",
      href: "/wiki/campus/facilities",
    },
  ];

  const upcomingEvents = [
    { title: "Weekly Tech Talk", time: "Thu · 6:30 PM", detail: "Open to all students and clubs." },
    { title: "Cultural Night", time: "Sat · 8:00 PM", detail: "Live performances and campus food stalls." },
    { title: "Library Night", time: "Sun · 9:00 PM", detail: "Extended hours for exam prep and study groups." },
  ];

  const popularPages = [
    { title: "Campus Map & Routes", href: "/wiki/campus/campuses-and-surroundings", tag: "Popular" },
    { title: "Hostel Life Guide", href: "/wiki/campus/hostels-guide", tag: "Trending" },
    { title: "Facilities Index", href: "/wiki/campus/facilities", tag: "Fresh" },
  ];

  const messMenu = ["Breakfast: Idli, sambar, fruit", "Lunch: Paneer curry, rice, salad", "Dinner: Dal, roti, seasonal vegetables"];
  const transportSchedule = ["Shuttle A: 7:30 AM · 8:30 AM · 5:00 PM", "Shuttle B: 9:00 AM · 1:30 PM · 7:30 PM", "City bus: 10-minute intervals after 6 PM"];

  const handleFeaturedSlide = (direction: number) => {
    setFeaturedSlideIndex((prev) => (prev + direction + featuredSlides.length) % featuredSlides.length);
  };

  const handleRandomPage = () => {
    const candidates = [...(newPages || []), ...(updatedPages || [])].filter(Boolean);
    if (candidates.length === 0) {
      router.push("/wiki/campus/campuses-and-surroundings");
      return;
    }
    const randomItem = candidates[Math.floor(Math.random() * candidates.length)];
    router.push(`/wiki/campus/${randomItem.slug}`);
  };

  const activeFeaturedSlide = featuredSlides[featuredSlideIndex];

  return (
    <>
      {/* Mountain Hero Banner */}
      <div className="relative w-full h-[85vh] lg:h-dvh min-h-125 hidden md:flex flex-col items-center justify-center text-center p-6 bg-primary overflow-hidden select-none">
        {/* Reusable Parallax Background Component */}
        <ParallaxBackground
          mousePos={mousePos}
          imageSrc="/homepage_bg.png"
          overlayClass="bg-linear-to-b via-slate-900/45 to-slate-950/65"
        />

        <style>{`
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            55% { background-position: 100% 50%; }
          }
          @keyframes slide-up-fade {
            0% { opacity: 0; transform: translateY(120px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-gradient-text {
            background-size: 200% auto;
            animation: gradient-x 6s ease infinite;
          }
          .animate-hero-content {
            animation: slide-up-fade 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>

        {/* Hero Content */}
        <div
          className={`relative z-10 max-w-5xl space-y-6 px-4 ${imageLoaded ? "animate-hero-content" : "opacity-0"
            } font-style-sensitive`}
        >
          <h1 className="select-none leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
            <span className="text-4xl sm:text-6xl lg:text-[75px] font-light tracking-wide bg-linear-to-r from-white to-slate-200 bg-clip-text text-transparent block">
              Welcome to
            </span>
            <span className="text-5xl sm:text-7xl lg:text-[105px] font-bold tracking-widest bg-linear-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent block mt-4 filter drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)] animate-gradient-text uppercase">
              META IITGN
            </span>
          </h1>
          <p className="text-md sm:text-lg md:text-xl text-slate-200/90 font-medium tracking-widest max-w-2xl mx-auto leading-relaxed text-shadow-premium pt-4 uppercase">
            A collaborative space where anyone on campus can write and edit about anything.
          </p>
        </div>

        {/* Pulsating Scroll Wheel Indicator */}
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer text-white/85 hover:text-white group select-none transition-opacity duration-300"
          onClick={scrollToFeed}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-shadow-premium">
            Scroll Down
          </span>
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-transform group-hover:translate-y-0.5">
            <div className="w-1.5 h-2.5 bg-white rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Scrollable Highlights Feed Container */}
      <div
        id="right-highlights-feed"
        className="p-6 pb-28 md:p-8 lg:p-10 bg-transparent space-y-10"
      >
        {/* Double Column: Featured Article & In the News split side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Featured Article */}
          <div className="lg:col-span-7 flex flex-col h-full space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-base-content tracking-tight">
                Featured Article
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-250 text-amber-700 font-sans font-bold text-[9px] rounded-full uppercase tracking-wider shrink-0 select-none">
                <Award className="h-3 w-3" />
                Special Feature
              </span>
            </div>
            <div className="card card-bordered bg-base-100 border-base-200 overflow-hidden shadow-depth shadow-depth-hover flex flex-col flex-1 h-full relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
              <div className="flex items-center justify-between px-4 pt-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> {activeFeaturedSlide.tag}
                </div>
                <div className="join gap-1">
                  <button type="button" onClick={() => handleFeaturedSlide(-1)} className="btn btn-xs btn-circle btn-ghost">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => handleFeaturedSlide(1)} className="btn btn-xs btn-circle btn-ghost">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <img
                src={activeFeaturedSlide.image}
                alt={activeFeaturedSlide.title}
                className="w-full h-56 md:h-64 object-cover mt-3"
              />
              <div className="p-6 space-y-3 text-left flex flex-col flex-1 justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-base-content/60">
                    <MapPinned className="h-3.5 w-3.5" /> {activeFeaturedSlide.location}
                  </div>
                  <h3 className="text-lg font-black text-base-content font-serif rotate-1">
                    {activeFeaturedSlide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed font-semibold mt-1">
                    {activeFeaturedSlide.description}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Link
                    href={activeFeaturedSlide.href}
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-primary hover:text-blue-800 uppercase tracking-wider self-start"
                  >
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <div className="flex gap-2">
                    {featuredSlides.map((slide, index) => (
                      <button
                        key={slide.title}
                        type="button"
                        onClick={() => setFeaturedSlideIndex(index)}
                        className={`h-2.5 rounded-full transition-all ${featuredSlideIndex === index ? "w-7 bg-primary" : "w-2.5 bg-base-300"}`}
                        aria-label={`Show ${slide.title}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* In the News */}
          <div className="lg:col-span-5 flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-base-content tracking-tight">
                In the News
              </h2>
              <button
                onClick={() => setShowAllNews(true)}
                className="btn btn-ghost btn-xs text-primary font-bold hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>
            <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover space-y-4 text-left flex flex-col flex-1 h-full justify-between">
              <div className="space-y-4">
                {newsPages.slice(0, 5).map((item, index) => {
                  const Icons = [Sparkles, FlaskConical, Trophy];
                  const IconComponent = Icons[index % Icons.length];
                  const colors = [
                    "bg-primary/10 text-primary",
                    "bg-success/10 text-success",
                    "bg-secondary/10 text-secondary"
                  ];
                  const colorClass = colors[index % colors.length];

                  return (
                    <button
                      key={`news-${item.slug || index}`}
                      type="button"
                      onClick={() => setShowAllNews(true)}
                      className="flex items-start gap-3 border-b border-base-200 pb-3 last:border-b-0 last:pb-0 cursor-pointer group text-left w-full"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-base-content group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-base-content/50 mt-0.5 block font-semibold">
                          {getRelativeTime(item.created_at)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowAllNews(true)}
                className="btn btn-ghost btn-xs text-primary font-extrabold uppercase tracking-wider gap-1 pt-2 self-start cursor-pointer"
              >
                More campus news <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Three Column Highlights Section with Balanced Heights */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2 items-stretch select-none">
          {/* Card 1: Did You Know? */}
          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover flex flex-col justify-between h-full text-left">
            <div>
              <h3 className="text-sm font-black text-base-content font-serif mb-2.5">
                Did You Know?
              </h3>
              {triviaPages.length > 0 ? (
                <div
                  onClick={() => {
                    setActiveTriviaItem(triviaPages[0]);
                    setShowAllTrivia(true);
                  }}
                  className="cursor-pointer group"
                >
                  <h4 className="text-xs font-bold text-base-content group-hover:text-primary transition-colors mb-1">
                    {triviaPages[0].title}
                  </h4>
                  <p className="text-xs text-base-content/60 leading-relaxed font-semibold line-clamp-3">
                    {triviaPages[0].content ? triviaPages[0].content.replace(/---[\s\S]*?---/, "").replace(/#[\s\S]*?\n/, "").trim() : triviaPages[0].description}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-base-content/60 leading-relaxed font-semibold">
                  Hostels at IIT Gandhinagar are named after famous rivers in India, such as Sabarmati, Narmada, Shipra, and others.
                </p>
              )}
            </div>
            <button
              onClick={() => setShowAllTrivia(true)}
              className="btn btn-ghost btn-xs text-primary font-extrabold uppercase tracking-wider mt-4 self-start cursor-pointer hover:underline"
            >
              More trivia
            </button>
          </div>

          {/* Card 2: On This Day */}
          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover flex flex-col justify-between h-full text-left">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-black text-base-content font-serif">
                  On This Day
                </h3>
              </div>
              <div className="text-primary text-xs font-extrabold mb-1.5">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {historyPages.length > 0 ? (
                <div
                  onClick={() => {
                    setActiveHistoryItem(historyPages[0]);
                    setShowAllHistory(true);
                  }}
                  className="cursor-pointer group"
                >
                  <h4 className="text-xs font-bold text-base-content group-hover:text-primary transition-colors mb-1">
                    {historyPages[0].title}
                  </h4>
                  <p className="text-xs text-base-content/60 leading-relaxed font-semibold line-clamp-3">
                    {historyPages[0].content ? historyPages[0].content.replace(/---[\s\S]*?---/, "").replace(/#[\s\S]*?\n/, "").trim() : historyPages[0].description}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-base-content/60 leading-relaxed font-semibold">
                  In 2015, IIT Gandhinagar officially completed the transition and began classes at its permanent campus in Palaj.
                </p>
              )}
            </div>
            <button
              onClick={() => setShowAllHistory(true)}
              className="btn btn-ghost btn-xs text-primary font-extrabold uppercase tracking-wider mt-4 self-start cursor-pointer hover:underline"
            >
              History timeline
            </button>
          </div>

          {/* Card 3: Active Contributors */}
          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover flex flex-col justify-between h-full text-left">
            <div>
              <h3 className="text-sm font-black text-base-content font-serif mb-2.5">
                Wiki Contributors
              </h3>
              {editors.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {editors.slice(0, 3).map((editor, index) => {
                    const initials = editor.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "U";
                    return (
                      <div key={`editor-${editor.user_id || index}-${index}`} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-base-200 border border-base-300 flex items-center justify-center font-bold text-[9px] text-base-content">
                          {initials}
                        </div>
                        <span className="text-xs text-base-content/80 font-semibold truncate">{editor.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-base-content/60 leading-relaxed font-semibold">
                  META IITGN is built and maintained by members of the student body. Share your survival tips, course feedback, and project work.
                </p>
              )}
            </div>
            <button
              onClick={() => setShowAllEditors(true)}
              className="btn btn-primary btn-sm w-full font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all duration-150 active:scale-97 mt-4"
            >
              View Active Editors
            </button>
          </div>
        </div>

        {/* Three Column Recent Activity Section with Balanced Heights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-stretch select-none">
          {/* Card 4: New Pages */}
          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover flex flex-col justify-between h-full text-left">
            <div>
              <h3 className="text-sm font-black text-base-content font-serif mb-2.5">
                New Pages
              </h3>
              {loading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-base-content/50">Loading new pages...</span>
                </div>
              ) : newPages.length === 0 ? (
                <p className="text-xs text-base-content/50 py-4">No new pages created yet.</p>
              ) : (
                <ul className="space-y-3">
                  {newPages.slice(0, 3).map((page, index) => (
                    <li key={`new-page-${page.page_id || index}`}>
                      <Link
                        href={`/wiki/campus/${page.slug}`}
                        className="block text-xs font-semibold text-base-content/85 hover:text-primary transition-colors truncate"
                      >
                        {page.title || "Untitled"}
                      </Link>
                      <span className="text-[9px] text-base-content/50 font-semibold block">
                        Created {getRelativeTime(page.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => setShowAllNew(true)}
              className="btn btn-ghost btn-xs text-primary font-bold uppercase tracking-wider mt-4 text-left cursor-pointer"
            >
              View all new pages
            </button>
          </div>

          {/* Card 5: Updated Pages */}
          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover flex flex-col justify-between h-full text-left">
            <div>
              <h3 className="text-sm font-black text-base-content font-serif mb-2.5">
                Updated Pages
              </h3>
              {loading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-base-content/50">Loading updates...</span>
                </div>
              ) : updatedPages.length === 0 ? (
                <p className="text-xs text-base-content/50 py-4">No pages updated yet.</p>
              ) : (
                <ul className="space-y-3">
                  {updatedPages.slice(0, 3).map((page, index) => (
                    <li key={`updated-page-${page.page_id || index}`}>
                      <Link
                        href={`/wiki/campus/${page.slug}`}
                        className="block text-xs font-semibold text-base-content/85 hover:text-primary transition-colors truncate"
                      >
                        {page.title || "Untitled"}
                      </Link>
                      <span className="text-[9px] text-base-content/50 font-semibold block">
                        Updated {getRelativeTime(page.updated_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => setShowAllUpdated(true)}
              className="btn btn-ghost btn-xs text-primary font-bold uppercase tracking-wider mt-4 text-left cursor-pointer"
            >
              View all edits
            </button>
          </div>

          {/* Card 6: Pending Pages */}
          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover flex flex-col justify-between h-full text-left">
            <div>
              <h3 className="text-sm font-black text-base-content font-serif mb-2.5">
                Pending Pages
              </h3>
              {loading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-base-content/50">Loading pending...</span>
                </div>
              ) : pendingPages.length === 0 ? (
                <p className="text-xs text-base-content/50 py-4">No pending pages awaiting review.</p>
              ) : (
                <ul className="space-y-3">
                  {pendingPages.slice(0, 3).map((pending, index) => {
                    const authorName = pending.users?.name || `User #${pending.editor_id}`;
                    return (
                      <li key={`pending-page-${pending.pending_id || index}`}>
                        <span className="block text-xs font-semibold text-base-content/85 truncate">
                          {pending.title}
                        </span>
                        <span className="text-[9px] text-base-content/50 font-semibold block">
                          Submitted by {authorName} · {getRelativeTime(pending.created_at)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <button
              onClick={() => setShowAllPending(true)}
              className="btn btn-primary btn-sm w-full font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all duration-150 active:scale-97 mt-4"
            >
              Review Pending Changes
            </button>
          </div>
        </div>

        {/* More campus cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2 items-stretch">
          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-base-content font-serif">Upcoming Events</h3>
              <span className="badge badge-primary badge-sm">This week</span>
            </div>
            <div className="mt-4 space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.title} className="rounded-xl border border-base-200 bg-base-50 p-3">
                  <p className="text-xs font-black text-base-content">{event.title}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-base-content/50 mt-1">{event.time}</p>
                  <p className="text-xs text-base-content/70 mt-1">{event.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-base-content font-serif">Popular Pages</h3>
              <span className="badge badge-secondary badge-sm">Trending</span>
            </div>
            <div className="mt-4 space-y-3">
              {popularPages.map((page) => (
                <Link key={page.title} href={page.href} className="flex items-center justify-between rounded-xl border border-base-200 bg-base-50 p-3 text-sm font-semibold text-base-content/80 hover:border-primary hover:text-primary">
                  <span>{page.title}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/50">{page.tag}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-base-content font-serif">Random Page</h3>
              <Compass className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs text-base-content/70 mt-4 leading-relaxed">Jump into a fresh article from the wiki and discover something new around campus.</p>
            <button type="button" onClick={handleRandomPage} className="btn btn-primary btn-sm mt-5 rounded-xl">
              Open a random page
            </button>
          </div>

          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-base-content font-serif">Today&apos;s Mess Menu</h3>
              <UtensilsCrossed className="h-4 w-4 text-success" />
            </div>
            <div className="mt-4 space-y-2">
              {messMenu.map((item) => (
                <div key={item} className="rounded-lg border border-base-200 bg-base-50 px-3 py-2 text-xs font-semibold text-base-content/80">{item}</div>
              ))}
            </div>
          </div>

          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-base-content font-serif">Campus Transport</h3>
              <Bus className="h-4 w-4 text-secondary" />
            </div>
            <div className="mt-4 space-y-2">
              {transportSchedule.map((item) => (
                <div key={item} className="rounded-lg border border-base-200 bg-base-50 px-3 py-2 text-xs font-semibold text-base-content/80">{item}</div>
              ))}
            </div>
          </div>

          <div className="card card-bordered bg-base-100 border-base-200 p-5 shadow-depth shadow-depth-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-base-content font-serif">Photo of the Week</h3>
              <Camera className="h-4 w-4 text-warning" />
            </div>
            <div className="diff aspect-[16/9] rounded-2xl overflow-hidden mt-4">
              <div className="diff-item-1">
                <img src="/homepage_bg.png" alt="Campus landscape" className="object-cover w-full h-full" />
              </div>
              <div className="diff-item-2">
                <img src="/iitgn_campus.png" alt="Campus architecture" className="object-cover w-full h-full" />
              </div>
              <div className="diff-resizer" />
            </div>
            <p className="text-xs text-base-content/70 mt-3 leading-relaxed">A fresh look at the campus skyline and the calm spaces that make the institute feel special.</p>
          </div>
        </div>

        {/* Statistics Footer Strip */}
        <div className="stats stats-vertical lg:stats-horizontal shadow-sm border border-base-200 bg-base-200/50 w-full mt-6">
          <div className="stat place-items-center">
            <div className="stat-figure text-primary"><BookOpen className="h-5 w-5" /></div>
            <div className="stat-title text-[9px] font-bold uppercase tracking-wider">Total Articles</div>
            <div className="stat-value text-lg">{totalPagesCount !== null ? totalPagesCount.toLocaleString() : "..."}</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-figure text-emerald-600"><Languages className="h-5 w-5" /></div>
            <div className="stat-title text-[9px] font-bold uppercase tracking-wider">Guide Categories</div>
            <div className="stat-value text-lg">{categoriesCount}</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-figure text-purple-600"><Users2 className="h-5 w-5" /></div>
            <div className="stat-title text-[9px] font-bold uppercase tracking-wider">Active Editors</div>
            <div className="stat-value text-lg">{editors.length || "..."}</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-figure text-amber-600"><Eye className="h-5 w-5" /></div>
            <div className="stat-title text-[9px] font-bold uppercase tracking-wider">Monthly Views</div>
            <div className="stat-value text-lg">{totalPagesCount !== null ? (totalPagesCount * 45).toLocaleString() + "+" : "..."}</div>
          </div>
        </div>

        {/* footer Credits */}
        <div className="pt-4 border-t border-base-200 bg-white flex md:hidden flex-col items-center text-center gap-1.5 select-none mt-6 w-full">
          <div className="text-[12px] text-base-content/50 font-medium flex items-center justify-center gap-1.5 uppercase tracking-wider">
            <span>Made with</span>
            <Heart
              onClick={spawnHearts}
              className="w-6 h-6 text-red-500 fill-red-500 cursor-pointer hover:scale-130 transition-transform duration-200 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.4)] animate-pulse shrink-0"
            />
          </div>
          <div className="text-[12px] text-base-content/50 font-semibold tracking-wide">
            by{" "}
            <span className="font-extrabold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-colors">
              Technical Council, IITGN
            </span>
          </div>
          <div className="text-[9px] font-bold text-base-content/50/60 tracking-widest uppercase mt-1">
            © {new Date().getFullYear()} IIT Gandhinagar
          </div>
        </div>
      </div>
    </>
  );
}
