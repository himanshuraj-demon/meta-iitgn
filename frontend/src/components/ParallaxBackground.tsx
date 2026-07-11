"use client";

import React from "react";

interface ParallaxBackgroundProps {
  mousePos?: { x: number; y: number };
  imageSrc: string;
  overlayClass?: string;
}

export default function ParallaxBackground({
  mousePos = { x: 0, y: 0 },
  imageSrc,
  overlayClass = "bg-linear-to-b via-slate-900/45 to-slate-950/65",
}: ParallaxBackgroundProps) {
  return (
    <>
      {/* Parallax Background Image */}
      <div
        className="absolute top-0 inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${imageSrc}')`,
          transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.15)`,
          transition: "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      />
      {/* Dark Wash Overlay */}
      <div className={`absolute inset-0 z-0 ${overlayClass}`} />
    </>
  );
}
