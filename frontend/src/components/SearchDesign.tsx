"use client";

import React from "react";
import { Search } from "lucide-react";

// --- BeautifulSearchBox Props ---
interface BeautifulSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  variant?: "default" | "compact";
  autoFocus?: boolean;
}

export function BeautifulSearchBox({
  value,
  onChange,
  onSubmit,
  placeholder = "Find...",
  variant = "default",
  autoFocus = false,
}: BeautifulSearchBoxProps) {
  const isCompact = variant === "compact";

  return (
    <div className={`relative w-full mx-auto select-none ${isCompact ? "py-1" : "py-4 px-2"}`}>
      {/* Elevated input container with balanced border and centered omnidirectional shadow */}
      <form
        onSubmit={onSubmit}
        className={`relative z-10 w-full flex items-center bg-white backdrop-blur-md border border-slate-100 focus-within:bg-white focus-within:border-blue-400/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300 shadow-[0_0_36px_rgba(0,0,0,0.10)] hover:shadow-[0_0_48px_rgba(0,0,0,0.15)] ${
          isCompact ? "h-11 rounded-full px-4" : "h-16 rounded-3xl px-6"
        }`}
      >
        <Search className={`${isCompact ? "h-4.5 w-4.5" : "h-6 w-6"} text-slate-400 shrink-0 mr-2.5`} />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-transparent focus:outline-none h-full font-medium text-slate-800 placeholder-slate-400 ${
            isCompact ? "text-xs md:text-sm" : "text-lg"
          }`}
          autoFocus={autoFocus}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className={`text-slate-500 hover:text-slate-800 font-bold transition-all cursor-pointer mr-1 active:scale-95 ${
              isCompact ? "text-[10px] px-2 py-1 bg-slate-200/50 hover:bg-slate-200/80 rounded-lg" : "text-xs px-3 py-1.5 bg-slate-250/60 hover:bg-slate-250/90 rounded-xl"
            }`}
          >
            Clear
          </button>
        )}
      </form>
    </div>
  );
}

// --- BeautifulTabBar Props ---
interface BeautifulTabBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categoryIconMap?: Record<string, React.ComponentType<{ className?: string }>>;
}

export function BeautifulTabBar({
  categories,
  activeCategory,
  onCategoryChange,
  categoryIconMap,
}: BeautifulTabBarProps) {
  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 py-2 select-none">
      {/* Elevated tab container with balanced border and centered omnidirectional shadow */}
      <div className="flex gap-2 overflow-x-auto p-2 bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl scrollbar-none shadow-[0_0_28px_rgba(0,0,0,0.08)]">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          const Icon = categoryIconMap?.[cat];

          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border border-transparent transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-lg transform scale-[1.02]"
                  : "bg-slate-100/60 text-slate-655 hover:bg-slate-150/80 hover:text-slate-850"
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-450" : "text-slate-400"}`} />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
