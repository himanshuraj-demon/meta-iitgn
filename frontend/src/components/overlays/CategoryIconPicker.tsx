"use client";

import { useState } from "react";
import { X, Search as SearchIcon } from "lucide-react";
import { EmojiPicker } from "frimousse";
import {
  CATEGORY_ICON_SET,
  CATEGORY_ICON_KEYS,
  CATEGORY_COLORS,
  DEFAULT_ICON,
  DEFAULT_COLOR,
  isEmojiIcon,
} from "@/lib/categoryIcon";

type Tab = "icon" | "emoji";

interface CategoryIconPickerProps {
  currentIcon: string;
  currentColor: string;
  onSave: (icon: string, color: string) => Promise<void> | void;
  onClose: () => void;
}

// Popover for choosing a category's icon: either a Lucide icon + color, or an
// emoji + color. Selection updates a local preview; Save persists via onSave.
export default function CategoryIconPicker({
  currentIcon,
  currentColor,
  onSave,
  onClose,
}: CategoryIconPickerProps) {
  const [tab, setTab] = useState<Tab>(isEmojiIcon(currentIcon) ? "emoji" : "icon");
  const [selectedIcon, setSelectedIcon] = useState(currentIcon || DEFAULT_ICON);
  const [selectedColor, setSelectedColor] = useState(currentColor || DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedIcon, selectedColor);
      onClose();
    } catch (err) {
      console.error("Failed to save category icon:", err);
    } finally {
      setSaving(false);
    }
  };

  const iconIsEmoji = isEmojiIcon(selectedIcon);

  return (
    <>
      {/* Backdrop closes the popover on outside click */}
      <div className="fixed inset-0 z-[20500]" onClick={onClose} />

      <div className="absolute left-0 top-full mt-2 z-[20501] w-80 max-w-[calc(100vw-2rem)] bg-base-100 border border-base-200 rounded-2xl shadow-xl animate-in zoom-in-95 duration-150 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-base-content">Set Icon</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-error/10 rounded-lg transition-colors cursor-pointer text-red-400 hover:text-red-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Icon / Emoji toggle */}
        <div className="flex gap-1 p-1 bg-base-200 rounded-xl">
          {(["icon", "emoji"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                tab === t
                  ? "bg-base-100 text-primary shadow-sm"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              {t === "icon" ? "Icon" : "Emoji"}
            </button>
          ))}
        </div>

        {/* Lucide icon grid */}
        {tab === "icon" && (
          <div className="grid grid-cols-6 gap-2 max-h-52 overflow-y-auto">
            {CATEGORY_ICON_KEYS.map((key) => {
              const Icon = CATEGORY_ICON_SET[key];
              const selected = !iconIsEmoji && selectedIcon === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedIcon(key)}
                  className={`p-2 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
                    selected
                      ? "bg-primary border-primary text-primary-content shadow-md shadow-primary/20"
                      : "bg-base-100 border-base-300 text-base-content/70 hover:text-base-content"
                  }`}
                  title={key}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        )}

        {/* Emoji picker */}
        {tab === "emoji" && (
          <EmojiPicker.Root
            columns={8}
            className="flex flex-col [&_*]:outline-none"
            onEmojiSelect={(e) => setSelectedIcon(e.emoji)}
          >
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-base-content/40 pointer-events-none" />
              <EmojiPicker.Search
                autoFocus
                placeholder="Search emoji…"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-base-300 bg-base-100 text-base-content placeholder-base-content/40 focus:border-primary focus:outline-none"
              />
            </div>

            <EmojiPicker.Viewport className="h-64 overflow-y-auto rounded-lg">
              <EmojiPicker.Loading className="flex items-center justify-center h-full text-xs text-base-content/50">
                Loading emojis…
              </EmojiPicker.Loading>
              <EmojiPicker.Empty className="flex items-center justify-center h-full text-xs text-base-content/50">
                No emoji found.
              </EmojiPicker.Empty>
              <EmojiPicker.List
                className="flex flex-col"
                components={{
                  CategoryHeader: ({ category }) => (
                    <div className="sticky top-0 z-10 px-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-base-content/50 bg-base-100/95 backdrop-blur">
                      {category.label}
                    </div>
                  ),
                  Row: ({ children }) => <div className="flex gap-0.5">{children}</div>,
                  Emoji: ({ emoji, ...props }) => {
                    const selected = emoji.emoji === selectedIcon;
                    return (
                      <button
                        {...props}
                        className={`flex-1 aspect-square flex items-center justify-center rounded-lg text-xl leading-none transition-all duration-150 cursor-pointer hover:bg-primary/10 hover:scale-105 active:scale-95 ${
                          selected ? "bg-primary/15 ring-1 ring-primary" : ""
                        } ${emoji.isActive ? "bg-primary/10" : ""}`}
                      >
                        {emoji.emoji}
                      </button>
                    );
                  },
                }}
              />
            </EmojiPicker.Viewport>
          </EmojiPicker.Root>
        )}

        {/* Color row */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-base-content/60 uppercase">Color</span>
          <div className="grid grid-cols-8 gap-2">
            {CATEGORY_COLORS.map((c) => {
              const selected = selectedColor.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`relative w-7 h-7 rounded-full border-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                    selected
                      ? "border-base-content scale-110 shadow-md"
                      : "border-base-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                  aria-label={`Select color ${c}`}
                />
              );
            })}
          </div>
        </div>

        {/* Preview + Save */}
        <div className="flex items-center justify-between pt-1 border-t border-base-200">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-base-content/50 uppercase">Preview</span>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: `${selectedColor}1a`,
                borderColor: `${selectedColor}33`,
                color: selectedColor,
              }}
            >
              {iconIsEmoji ? (
                <span className="text-lg leading-none">{selectedIcon}</span>
              ) : (
                (() => {
                  const Icon = CATEGORY_ICON_SET[selectedIcon] || CATEGORY_ICON_SET[DEFAULT_ICON];
                  return <Icon className="h-5 w-5" />;
                })()
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary btn-sm text-primary-content"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}
