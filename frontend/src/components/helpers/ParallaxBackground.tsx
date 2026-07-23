"use client";

import React, { useState, useEffect, useRef } from "react";

interface ParallaxBackgroundProps {
  imageSrc: string;
  overlayClass?: string;
}

export default function ParallaxBackground({
  imageSrc,
  overlayClass = "bg-linear-to-b via-slate-900/45 to-slate-950/65",
}: ParallaxBackgroundProps) {
  const [isMobile, setIsMobile] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const hasNoHover = window.matchMedia("(hover: none)").matches;
      setIsMobile(hasNoHover || window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    let rafId: number;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate target translation based on cursor position relative to center
      targetX = (e.clientX / window.innerWidth - 0.5) * 45;
      targetY = (e.clientY / window.innerHeight - 0.5) * 45;
    };

    const updatePosition = () => {
      // Linear interpolation (lerp) for buttery smooth motion
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) scale(1.15)`;
      }
      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  return (
    <>
      <style>{`
        @keyframes mobileParallax {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1.15);
          }
          25% {
            transform: translate3d(12px, -8px, 0) scale(1.15);
          }
          50% {
            transform: translate3d(-8px, 12px, 0) scale(1.15);
          }
          75% {
            transform: translate3d(-12px, -12px, 0) scale(1.15);
          }
        }
        .animate-mobile-parallax {
          animation: mobileParallax 18s ease-in-out infinite;
        }
      `}</style>
      {/* Parallax Background Image */}
      <div
        ref={bgRef}
        className={`absolute top-0 inset-0 bg-cover bg-center bg-no-repeat will-change-transform ${
          isMobile ? "animate-mobile-parallax" : ""
        }`}
        style={{
          backgroundImage: `url('${imageSrc}')`,
          transform: isMobile ? undefined : "translate3d(0, 0, 0) scale(1.15)",
        }}
      />
      {/* Dark Wash Overlay */}
      <div className={`absolute inset-0 z-0 ${overlayClass}`} />
    </>
  );
}
