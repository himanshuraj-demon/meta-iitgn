"use client";

import React, { useState, useEffect } from "react";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const hasNoHover = window.matchMedia("(hover: none)").matches;
      setIsMobile(hasNoHover || window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <style>{`
        @keyframes mobileParallax {
          0%, 100% {
            transform: translate(0px, 0px) scale(1.15);
          }
          25% {
            transform: translate(12px, -8px) scale(1.15);
          }
          50% {
            transform: translate(-8px, 12px) scale(1.15);
          }
          75% {
            transform: translate(-12px, -12px) scale(1.15);
          }
        }
        .animate-mobile-parallax {
          animation: mobileParallax 18s ease-in-out infinite;
        }
      `}</style>
      {/* Parallax Background Image */}
      <div
        className={`absolute top-0 inset-0 bg-cover bg-center bg-no-repeat ${isMobile ? "animate-mobile-parallax" : ""}`}
        style={
          isMobile
            ? { backgroundImage: `url('${imageSrc}')` }
            : {
                backgroundImage: `url('${imageSrc}')`,
                transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.15)`,
                transition: "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)",
              }
        }
      />
      {/* Dark Wash Overlay */}
      <div className={`absolute inset-0 z-0 ${overlayClass}`} />
    </>
  );
}
