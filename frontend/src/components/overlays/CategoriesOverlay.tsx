"use client";

import { useState, useMemo, useCallback, type CSSProperties, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import {
  GripVertical,
  SquarePen,
  Check,
  Search,
  X,
  Pencil,
  Pin,
  PlusCircle,
  Loader2,
  FolderOpen,
  SearchX,
  LayoutGrid,
} from "lucide-react";
import { CategoryIcon } from "@/lib/categoryIcon";
import { useAuth } from "@/hooks/useAuth";
import { useHomeStore } from "@/store/useHomeStore";
import { Category } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { apiService } from "@/api";
import GenericOverlayModal from "@/components/overlays/GenericOverlayModal";
import CategoryEditModal from "@/components/overlays/CategoryEditModal";
import CategoryCreateForm from "@/components/overlays/CategoryCreateForm";

interface CategoriesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Blend a category's hex colour with transparent at the given percentage so the
// tint follows any theme and works for every colour format (unlike the old
// `${color}1a` hex-append trick, which only worked for 6-digit hex).
const colorTint = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

const DEFAULT_COLOR = "#4f46e5";
const MAX_PINS = 10;

/** A sub-category chip. When management is enabled (and we're not selecting or
 * renaming), it gains a drag handle so it can be reparented onto a top-level
 * card. In selection mode the chip becomes a checkbox that toggles membership. */
function SubChip({
  child,
  color,
  draggable,
  selectionMode,
  selected,
  onOpen,
  onToggleSelect,
}: {
  child: Category;
  color: string;
  draggable: boolean;
  selectionMode: boolean;
  selected: boolean;
  onOpen: (slug: string) => void;
  onToggleSelect: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `cat-${child.category_id}`,
    data: { categoryId: child.category_id, parentId: child.parent_id },
    disabled: !draggable,
  });

  const selectionBox = (
    <span
      className={`inline-flex w-5 h-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
        selected
          ? "bg-primary border-primary text-primary-content"
          : "border-base-300 bg-base-100 text-transparent"
      }`}
    >
      <Check className="h-3.5 w-3.5" />
    </span>
  );

  if (selectionMode) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(child.category_id);
        }}
        className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1.5 rounded-lg border bg-base-100 transition-colors cursor-pointer"
        style={{ borderColor: selected ? color : undefined }}
        title={`Toggle ${child.name}`}
      >
        {selectionBox}
        <span className="text-xs font-semibold text-base-content/80 truncate">{child.name}</span>
      </button>
    );
  }

  return (
    <span
      ref={setNodeRef}
      className={`group/chip inline-flex items-center gap-1.5 max-w-full rounded-lg border border-base-200 bg-base-100 hover:border-primary hover:bg-base-200 transition-all duration-150 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {draggable && (
        <button
          type="button"
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          className="p-1 cursor-grab active:cursor-grabbing text-base-content/30 hover:text-primary touch-none rounded-l-lg"
          title={`Drag to move "${child.name}" under another category`}
          aria-label={`Reparent ${child.name}`}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(child.slug);
        }}
        className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1.5 rounded-r-lg transition-colors cursor-pointer"
        title={`Open ${child.name}`}
      >
        <span
          className="w-5 h-5 shrink-0 rounded-md border flex items-center justify-center"
          style={{
            backgroundColor: colorTint(color, 12),
            borderColor: colorTint(color, 30),
            color,
          }}
        >
          <CategoryIcon icon={child.icon} size={12} />
        </span>
        <span className="text-xs font-semibold text-base-content/80 truncate group-hover/chip:text-primary transition-colors duration-150">
          {child.name}
        </span>
        {child.total_articles > 0 && (
          <span
            className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: colorTint(color, 12), color }}
          >
            {child.total_articles}
          </span>
        )}
      </button>
    </span>
  );
}

/**
 * Wraps a top-level card in a droppable so sub-category chips can be dropped
 * onto it. Defined at module scope (not inside the overlay component) so it is
 * not re-created on every render — re-creating it would remount the node and
 * detach dnd-kit's drop ref mid-drag. `render` draws the actual card and
 * receives the droppable ref + hover state.
 */
function DroppableCard({
  cat,
  childCats,
  dragEnabled,
  render,
}: {
  cat: Category;
  childCats?: Category[];
  dragEnabled: boolean;
  render: (
    cat: Category,
    childCats?: Category[],
    opts?: { droppableRef?: (node: HTMLElement | null) => void; isOver?: boolean }
  ) => ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cat-${cat.category_id}`,
    disabled: !dragEnabled,
  });
  return <>{render(cat, childCats, { droppableRef: setNodeRef, isOver })}</>;
}

