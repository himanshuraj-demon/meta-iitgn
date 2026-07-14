"use client";

import React from "react";

export default function WikiSkeleton() {
  return (
    <div className="flex flex-1 h-full mt-2 w-full overflow-hidden animate-pulse">
      {/* Main Content Area */}
      <main className="flex-1 min-w-full lg:min-w-0 px-4 md:px-8 pt-20 pb-28 overflow-y-auto bg-base-100 relative text-base-content no-scrollbar">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          {/* Breadcrumbs Skeleton */}
          <div className="h-4 bg-base-300 rounded w-1/4 mb-4" />

          {/* Title Skeleton */}
          <div className="h-10 bg-base-300 rounded w-3/4 mb-8" />

          {/* Article Paragraphs Skeletons */}
          <div className="space-y-4">
            <div className="h-4 bg-base-300 rounded w-full" />
            <div className="h-4 bg-base-300 rounded w-11/12" />
            <div className="h-4 bg-base-300 rounded w-4/5" />
            <div className="h-4 bg-base-300 rounded w-full" />
            <div className="h-4 bg-base-300 rounded w-5/6" />
          </div>

          <div className="h-px bg-base-200 my-8" />

          <div className="space-y-4">
            <div className="h-6 bg-base-300 rounded w-1/3 mb-4" />
            <div className="h-4 bg-base-300 rounded w-full" />
            <div className="h-4 bg-base-300 rounded w-11/12" />
            <div className="h-4 bg-base-300 rounded w-3/4" />
          </div>
        </div>
      </main>

      {/* InfoBox (Right Sidebar) Skeleton */}
      <aside className="hidden lg:flex border-l border-base-200 w-80 shrink-0 flex-col bg-base-100 p-6 space-y-6">
        {/* Aspect Ratio Box Image Placeholder */}
        <div className="w-full aspect-square bg-base-300 rounded-2xl" />

        {/* Short Description */}
        <div className="space-y-2">
          <div className="h-3 bg-base-300 rounded w-full" />
          <div className="h-3 bg-base-300 rounded w-5/6" />
        </div>

        {/* Key Info Table rows */}
        <div className="space-y-4 pt-4 border-t border-base-200">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-3 bg-base-300 rounded w-1/3" />
              <div className="h-3 bg-base-300 rounded w-1/2" />
            </div>
          ))}
        </div>

        {/* Table of Contents */}
        <div className="space-y-3 pt-6 border-t border-base-200">
          <div className="h-3.5 bg-base-300 rounded w-1/2 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 bg-base-300 rounded w-2/3" />
          ))}
        </div>
      </aside>
    </div>
  );
}
