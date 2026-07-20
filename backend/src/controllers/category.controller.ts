import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

let categoriesCache: any[] | null = null;

export const invalidateCategoriesCache = () => {
  categoriesCache = null;
};

// Per-category article listings (GET /categories/:slug/articles). Keyed by
// `${slug}:${page}:${limit}` so each pagination window is cached independently.
const categoryArticlesCache = new Map<string, { data: any; expiry: number }>();
const CATEGORY_ARTICLES_TTL = 60000; // 60 seconds

export const invalidateCategoryArticlesCache = (slug?: string) => {
  if (slug) {
    // Drop every cached window for this category (any page/limit variant).
    for (const key of categoryArticlesCache.keys()) {
      if (key.startsWith(`${slug}:`)) {
        categoryArticlesCache.delete(key);
      }
    }
  } else {
    categoryArticlesCache.clear();
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    if (categoriesCache) {
      return res.json(categoriesCache);
    }

    const categories = await prisma.categories.findMany({
      orderBy: { name: "asc" }
    });

    // Count live pages per category using both category and subcategory columns.
    const rawCategoryCounts = await prisma.live_pages.groupBy({
      by: ['category'],
      where: { deleted_at: null, category: { not: null } },
      _count: { _all: true }
    });

    const rawSubcategoryCounts = await prisma.live_pages.groupBy({
      by: ['subcategory'],
      where: { deleted_at: null, subcategory: { not: null } },
      _count: { _all: true }
    });

    const counts: Record<string, number> = {};
    for (const row of rawCategoryCounts) {
      if (row.category) {
        counts[row.category] = (counts[row.category] || 0) + row._count._all;
      }
    }
    for (const row of rawSubcategoryCounts) {
      if (row.subcategory) {
        counts[row.subcategory] = (counts[row.subcategory] || 0) + row._count._all;
      }
    }

    const results = categories.map(cat => ({
      ...cat,
      total_articles: counts[cat.slug] || 0
    }));

    categoriesCache = results;
    return res.json(results);
  } catch (error: any) {
    console.error("Error in getCategories:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, color, parent_id } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required" });
    }

    let parentId: number | null = null;
    if (parent_id !== undefined && parent_id !== null) {
      parentId = Number(parent_id);
      if (isNaN(parentId)) {
        return res.status(400).json({ error: "Invalid parent category" });
      }
      const parent = await prisma.categories.findUnique({
        where: { category_id: parentId }
      });
      if (!parent) {
        return res.status(400).json({ error: "Parent category not found" });
      }
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      return res.status(400).json({ error: "Invalid category name" });
    }

    const existing = await prisma.categories.findUnique({
      where: { slug }
    });

    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const category = await prisma.categories.create({
      data: {
        slug,
        name,
        description,
        icon: icon || "BookOpen",
        color: color || "blue",
        total_articles: 0,
        parent_id: parentId
      }
    });

    invalidateCategoriesCache();

    return res.status(201).json({
      ...category,
      total_articles: 0
    });
  } catch (error: any) {
    console.error("Error in createCategory:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, is_pinned, icon, color, parent_id } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const existing = await prisma.categories.findUnique({
      where: { category_id: id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    const data: any = {};
    if (description !== undefined) {
      data.description = description;
    }

    if (is_pinned !== undefined) {
      data.is_pinned = is_pinned;
    }

    if (icon !== undefined) {
      data.icon = icon;
    }

    if (color !== undefined) {
      data.color = color;
    }

    if (parent_id !== undefined) {
      if (parent_id === null) {
        data.parent_id = null;
      } else {
        const parentId = Number(parent_id);
        if (isNaN(parentId)) {
          return res.status(400).json({ error: "Invalid parent category" });
        }
        if (parentId === id) {
          return res.status(400).json({ error: "A category cannot be its own parent" });
        }

        // Cycle guard: walk up the proposed parent's ancestor chain. If this
        // category (id) appears anywhere in it, the assignment would create a
        // cycle (setting a descendant as parent).
        const allCategories = await prisma.categories.findMany({
          select: { category_id: true, parent_id: true }
        });
        const parentMap = new Map<number, number | null>();
        for (const c of allCategories) {
          parentMap.set(c.category_id, c.parent_id);
        }
        if (!parentMap.has(parentId)) {
          return res.status(400).json({ error: "Parent category not found" });
        }
        let cursor: number | null = parentId;
        const visited = new Set<number>();
        while (cursor !== null && cursor !== undefined) {
          if (cursor === id) {
            return res.status(400).json({ error: "Cannot set a descendant as parent" });
          }
          if (visited.has(cursor)) break; // safety against pre-existing cycles
          visited.add(cursor);
          cursor = parentMap.get(cursor) ?? null;
        }

        data.parent_id = parentId;
      }
    }

    if (name !== undefined) {
      data.name = name;
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      if (!slug) {
        return res.status(400).json({ error: "Invalid category name" });
      }

      const conflict = await prisma.categories.findFirst({
        where: {
          slug,
          NOT: { category_id: id }
        }
      });

      if (conflict) {
        return res.status(400).json({ error: "Category with this name already exists" });
      }

      data.slug = slug;
    }

    const slugChanged = !!data.slug && data.slug !== existing.slug;

    const updated = await prisma.$transaction(async (tx) => {
      // When the category is renamed, its slug changes. Pages store the
      // category as a slug in their `category` column, so repoint any pages
      // (live and pending drafts) that referenced the old slug to the new one.
      // Without this they become orphaned and "disappear" from the category.
      if (slugChanged) {
        await tx.live_pages.updateMany({
          where: { category: existing.slug },
          data: { category: data.slug },
        });
        await tx.live_pages.updateMany({
          where: { subcategory: existing.slug },
          data: { subcategory: data.slug },
        });
        await tx.pending_pages.updateMany({
          where: { category: existing.slug },
          data: { category: data.slug },
        });
        await tx.pending_pages.updateMany({
          where: { subcategory: existing.slug },
          data: { subcategory: data.slug },
        });
      }

      return tx.categories.update({
        where: { category_id: id },
        data,
      });
    });

    invalidateCategoriesCache();
    invalidateCategoryArticlesCache();

    const count = await prisma.live_pages.count({
      where: {
        deleted_at: null,
        OR: [
          { category: updated.slug },
          { subcategory: updated.slug }
        ]
      }
    });

    return res.json({
      ...updated,
      total_articles: count
    });
  } catch (error: any) {
    console.error("Error in updateCategory:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const normalizeCategoryToSlug = (value: string): string => {
  const normalized = value.toLowerCase().trim();
  if (normalized === "campus facilities" || normalized === "facilities") return "facilities";
  if (normalized === "faculty profiles" || normalized === "faculty") return "faculty";
  if (normalized === "courses info" || normalized === "courses") return "courses";
  if (normalized === "research labs" || normalized === "research") return "research";
  if (normalized === "hostels guide" || normalized === "hostels") return "hostels";
  if (normalized === "student clubs" || normalized === "clubs") return "clubs";
  if (normalized === "institute fests" || normalized === "fests") return "fests";
  if (normalized === "placement stats" || normalized === "placements") return "placements";
  if (normalized === "institute policies" || normalized === "policies") return "policies";
  if (normalized === "academic calendar" || normalized === "calendar" || normalized === "academic info" || normalized === "academic-info") return "academic-info";
  return normalized;
};

export const extractPageFields = (content: string | null, metadata: any) => {
  let category: string | null = null;
  let subcategory: string | null = null;
  let description: string | null = null;

  if (content && content.startsWith("---")) {
    const parts = content.split("---");
    if (parts.length >= 3) {
      const frontmatter = parts[1];
      const lines = frontmatter.split("\n");
      for (let line of lines) {
        line = line.trim();
        const lowerLine = line.toLowerCase();
        if (lowerLine.startsWith("category:")) {
          category = line.substring("category:".length).trim().toLowerCase() || null;
        } else if (lowerLine.startsWith("subcategory:")) {
          subcategory = line.substring("subcategory:".length).trim().toLowerCase() || null;
        } else if (lowerLine.startsWith("description:")) {
          description = line.substring("description:".length).trim() || null;
        }
      }
    }
  }

  if (!category && metadata?.category) {
    category = String(metadata.category).trim().toLowerCase();
  }
  if (!subcategory && metadata?.subcategory) {
    subcategory = String(metadata.subcategory).trim().toLowerCase();
  }
  if (!description && metadata?.description) {
    description = String(metadata.description);
  }

  if (!description && content) {
    const clean = content.replace(/^---[\s\S]*?---/, "").trim();
    description = clean.length > 150 ? clean.substring(0, 150) + "..." : clean;
  }

  if (category) {
    category = normalizeCategoryToSlug(category);
  }
  if (subcategory) {
    subcategory = normalizeCategoryToSlug(subcategory);
  }

  const SUBCATEGORY_TO_CATEGORY: Record<string, string> = {
    faculty: "academics",
    courses: "academics",
    departments: "academics",
    hostels: "campus",
    facilities: "campus",
    clubs: "student-life",
    fests: "student-life",
    research: "research",
    "academic-info": "policies",
    placements: "policies",
    policies: "policies"
  };

  if (!subcategory && category && SUBCATEGORY_TO_CATEGORY[category]) {
    subcategory = category;
    category = SUBCATEGORY_TO_CATEGORY[subcategory];
  } else if (subcategory && !category) {
    category = SUBCATEGORY_TO_CATEGORY[subcategory] || null;
  } else if (subcategory && category) {
    const alignedParent = SUBCATEGORY_TO_CATEGORY[subcategory];
    if (alignedParent) {
      category = alignedParent;
    }
  }

  return {
    category: category || null,
    subcategory: subcategory || null,
    description: description || null
  };
};

export const getCategoryArticles = async (req: Request, res: Response) => {
  try {
    let categorySlug = (req.params.slug as string).toLowerCase().trim();
    if (categorySlug === "calendar") {
      categorySlug = "academic-info";
    }

    const pageNum = parseInt(req.query.page as string, 10) || 1;
    const limitNum = parseInt(req.query.limit as string, 10) || 6;
    const skip = (pageNum - 1) * limitNum;

    const cacheKey = `${categorySlug}:${pageNum}:${limitNum}`;
    const cached = categoryArticlesCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return res.json(cached.data);
    }

    // Pages are associated with a category via the `category` or `subcategory` columns.
    const totalMatched = await prisma.live_pages.count({
      where: {
        deleted_at: null,
        OR: [
          { category: categorySlug },
          { subcategory: categorySlug }
        ]
      }
    });

    const paginatedPages = await prisma.live_pages.findMany({
      where: {
        deleted_at: null,
        OR: [
          { category: categorySlug },
          { subcategory: categorySlug }
        ]
      },
      select: {
        page_id: true,
        slug: true,
        title: true,
        icon: true,
        color: true
      },
      orderBy: {
        title: 'asc'
      },
      skip,
      take: limitNum
    });

    const results = paginatedPages.map((page) => ({
      page_id: page.page_id,
      slug: page.slug,
      title: page.title || "Untitled",
      icon: page.icon,
      color: page.color
    }));

    const response = {
      articles: results,
      total: totalMatched,
      page: pageNum,
      limit: limitNum,
      hasMore: skip + limitNum < totalMatched
    };
    categoryArticlesCache.set(cacheKey, { data: response, expiry: Date.now() + CATEGORY_ARTICLES_TTL });

    return res.json(response);
  } catch (error: any) {
    console.error("Error in getCategoryArticles:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
