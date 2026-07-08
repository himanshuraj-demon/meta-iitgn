"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users2,
  BookOpen,
  Trophy,
  Tent,
  MapPin,
  FlaskConical,
  Sparkles,
  Search,
  Award,
  ArrowRight,
  FileText,
  History,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { QUICK_PORTALS } from "@/lib/constants";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Collapsed by default
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/wiki?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/wiki");
    }
  };

  // Local map for statically imported icons to avoid wildcard imports
  const PORTAL_ICON_MAP: Record<string, LucideIcon> = {
    Building2,
    Users2,
    BookOpen,
    Trophy,
    Tent,
    MapPin,
    FlaskConical,
    Sparkles,
  };

  // Dynamic Lucide icon helper
  const renderPortalIcon = (
    iconName: string,
    colorTheme: { bg: string; icon: string }
  ) => {
    const IconComponent = PORTAL_ICON_MAP[iconName] || HelpCircle;

    return (
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorTheme.bg}`}
      >
        <IconComponent className={`h-5 w-5 ${colorTheme.icon}`} />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50/30 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Container */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 bg-[#FCFCFD]">
          <div className="max-w-5xl mx-auto w-full space-y-12">
            {/* 1. Logo & Main Brand Title */}
            <div className="flex flex-col items-center justify-center text-center mt-4">
              {/* Large blue W logo with premium styling */}
              <div className="w-24 h-24  text-white bg-blue-400 rounded-full flex items-center justify-center font-display font-black text-5xl  cursor-pointer">
                mI
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 tracking-tight">
                META IIT Gandhinagar
              </h1>
              <p className="text-sm font-sans font-semibold text-gray-400 mt-2 tracking-wider uppercase">
                The community maintained encyclopedia for IIT Gandhinagar
              </p>
            </div>

            {/* 2. Large Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto relative flex items-center"
            >
              <div className="w-full flex items-center h-14 bg-white border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100/50 rounded-full px-6 transition-all duration-200">
                <input
                  type="text"
                  placeholder="Search departments, courses, faculty, hostels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-base text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none pr-14 h-full"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-[#1E40AF] hover:bg-blue-800 text-white rounded-full flex items-center justify-center absolute right-2 transition-all duration-200 cursor-pointer active:scale-95 shadow"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-white" />
                </button>
              </div>
            </form>

            {/* 3. Quick Portals Grid */}
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
                Quick Portals
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {QUICK_PORTALS.map((portal) => (
                  <Link
                    key={portal.name}
                    href={portal.path}
                    className={`flex items-center gap-4 p-4 rounded-xl border border-gray-150 bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group`}
                  >
                    {renderPortalIcon(portal.iconName, portal.colorTheme)}
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors duration-200">
                      {portal.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 4. Bottom Grid: Featured Article & Wiki Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              {/* Featured Article - Column span 2 */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
                    Featured Article
                  </h2>
                  {/* Special Feature Gold Badge */}
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 font-sans font-bold text-[11px] rounded-full uppercase tracking-wider">
                    <Award className="h-3.5 w-3.5" />
                    Special Feature
                  </span>
                </div>

                <div className="p-6 rounded-xl border border-gray-150 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-55">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-800 font-serif">
                      IIT Gandhinagar Campus Design & Architecture
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">
                      An overview of the unique climate-resilient architecture,
                      passive cooling design, and ecological corridors that make
                      up the greenest campus in India. Known for its 5-star
                      GRIHA LD rating, the campus blends cutting-edge civil
                      engineering with natural contours.
                    </p>
                  </div>
                  <Link
                    href="/wiki"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors uppercase tracking-wider flex items-center gap-1 mt-4"
                  >
                    Read Article <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Wiki Statistics - Column span 1 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
                  Wiki Statistics
                </h2>

                <div className="p-6 rounded-xl border border-gray-150 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4 h-55 flex flex-col justify-center">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-600">
                        Total Articles
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      1,248
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-gray-600">
                        Total Edits
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      14,832
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-600">
                        Active Contributors
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">184</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
