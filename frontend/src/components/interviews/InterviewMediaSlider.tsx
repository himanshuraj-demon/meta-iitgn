"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface InterviewMediaSliderProps {
  media: string[];
}

export default function InterviewMediaSlider({ media }: InterviewMediaSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!media || media.length === 0) return null;

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black/5 dark:bg-black/40 border border-base-200 shadow-inner group my-2">
      {/* Slide Container */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {media.map((url, idx) => (
            <div
              key={idx}
              className="relative h-full w-full flex-shrink-0 cursor-pointer overflow-hidden flex items-center justify-center bg-base-300/20"
              onClick={() => setFullscreenImage(url)}
            >
              <img
                src={url}
                alt={`Post image ${idx + 1}`}
                className="h-full w-full object-fit transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen view trigger button */}
      <button
        onClick={() => setFullscreenImage(media[currentIndex])}
        className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
        title="Enlarge Image"
      >
        <Maximize2 className="h-4 w-4" />
      </button>

      {/* Prev / Next Controls (only if > 1 image) */}
      {media.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-base-100/90 text-base-content shadow-lg backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-base-100/90 text-base-content shadow-lg backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md">
            {media.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? "w-5 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Fullscreen Modal View */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2  animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-20 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={fullscreenImage}
            alt="Enlarged media view"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl md:p-10"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
