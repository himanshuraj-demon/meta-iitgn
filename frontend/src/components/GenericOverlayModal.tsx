"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface GenericOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  headerColorClass?: string;
  children: React.ReactNode;
}

export default function GenericOverlayModal({
  isOpen,
  onClose,
  title,
  headerColorClass = "text-primary bg-base-200",
  children,
}: GenericOverlayModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    startPos: { x: number; y: number };
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPos: { x: 0, y: 0 },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth < 640) return;
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest("a")
    ) {
      return;
    }
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...position },
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.startPos.x + deltaX,
      y: dragRef.current.startPos.y + deltaY,
    });
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[20000] flex min-h-screen items-center justify-center bg-transparent pointer-events-none overflow-hidden font-sans p-0 sm:p-4">
      {/* Dialog Card - matching SettingsModal aesthetics and draggable header */}
      <div
        style={
          isMounted && window.innerWidth >= 640
            ? { transform: `translate(${position.x}px, ${position.y}px)` }
            : undefined
        }
        className="relative box-border flex flex-col h-full w-full max-w-4xl shrink-0 grow-0 overflow-hidden rounded-none border-0 bg-base-100 shadow-xl pointer-events-auto sm:h-[min(640px,calc(100vh-2rem))] sm:min-h-0 sm:max-h-[calc(100vh-2rem)] sm:rounded-lg sm:border sm:border-base-200"
      >
        {/* Unified Draggable Header */}
        <div
          onMouseDown={handleMouseDown}
          className={`flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-base-200 cursor-move select-none shrink-0 ${headerColorClass}`}
        >
          <span className="font-bold text-sm tracking-tight">{title}</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-base-300 rounded-lg transition-colors cursor-pointer text-base-content/70 hover:text-base-content"
            aria-label="Close"
          >
            <X className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-base-100 flex flex-col p-6 w-full text-base-content select-text">
          {children}
        </div>
      </div>
    </div>
  );
}
