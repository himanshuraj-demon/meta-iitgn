"use client";

import React from "react";

export interface MasonryCardConfig {
  id: string;
  colSpan?: number;
  rowSpan?: number;
  content: React.ReactNode;
}

interface HomeMasonryGridProps {
  cards: MasonryCardConfig[];
  storageKey?: string;
  reorderEnabled?: boolean;
}

export default function HomeMasonryGrid({
  cards,
}: HomeMasonryGridProps) {
  // Separate cards into categories based on user requirements:
  // 1. Featured Article (covers full width, square on mobile, wide aspect on desktop)
  const featuredCard = cards.find((c) => c.id === "featured-article");

  // 2. Bottom horizontal banner cards (Pending changes & Quick stats)
  const bottomCards = cards.filter(
    (c) => c.id === "pending-pages" || c.id === "quick-stats"
  );

  // 3. Middle cards (3x2 grid on large screens, stacked squares on mobile)
  const otherCards = cards.filter(
    (c) =>
      c.id !== "featured-article" &&
      c.id !== "pending-pages" &&
      c.id !== "quick-stats"
  );

  return (
    <div className="w-full flex flex-col gap-6 mt-4">
      {/* Featured Card */}
      {featuredCard && (
        <div className="w-full aspect-square md:h-[450px] lg:h-[700px]  overflow-hidden">
          <div className="w-full h-full flex flex-col [&>div]:h-full">
            {featuredCard.content}
          </div>
        </div>
      )}

      {/* Middle Cards: 3x2 Grid on Large Devices, Stacked Squares on Mobile */}
      {otherCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {otherCards.map((card) => (
            <div
              key={card.id}
              className="w-full aspect-square rounded-2xl  overflow-hidden  card-hover"
            >
              <div className="w-full h-full flex flex-col [&>div]:h-full">
                {card.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Banner Cards: Full Width, Small Height on Laptop & Mobile */}
      {bottomCards.length > 0 && (
        <div className="flex flex-col gap-6">
          {bottomCards.map((card) => {
            const isStats = card.id === "quick-stats";
            return (
              <div
                key={card.id}
                className={`w-full overflow-hidden  ${
                  isStats
                    ? "min-h-[9.5rem] md:h-36"
                    : "min-h-[7.5rem] md:h-36"
                }`}
              >
                <div className="w-full h-full flex flex-col [&>div]:h-full">
                  {card.content}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}