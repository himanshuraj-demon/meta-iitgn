"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ChevronDown, Check, User, Settings, LogOut, FileText } from "lucide-react";
import { PROFILE_MENU_ITEMS, TIERS } from "@/lib/constants";

interface NavbarProps {
  onToggleSidebar: () => void;
  currentTier?: string;
  onChangeTier?: (tier: string) => void;
}

export default function Navbar({ onToggleSidebar, currentTier, onChangeTier }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localTier, setLocalTier] = useState("gold");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeTier = currentTier || localTier;
  const setActiveTier = onChangeTier || setLocalTier;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/wiki?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/wiki");
    }
  };

  const getProfileIcon = (name: string) => {
    switch (name) {
      case "My Profile":
        return <User className="h-4 w-4 text-gray-500" />;
      case "My Contributions":
        return <FileText className="h-4 w-4 text-gray-500" />;
      case "Settings":
        return <Settings className="h-4 w-4 text-gray-500" />;
      case "Sign Out":
        return <LogOut className="h-4 w-4 text-rose-500" />;
      default:
        return null;
    }
  };

  return (
    <header className="h-16 border-b border-gray-150 flex items-center justify-between px-4 lg:px-6 shrink-0 bg-white sticky top-0 z-40 select-none">
      {/* Left side: Hamburger and Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-150 rounded-lg text-gray-600 transition-colors duration-200 cursor-pointer active:scale-95"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/" className="flex items-center gap-2 select-none cursor-pointer group">
          {/* Blue logo container */}
          <div className="w-12 h-12  text-white bg-blue-400 rounded-full flex items-center justify-center font-display font-black text-2xl  cursor-pointer hover:scale-115 transition-transform duration-300">
            mI
          </div>
          <div className="hidden sm:block">
              <span className="font-serif text-2xl font-extrabold tracking-tight  text-blue-500">
                META
              </span>
              <span className="ml-1 text-sm font-semibold uppercase tracking-wider text-gray-500">
                IITGN
              </span>
            </div>
        </Link>
      </div>

      {/* Middle: Search input */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg mx-8 relative items-center">
        <div className="relative w-full flex items-center h-10 bg-gray-50 border border-gray-200 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/50 rounded-full px-4 transition-all duration-200 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.03)]">
          <input
            type="text"
            placeholder="Search IITGN Wiki..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none pr-8 h-full"
          />
          <button
            type="submit"
            className="absolute right-4 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
            aria-label="Submit search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Right side: User avatar & dropdown */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 hover:bg-gray-50 border border-gray-150 hover:border-gray-250 py-1.5 px-3 rounded-full shadow-sm transition-all duration-200 cursor-pointer active:scale-97"
        >
          {/* Crimson circular badge for SA */}
          <div className="w-7 h-7 bg-[#EA4335] text-white font-bold text-xs rounded-full flex items-center justify-center shadow-inner">
            SA
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
            System
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu (Rich profile dropdown like original /wiki) */}
        {dropdownOpen && (
          <div className="absolute right-0 top-12 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Signed in as</p>
              <p className="text-sm font-bold text-gray-800 truncate">System Administrator</p>
              {(() => {
                const activeTierData = TIERS[activeTier as keyof typeof TIERS] || TIERS.gold;
                return (
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase ${activeTierData.gradient}`}>
                    {activeTierData.roleTitle}
                  </span>
                );
              })()}
            </div>

            {/* Section 1: Tier Selector (For testing purposes) */}
            <div className="px-4 py-1.5 border-b border-gray-50 bg-gray-50/50">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Simulate Role</p>
            </div>
            <div className="py-1 max-h-40 overflow-y-auto">
              {Object.keys(TIERS).map((tierKey) => {
                const t = TIERS[tierKey as keyof typeof TIERS];
                const isSelected = activeTier === tierKey;
                return (
                  <button
                    key={tierKey}
                    onClick={() => {
                      setActiveTier(tierKey);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-50 font-medium ${
                      isSelected ? "bg-slate-50 text-blue-600 font-bold" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>

            {/* Section 2: Account Tools */}
            <div className="px-4 py-1.5 border-t border-b border-gray-50 mt-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Account</p>
            </div>
            <div className="py-1">
              {PROFILE_MENU_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2 text-xs transition-colors duration-150 font-semibold ${
                    item.isDanger
                      ? "text-rose-600 hover:bg-rose-50/50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
                  onClick={() => setDropdownOpen(false)}
                >
                  {getProfileIcon(item.name)}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