/**
 * "All Categories" browser, surfaced as a modal instead of a dedicated route.
 * Mirrors the former /wiki/categories page: top-level category grid (click opens
 * the matching Quick Portal modal), search (across every category, surfacing
 * subcategories with their parent label), pin/unpin to Quick Portals, edit, and
 * the inline Create Category form — all preserved here as modal content.
 *
 * Overhauled layout:
 *  - Browse mode groups categories by the parent/child hierarchy. Each top-level
 *    category card lists its sub-categories as inline chips, so the tree is
 *    visible at a glance instead of only via search.
 *  - Pinned categories are pulled into a dedicated "Pinned to Quick Portal"
 *    strip at the top of the browse view.
 *  - Search mode flattens back to a single matched grid (sub-categories show
 *    their parent label), preserving the previous behaviour.
 *
 * Management features (admin / moderator only):
 *  - Drag a sub-category chip onto a top-level card to reparent it.
 *  - "Select" mode toggles checkboxes for bulk pin / unpin (respecting the 10-pin cap).
 *  - Inline rename via the title (double-click) or the rename action.
 *  - Create a sub-category directly inside a top-level card via its "+" action.
 */
export default function CategoriesOverlay({ isOpen, onClose }: CategoriesOverlayProps) {
  const { user, categories, updateCategoryState } = useAuth();
  const { setActiveOverlay, setActivePortalCategory } = useHomeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [pinningCategoryId, setPinningCategoryId] = useState<number | null>(null);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);

  // Bulk-select mode for pinning many categories at once.
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Inline rename: which card is being renamed and its in-progress value.
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // "Create sub-category inside" panel: the parent id whose form is open.
  const [addSubParentId, setAddSubParentId] = useState<number | null>(null);

  const canManageCategory = user?.role === "admin" || user?.role === "moderator";

  // Quick lookup of category_id -> name for rendering a subcategory's parent.
  const nameById = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((c) => map.set(c.category_id, c.name));
    return map;
  }, [categories]);

  // Sub-categories grouped under each parent_id (sorted alphabetically).
  const childrenByParent = useMemo(() => {
    const map = new Map<number, Category[]>();
    categories.forEach((c) => {
      if (c.parent_id != null) {
        const arr = map.get(c.parent_id) ?? [];
        arr.push(c);
        map.set(c.parent_id, arr);
      }
    });
    map.forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));
    return map;
  }, [categories]);

  const pinnedCategories = useMemo(
    () => categories.filter((c) => c.is_pinned).sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  // Browse mode (not searching): top-level categories only, pinned ones pulled
  // out into their own strip above so they don't appear twice. Alphabetical.
  const topLevelBrowse = useMemo(() => {
    return categories
      .filter((cat) => cat.parent_id == null && !cat.is_pinned)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  // Search mode: match across ALL categories (name + description) so deeper
  // sub-categories surface too. Pinned always sort front, then alphabetically.
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        (cat.description || "").toLowerCase().includes(q)
    );
    return [...base].sort((a, b) => {
      if (!!b.is_pinned !== !!a.is_pinned) return a.is_pinned ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [categories, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;
  const hasAnyCategories = categories.length > 0;

  // Drag is only meaningful in browse mode, for managers, and not while doing
  // other mutating interactions.
  const dragEnabled = canManageCategory && !selectionMode && !isSearching && renamingId == null;

  // Open the matching category inside the Quick Portal modal (no navigation).
  const openCategory = (slug: string) => {
    setActivePortalCategory(slug);
    setActiveOverlay("portal");
  };

  const togglePin = useCallback(
    async (cat: Category) => {
      const pinnedCount = categories.filter((c) => c.is_pinned).length;
      if (!cat.is_pinned && pinnedCount >= MAX_PINS) {
        toast.error(
          "Quick Portals is full! You can pin a maximum of 10 categories. Please unpin another category first."
        );
        return;
      }
      setPinningCategoryId(cat.category_id);
      try {
        const updated = await apiService.updateCategory(cat.category_id, {
          is_pinned: !cat.is_pinned,
        });
        updateCategoryState(updated);
      } catch (err) {
        console.error(err);
        toast.error("Failed to toggle pin");
      } finally {
        setPinningCategoryId(null);
      }
    },
    [categories, updateCategoryState]
  );

  // ---- Bulk pin / unpin ----------------------------------------------------
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const applyBulkPin = useCallback(
    async (pin: boolean) => {
      const selectedCats = categories.filter((c) => selectedIds.has(c.category_id));
      const targets = selectedCats.filter((c) => (pin ? !c.is_pinned : c.is_pinned));
      if (targets.length === 0) return;

      let toApply = targets;
      if (pin) {
        const currentPinned = categories.filter((c) => c.is_pinned).length;
        const available = MAX_PINS - currentPinned;
        if (available <= 0) {
          toast.error("Quick Portals is full! You can pin a maximum of 10 categories.");
          return;
        }
        if (targets.length > available) {
          toast.error(
            `Only ${available} slot${available === 1 ? "" : "s"} left — pinning the first ${available}.`
          );
          toApply = targets.slice(0, available);
        }
      }

      const results = await Promise.allSettled(
        toApply.map((t) => apiService.updateCategory(t.category_id, { is_pinned: pin }))
      );
      results.forEach((r) => {
        if (r.status === "fulfilled") updateCategoryState(r.value);
        else console.error(r.reason);
      });
      const ok = results.filter((r) => r.status === "fulfilled").length;
      if (ok > 0) {
        toast.success(
          `${pin ? "Pinned" : "Unpinned"} ${ok} categor${ok === 1 ? "y" : "ies"}`
        );
      }
      exitSelection();
    },
    [categories, selectedIds, updateCategoryState, exitSelection]
  );

  // ---- Inline rename -------------------------------------------------------
  const startRename = useCallback((cat: Category) => {
    setRenamingId(cat.category_id);
    setRenameValue(cat.name);
  }, []);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue("");
  }, []);

  const saveRename = useCallback(
    async (cat: Category) => {
      const next = renameValue.trim();
      setRenamingId(null);
      setRenameValue("");
      if (!next || next === cat.name) return;
      try {
        const updated = await apiService.updateCategory(cat.category_id, { name: next });
        updateCategoryState(updated);
        toast.success("Renamed");
      } catch (err: any) {
        console.error(err);
        toast.error(err?.response?.data?.error || "Failed to rename");
      }
    },
    [renameValue, updateCategoryState]
  );

  // ---- Drag to reparent ----------------------------------------------------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId((event.active.data.current?.categoryId as number) ?? null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);
      if (!over) return;
      const childId = active.data.current?.categoryId as number | undefined;
      const overId = Number(String(over.id).replace(/^cat-/, ""));
      if (childId == null || Number.isNaN(overId) || childId === overId) return;

      const child = categories.find((c) => c.category_id === childId);
      const target = categories.find((c) => c.category_id === overId);
      if (!child || !target) return;
      // Only allow dropping onto a top-level card, and never onto its current parent.
      if (target.parent_id != null || child.parent_id === overId) return;

      try {
        const updated = await apiService.updateCategory(childId, {
          parent_id: overId,
        });
        updateCategoryState(updated);
        toast.success(`Moved "${child.name}" under "${target.name}"`);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.response?.data?.error || "Failed to move category");
      }
    },
    [categories, updateCategoryState]
  );

  const draggedCategory = activeDragId != null ? categories.find((c) => c.category_id === activeDragId) : null;

  // ---- Header actions ------------------------------------------------------
  const headerActions = canManageCategory ? (
    <>
      {selectionMode ? (
        <button
          onClick={exitSelection}
          className="btn btn-ghost btn-sm font-bold rounded-xl cursor-pointer text-base-content/70"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Cancel</span>
        </button>
      ) : (
        <button
          onClick={() => setSelectionMode(true)}
          className="btn btn-outline btn-sm font-bold rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
        >
          <Check className="h-4 w-4" />
          <span className="hidden sm:inline">Select</span>
        </button>
      )}
      <button
        onClick={() => setShowAddForm((s) => !s)}
        className="btn btn-primary btn-sm font-bold rounded-xl shadow-sm transition-all duration-200 cursor-pointer text-primary-content"
      >
        <PlusCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Create Category</span>
      </button>
    </>
  ) : null;

  // Selection state shared by every card.
  const isSelected = (id: number) => selectedIds.has(id);

  // Management actions (pin + edit + rename + add-sub) shared by every card.
  const renderActions = (cat: Category) => {
    if (!canManageCategory || selectionMode) return null;
    const color = cat.color || DEFAULT_COLOR;
    const isRenaming = renamingId === cat.category_id;
    return (
      <div className="flex items-center gap-1 shrink-0">
        {cat.total_articles > 0 && (
          <span
            className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full select-none"
            style={{ backgroundColor: colorTint(color, 12), color }}
          >
            {cat.total_articles} articles
          </span>
        )}
        {!isSearching && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAddSubParentId((cur) => (cur === cat.category_id ? null : cat.category_id));
            }}
            className="p-1.5 text-base-content/50 hover:text-primary hover:bg-base-200 rounded-lg transition-all duration-150 cursor-pointer"
            title="Add sub-category inside this category"
          >
            <PlusCircle className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await togglePin(cat);
          }}
          disabled={pinningCategoryId === cat.category_id}
          className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer disabled:cursor-not-allowed ${
            cat.is_pinned
              ? "text-primary bg-primary/10 hover:bg-primary/20"
              : "text-base-content/50 hover:text-primary hover:bg-base-200"
          }`}
          title={cat.is_pinned ? "Unpin from Quick Portal" : "Pin to Quick Portal"}
        >
          {pinningCategoryId === cat.category_id ? (
            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
          ) : (
            <Pin className={`h-3.5 w-3.5 ${cat.is_pinned ? "fill-current" : ""}`} />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            startRename(cat);
          }}
          className="p-1.5 text-base-content/50 hover:text-primary hover:bg-base-200 rounded-lg transition-all duration-150 cursor-pointer"
          title="Rename"
        >
          <SquarePen className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingCategory(cat);
          }}
          className="p-1.5 text-base-content/50 hover:text-primary hover:bg-base-200 rounded-lg transition-all duration-150 cursor-pointer"
          title="Edit Category"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  // A category card. In browse mode, `childCats` renders the sub-category chips
  // inline; in search mode it is omitted and the parent label is shown instead.
  // `opts.droppableRef` / `opts.isOver` wire the card up as a reparent target.
  const renderCard = (
    cat: Category,
    childCats?: Category[],
    opts?: { droppableRef?: (node: HTMLElement | null) => void; isOver?: boolean }
  ) => {
    const color = cat.color || DEFAULT_COLOR;
    const parentName = cat.parent_id != null ? nameById.get(cat.parent_id) : undefined;
    const isPinned = cat.is_pinned;
    const inSelection = selectionMode;
    const selected = isSelected(cat.category_id);
    const isRenaming = renamingId === cat.category_id;
    const isDropTarget = opts?.isOver;

    return (
      <div
        ref={opts?.droppableRef}
        role="button"
        tabIndex={0}
        aria-pressed={inSelection ? selected : undefined}
        onClick={() => (inSelection ? toggleSelect(cat.category_id) : openCategory(cat.slug))}
        onKeyDown={(e) => {
          if (inSelection) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleSelect(cat.category_id);
            }
            return;
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openCategory(cat.slug);
          }
        }}
        className={`group relative flex flex-col gap-3 p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          isDropTarget
            ? "ring-2 ring-primary ring-offset-2 bg-primary/5"
            : isPinned
            ? "border-[color:var(--pin-border)] bg-[color:var(--pin-tint)]"
            : "bg-base-100 border-base-200 hover:border-primary"
        }`}
        style={
          isPinned && !isDropTarget
            ? ({ "--pin-tint": colorTint(color, 8), "--pin-border": colorTint(color, 30) } as CSSProperties)
            : undefined
        }
      >
        {inSelection && (
          <span
            className={`absolute top-3 left-3 inline-flex w-5 h-5 items-center justify-center rounded-md border transition-colors ${
              selected
                ? "bg-primary border-primary text-primary-content"
                : "border-base-300 bg-base-100 text-transparent"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
        )}

        <div className="flex items-start gap-3">
          {/* Icon badge */}
          <div
            className="w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105"
            style={{
              backgroundColor: colorTint(color, 12),
              borderColor: colorTint(color, 30),
              color,
            }}
          >
            <CategoryIcon icon={cat.icon} size={18} />
          </div>

          {/* Title + meta */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isRenaming ? (
                <input
                  autoFocus
                  value={renameValue}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => saveRename(cat)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") saveRename(cat);
                    else if (e.key === "Escape") cancelRename();
                  }}
                  className="text-sm md:text-base font-bold text-base-content font-serif bg-base-100 border border-primary rounded-md px-1.5 py-0.5 w-full max-w-[16rem] focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              ) : (
                <h3
                  onDoubleClick={(e) => {
                    if (!canManageCategory || selectionMode) return;
                    e.stopPropagation();
                    startRename(cat);
                  }}
                  className="text-sm md:text-base font-bold text-base-content font-serif group-hover:text-primary transition-colors duration-200 truncate"
                  title={canManageCategory ? "Double-click to rename" : undefined}
                >
                  {cat.name}
                </h3>
              )}
              {isPinned && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: colorTint(color, 14), color }}
                >
                  <Pin className="h-2.5 w-2.5 fill-current" />
                  Pinned
                </span>
              )}
            </div>
            {parentName && (
              <p className="text-[11px] text-base-content/45 font-medium truncate mt-0.5">
                in {parentName}
              </p>
            )}
          </div>

          {renderActions(cat)}
        </div>

        {/* Description */}
        <p className="text-xs text-base-content/60 leading-relaxed line-clamp-3">
          {cat.description || "No description provided."}
        </p>

        {/* Sub-category chips (browse mode only) */}
        {childCats && childCats.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 mt-1 border-t border-base-200/70">
            {childCats.map((child) => (
              <SubChip
                key={child.slug}
                child={child}
                color={child.color || DEFAULT_COLOR}
                draggable={dragEnabled}
                selectionMode={selectionMode}
                selected={isSelected(child.category_id)}
                onOpen={openCategory}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEmptyState = (
    icon: ReactNode,
    title: string,
    message: ReactNode,
    action?: ReactNode
  ) => (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-base font-bold text-base-content font-serif">{title}</h3>
      <p className="text-sm text-base-content/55 mt-1 max-w-xs">{message}</p>
      {action}
    </div>
  );

  // Builds the browse-mode body (pinned strip + top-level grid) wrapped in a
  // DndContext so sub-category chips can be reparented onto top-level cards.
  const browseBody = (
    <div className="space-y-7">
      {/* Inline Create Sub-category panel */}
      {addSubParentId != null && canManageCategory && (
        <CategoryCreateForm
          defaultParentId={addSubParentId}
          parentName={nameById.get(addSubParentId) ?? "this category"}
          onCancel={() => setAddSubParentId(null)}
        />
      )}

      {/* Pinned strip */}
      {pinnedCategories.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">
            <Pin className="h-3.5 w-3.5 text-primary" />
            Pinned to Quick Portal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {pinnedCategories.map((cat) => (
              <DroppableCard key={cat.slug} cat={cat} childCats={childrenByParent.get(cat.category_id)} dragEnabled={dragEnabled} render={renderCard} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by top-level category */}
      <section>
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">
          <LayoutGrid className="h-3.5 w-3.5" />
          Browse Categories
        </h2>
        {topLevelBrowse.length === 0 ? (
          renderEmptyState(
            <FolderOpen className="h-7 w-7 text-base-content/40" />,
            "No top-level categories",
            "Every category currently lives inside a parent. Unpin or re-parent one to browse it here."
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {topLevelBrowse.map((cat) => (
              <DroppableCard key={cat.slug} cat={cat} childCats={childrenByParent.get(cat.category_id)} dragEnabled={dragEnabled} render={renderCard} />
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const selectedCats = categories.filter((c) => selectedIds.has(c.category_id));
  const selectedUnpinned = selectedCats.filter((c) => !c.is_pinned);
  const selectedPinned = selectedCats.filter((c) => c.is_pinned);

  return (
    <GenericOverlayModal
      isOpen={isOpen}
      onClose={onClose}
      title="All Categories"
      maxWidthClass="max-w-5xl"
      headerActions={headerActions}
    >
      <div className="space-y-5">
        {/* Inline Create Category panel (non-modal) */}
        {showAddForm && canManageCategory && (
          <CategoryCreateForm onCancel={() => setShowAddForm(false)} />
        )}

        {/* Sticky search + live count */}
        <div className="sticky top-0 z-10 -mx-6 px-6 pt-6 pb-3 bg-base-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-450 h-4 w-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 border border-base-300 rounded-full text-sm bg-base-100 text-base-content placeholder-gray-450 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all duration-200"
              />
              {isSearching && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-450 hover:text-base-content hover:bg-base-200 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-base-content/50 sm:ml-auto shrink-0">
              {selectionMode
                ? `${selectedIds.size} selected`
                : isSearching
                ? `${searchResults.length} ${searchResults.length === 1 ? "match" : "matches"} of ${categories.length}`
                : `${topLevelBrowse.length + pinnedCategories.length} top-level ${
                    topLevelBrowse.length + pinnedCategories.length === 1 ? "category" : "categories"
                  }`}
            </p>
          </div>
        </div>

        {/* Body */}
        {!hasAnyCategories ? (
          renderEmptyState(
            <FolderOpen className="h-7 w-7 text-base-content/40" />,
            "No categories yet",
            "Categories organize the wiki. Create the first one to get started.",
            canManageCategory && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary btn-sm font-bold rounded-xl shadow-sm mt-4 text-primary-content cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                Create Category
              </button>
            )
          )
        ) : isSearching && searchResults.length === 0 ? (
          renderEmptyState(
            <SearchX className="h-7 w-7 text-base-content/40" />,
            "No matches",
            <>
              Nothing matches &ldquo;{searchQuery}&rdquo;.
            </>,
            <button
              onClick={() => setSearchQuery("")}
              className="btn btn-outline btn-sm rounded-xl mt-4 cursor-pointer"
            >
              Clear search
            </button>
          )
        ) : isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {searchResults.map((cat) => renderCard(cat))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {browseBody}
            <DragOverlay>
              {draggedCategory ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-primary bg-base-100 shadow-[0_8px_24px_rgba(0,0,0,0.18)] cursor-grabbing">
                  <span
                    className="w-5 h-5 shrink-0 rounded-md border flex items-center justify-center"
                    style={{
                      backgroundColor: colorTint(draggedCategory.color || DEFAULT_COLOR, 12),
                      borderColor: colorTint(draggedCategory.color || DEFAULT_COLOR, 30),
                      color: draggedCategory.color || DEFAULT_COLOR,
                    }}
                  >
                    <CategoryIcon icon={draggedCategory.icon} size={12} />
                  </span>
                  <span className="text-xs font-semibold text-base-content">
                    {draggedCategory.name}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Bulk pin / unpin toolbar (selection mode only) */}
        {selectionMode && (
          <div className="sticky bottom-0 z-10 -mx-6 px-6 pb-4 pt-3 bg-gradient-to-t from-base-100 via-base-100 to-transparent">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-100 shadow-lg px-4 py-3">
              <span className="text-sm font-semibold text-base-content">
                {selectedIds.size} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => applyBulkPin(false)}
                  disabled={selectedPinned.length === 0}
                  className="btn btn-outline btn-sm font-bold rounded-xl cursor-pointer disabled:opacity-40"
                >
                  Unpin{selectedPinned.length > 0 ? ` (${selectedPinned.length})` : ""}
                </button>
                <button
                  onClick={() => applyBulkPin(true)}
                  disabled={selectedUnpinned.length === 0}
                  className="btn btn-primary btn-sm font-bold rounded-xl text-primary-content cursor-pointer disabled:opacity-40"
                >
                  <Pin className="h-4 w-4" />
                  Pin{selectedUnpinned.length > 0 ? ` (${selectedUnpinned.length})` : ""}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Category Modal — nested on top of this modal */}
      {editingCategory && (
        <CategoryEditModal category={editingCategory} onClose={() => setEditingCategory(null)} />
      )}
    </GenericOverlayModal>
  );
}
