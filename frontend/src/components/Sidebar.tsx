"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Shuffle,
  Building2,
  Users2,
  BookOpen,
  FlaskConical,
  Tent,
  MapPin,
  Trophy,
  Sparkles,
  Calendar,
  Shield,
  TrendingUp,
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { SIDEBAR_SECTIONS } from "@/lib/constants";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Local map for statically imported icons to avoid wildcard imports
const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Shuffle,
  Building2,
  Users2,
  BookOpen,
  FlaskConical,
  Tent,
  MapPin,
  Trophy,
  Sparkles,
  Calendar,
  Shield,
  TrendingUp,
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Helper to render Lucide icons dynamically from their string names
  const renderIcon = (iconName: string, isActive: boolean) => {
    const IconComponent = ICON_MAP[iconName] || HelpCircle;
    
    return (
      <IconComponent 
        className={`h-5 w-5 transition-colors duration-200 ${
          isActive 
            ? "text-blue-600" 
            : "text-gray-400 group-hover:text-gray-600"
        }`} 
      />
    );
  };

  return (
    <>
      {/* Mobile Backdrop overlay - only visible on small screens when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 lg:static z-50 flex flex-col h-full bg-white border-r border-gray-150 transition-all duration-300 ease-in-out shrink-0 select-none overflow-hidden ${
          isOpen 
            ? "w-64 translate-x-0" 
            : "w-0 -translate-x-full lg:w-0 lg:translate-x-0 lg:border-r-0"
        }`}
      >
        {/* Navigation list area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1.5">
              {/* Section Header */}
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                {section.title}
              </h3>
              
              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.path;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => {
                        // Close sidebar on mobile after clicking a link
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      className={`group flex items-center gap-3 px-3 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {renderIcon(item.iconName, isActive)}
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] font-semibold text-gray-400">
            © {new Date().getFullYear()} IIT Gandhinagar
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Community maintained
          </p>
        </div>
      </aside>
    </>
  );
}
