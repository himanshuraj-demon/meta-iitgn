"use client";

import { useState } from "react";
import Navbar from "@/components/navs/Navbar";
import Sidebar from "@/components/navs/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import ProfileContent from "@/components/helpers/ProfileContent";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeTier } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-base-200/30 font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentTier={activeTier} />
        <main className="min-w-0 flex-1 px-4 py-6 pb-16 sm:px-6 lg:px-10">
          <ProfileContent />
        </main>
      </div>
    </div>
  );
}
