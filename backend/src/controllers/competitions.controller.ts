import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How long a cached result stays fresh before re-fetching from GitHub (24 h). */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Number of repos returned per page from GitHub. Keep ≤ 15 to stay well under
 *  the unauthenticated rate-limit of 10 search requests/min. */
const PER_PAGE = 15;

// Valid category slugs accepted by this endpoint.
const VALID_CATEGORIES = new Set([
  "web-dev",
  "devops",
  "ml",
  "robotics",
  "os",
  "mobile",
  "gamedev",
  "security",
  "data",
  "blockchain",
]);

// Topic mapped per category slug — mirrors the frontend definition.
const CATEGORY_TOPICS: Record<string, string> = {
  "web-dev":    "web",
  devops:       "devops",
  ml:           "machine-learning",
  robotics:     "robotics",
  os:           "operating-system",
  mobile:       "mobile",
  gamedev:      "game-development",
  security:     "security",
  data:         "data-science",
  blockchain:   "blockchain",
};

// Valid levels.
const VALID_LEVELS = new Set(["all", "beginner", "intermediate", "expert"]);

const LEVEL_TOPICS: Record<string, string | null> = {
  all:          null,
  beginner:     "beginner-friendly",
  intermediate: "intermediate",
  expert:       "advanced",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildGitHubQuery(category: string, level: string): string {
  const parts: string[] = [];
  parts.push(`topic:${CATEGORY_TOPICS[category]}`);
  const levelTopic = LEVEL_TOPICS[level];
  if (levelTopic) parts.push(`topic:${levelTopic}`);
  parts.push("stars:>10");
  return parts.join(" ");
}

async function fetchFromGitHub(
  category: string,
  level: string,
  page: number
): Promise<{ repos: unknown[]; total_count: number }> {
  const q = buildGitHubQuery(category, level);
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${PER_PAGE}&page=${page}`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("GitHub API rate limit reached. Please try again later.");
    }
    if (res.status === 422) {
      throw new Error("No results for this filter combination.");
    }
    throw new Error(`GitHub API error (${res.status})`);
  }

  const json = (await res.json()) as { total_count: number; items: unknown[] };
  return { repos: json.items ?? [], total_count: json.total_count ?? 0 };
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

/**
 * GET /competitions/repos?category=web-dev&level=all&page=1
 *
 * Page 1 is served from the DB cache (24 h TTL). Subsequent pages are fetched
 * live from GitHub and are NOT persisted (they are cached client-side instead).
 */
export const getGithubRepos = async (req: Request, res: Response) => {
  const category = (req.query.category as string) ?? "web-dev";
  const level    = (req.query.level    as string) ?? "all";
  const page     = Math.max(1, parseInt((req.query.page as string) ?? "1", 10));

  // --- Input validation ---
  if (!VALID_CATEGORIES.has(category)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_CATEGORY", message: `Unknown category: ${category}` },
    });
  }
  if (!VALID_LEVELS.has(level)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_LEVEL", message: `Unknown level: ${level}` },
    });
  }

  // Only cache page 1 in the DB. Pages > 1 are fetched live and cached by the
  // client in IndexedDB.
  if (page > 1) {
    try {
      const { repos, total_count } = await fetchFromGitHub(category, level, page);
      return res.json({ success: true, data: { repos, total_count, page, from_cache: false } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return res.status(502).json({ success: false, error: { code: "GITHUB_ERROR", message } });
    }
  }

  const cacheKey = `${category}::${level}`;

  // --- Check DB cache ---
  try {
    const cached = await prisma.github_repos.findUnique({ where: { cache_key: cacheKey } });

    if (cached) {
      const ageMs = Date.now() - cached.cached_at.getTime();
      if (ageMs < CACHE_TTL_MS) {
        return res.json({
          success: true,
          data: {
            repos:       cached.repos,
            total_count: cached.total_count,
            page:        1,
            from_cache:  true,
          },
        });
      }
    }
  } catch (dbErr) {
    // DB unavailable — fall through to GitHub
    console.error("[competitions] DB read error:", dbErr);
  }

  // --- Fetch from GitHub ---
  try {
    const { repos, total_count } = await fetchFromGitHub(category, level, 1);

    // Upsert into DB cache (fire-and-forget on error)
    prisma.github_repos
      .upsert({
        where:  { cache_key: cacheKey },
        update: { repos: repos as object[], total_count, cached_at: new Date(), updated_at: new Date() },
        create: { cache_key: cacheKey, category, level, repos: repos as object[], total_count, cached_at: new Date() },
      })
      .catch((e) => console.error("[competitions] DB upsert error:", e));

    return res.json({ success: true, data: { repos, total_count, page: 1, from_cache: false } });
  } catch (err) {
    // Last resort: return stale cached data if any exists
    try {
      const stale = await prisma.github_repos.findUnique({ where: { cache_key: cacheKey } });
      if (stale) {
        return res.json({
          success: true,
          data: { repos: stale.repos, total_count: stale.total_count, page: 1, from_cache: true },
        });
      }
    } catch {
      // ignore secondary DB error
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(502).json({ success: false, error: { code: "GITHUB_ERROR", message } });
  }
};
