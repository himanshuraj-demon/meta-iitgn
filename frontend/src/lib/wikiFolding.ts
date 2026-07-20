// Shared helpers for the wiki article reader: heading-id generation (so the
// Table of Contents can target the right element) and reader-only section
// folding (collapsible H2/H3 regions). Kept in one place so the lightweight
// read-only renderer and the Milkdown editor agree on the same markup.

// Heading levels that begin a foldable section in the reader.
const FOLDABLE_TAGS = new Set(["H2", "H3"]);

const FOLD_TOGGLE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';

/**
 * Slugifies a heading's text into a stable, unique id, mirroring the algorithm
 * `parseMarkdown` uses to build `parsed.toc` ids. `seen` must be shared across
 * all headings of a single render so duplicates get a `-N` suffix in order.
 */
export function makeHeadingId(text: string, seen: Record<string, number>): string {
  let baseId = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!baseId) baseId = "heading";
  if (seen[baseId] === undefined) {
    seen[baseId] = 0;
    return baseId;
  } else {
    seen[baseId]++;
    return `${baseId}-${seen[baseId]}`;
  }
}

/**
 * Groups the top-level blocks of a read-only article into collapsible sections:
 * each H2/H3 heading becomes the handle for the content that follows it (up to
 * the next foldable heading). Idempotent — guarded by a data attribute so it
 * can safely re-run. `container` is the element whose direct children are the
 * block-level nodes (the `.ProseMirror` surface in Milkdown, or the
 * `.milkdown-container` itself for the static renderer).
 */
export function applySectionFolding(container: HTMLElement, startCollapsed = false) {
  if (container.dataset.folded === "true") return;

  const children = Array.from(container.children) as HTMLElement[];
  const pre: HTMLElement[] = [];
  const sections: { heading: HTMLElement; body: HTMLElement[] }[] = [];

  for (const child of children) {
    if (FOLDABLE_TAGS.has(child.tagName)) {
      sections.push({ heading: child, body: [] });
    } else if (sections.length === 0) {
      pre.push(child);
    } else {
      sections[sections.length - 1].body.push(child);
    }
  }

  // Nothing to fold (e.g. a short article with no sub-headings) — leave the
  // DOM untouched and don't mark as folded so a later render can still fold.
  if (sections.length === 0) return;

  // Detach current top-level nodes, then re-append them wrapped in fold markup.
  // Node references stay valid after innerHTML="" so we can re-insert them.
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const node of pre) fragment.appendChild(node);

  for (const sec of sections) {
    const wrap = document.createElement("div");
    wrap.className = "wiki-fold";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "wiki-fold-toggle";
    toggle.setAttribute("aria-label", "Collapse section");
    toggle.setAttribute("aria-expanded", "true");
    toggle.innerHTML = FOLD_TOGGLE_SVG;

    sec.heading.classList.add("wiki-fold-title");
    sec.heading.prepend(toggle);

    const body = document.createElement("div");
    body.className = "wiki-fold-body";
    for (const node of sec.body) body.appendChild(node);

    wrap.appendChild(sec.heading);
    wrap.appendChild(body);

    // Toggle the section on click of the heading (the chevron is a child, so it
    // is covered via bubbling). Links inside a heading are left alone so they
    // still navigate.
    const toggleSection = (e: Event) => {
      if ((e.target as HTMLElement)?.closest("a")) return;
      e.preventDefault();
      e.stopPropagation();
      const collapsed = wrap.classList.toggle("collapsed");
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      toggle.setAttribute(
        "aria-label",
        collapsed ? "Expand section" : "Collapse section"
      );
    };

    // Stop mousedown/pointerdown from reaching the editor / selecting text when
    // collapsing; links are exempt so they keep navigating.
    const blockDefault = (e: Event) => {
      if ((e.target as HTMLElement)?.closest("a")) return;
      e.stopPropagation();
      e.preventDefault();
    };
    sec.heading.addEventListener("mousedown", blockDefault);
    sec.heading.addEventListener("pointerdown", blockDefault);
    sec.heading.addEventListener("click", toggleSection);

    // "Auto fold" starts every section collapsed.
    if (startCollapsed) {
      wrap.classList.add("collapsed");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Expand section");
    }

    fragment.appendChild(wrap);
  }

  container.appendChild(fragment);
  container.dataset.folded = "true";
}
