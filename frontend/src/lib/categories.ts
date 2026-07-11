import { CATEGORIES_DATA, CategoryInfo } from "./placeholder-articles";

export interface CustomCategory {
  slug: string;
  name: string;
  description: string;
}

export function getAllCategories(): Record<string, CategoryInfo> {
  if (typeof window === "undefined") {
    return CATEGORIES_DATA;
  }

  const saved = localStorage.getItem("wiki-custom-categories");
  if (!saved) {
    return CATEGORIES_DATA;
  }

  try {
    const customList: CustomCategory[] = JSON.parse(saved);
    const merged = { ...CATEGORIES_DATA };
    for (const cat of customList) {
      merged[cat.slug] = {
        name: cat.name,
        description: cat.description,
        articles: [],
      };
    }
    return merged;
  } catch (e) {
    console.error("Error parsing custom categories", e);
    return CATEGORIES_DATA;
  }
}

export function addCustomCategory(name: string, description: string): string {
  if (typeof window === "undefined") return "";

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) return "";

  const saved = localStorage.getItem("wiki-custom-categories");
  let customList: CustomCategory[] = [];
  if (saved) {
    try {
      customList = JSON.parse(saved);
    } catch (e) {
      // ignore
    }
  }

  // Check if it already exists
  if (CATEGORIES_DATA[slug] || customList.some((c) => c.slug === slug)) {
    return slug; // already exists
  }

  customList.push({ slug, name, description });
  localStorage.setItem("wiki-custom-categories", JSON.stringify(customList));
  return slug;
}
