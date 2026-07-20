"use client";

import { useEffect, useMemo, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { applySectionFolding, makeHeadingId } from "@/lib/wikiFolding";

interface WikiArticleViewProps {
  contentMarkdown: string;
  enableFolding?: boolean;
  autoFold?: boolean;
}

// Lightweight, read-only renderer used as the progressive-enhancement fallback
// while the heavy Milkdown (Crepe) chunk downloads. It paints the article body
// statically (matching the look of the eventual reader surface) so the title and
// content appear together on first paint instead of popping in once the editor
// bundle arrives. Once Milkdown loads, it takes over this container.
export default function WikiArticleView({
  contentMarkdown,
  enableFolding = false,
  autoFold = false,
}: WikiArticleViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const html = useMemo(() => {
    const raw = marked.parse(contentMarkdown ?? "", { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [contentMarkdown]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Assign heading ids that match `parsed.toc` (see `makeHeadingId`) so the
    // Table of Contents can target the right element even during the brief
    // window before Milkdown takes over.
    const seenIds: Record<string, number> = {};
    const headings = Array.from(
      container.querySelectorAll("h2, h3")
    ) as HTMLElement[];
    for (const heading of headings) {
      const text = heading.textContent?.trim() ?? "";
      if (!heading.id) heading.id = makeHeadingId(text, seenIds);
    }

    // Collapsible H2/H3 sections — mirrors the Milkdown reader's folding.
    if (enableFolding) {
      applySectionFolding(container, autoFold);
    }
  }, [html, enableFolding, autoFold]);

  return (
    <div
      ref={containerRef}
      className="milkdown-container prose max-w-none transition-colors relative"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
