import { api } from "@/lib/api";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GitHubOwner {
  login:      string;
  avatar_url: string;
  html_url:   string;
}

export interface GitHubRepo {
  id:                  number;
  name:                string;
  full_name:           string;
  html_url:            string;
  description:         string | null;
  stargazers_count:    number;
  forks_count:         number;
  watchers_count:      number;
  open_issues_count:   number;
  language:            string | null;
  owner:               GitHubOwner;
  topics?:             string[];
  updated_at:          string;
  homepage:            string | null;
}

export interface ReposResult {
  repos:       GitHubRepo[];
  total_count: number;
  page:        number;
  from_cache:  boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** 24 hours in milliseconds — mirrors backend TTL. */
const GITHUB_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function repoCacheKey(category: string, level: string, page: number): string {
  return `${category}::${level}::page=${page}`;
}

// ---------------------------------------------------------------------------
// API function
// ---------------------------------------------------------------------------

/**
 * Fetches GitHub repos for the given category/level/page.
 *
 * Strategy:
 *  1. Check IndexedDB (`github_repos` store) for a fresh entry (< 24 h).
 *  2. If stale or missing, call the backend `/competitions/repos` endpoint.
 *  3. Persist fresh backend data to IndexedDB.
 *  4. Return typed `ReposResult`.
 */
export async function getGithubRepos(
  category: string,
  level:    string,
  page:     number = 1
): Promise<ReposResult> {
  const cacheKey = repoCacheKey(category, level, page);

  // --- 1. Check IndexedDB ---
  try {
    const cached = await db.github_repos.get(cacheKey);
    if (cached && Date.now() - cached.cached_at < GITHUB_CACHE_TTL_MS) {
      return {
        repos:       cached.repos as GitHubRepo[],
        total_count: cached.total_count,
        page,
        from_cache:  true,
      };
    }
  } catch {
    // IndexedDB unavailable — fall through to network
  }

  // --- 2. Fetch from backend ---
  const { data: envelope } = await api.get<{
    success: boolean;
    data:    ReposResult;
  }>("/competitions/repos", {
    params: { category, level, page },
  });

  const result = envelope.data;

  // --- 3. Persist to IndexedDB ---
  try {
    await db.github_repos.put({
      cache_key:   cacheKey,
      repos:       result.repos,
      total_count: result.total_count,
      cached_at:   Date.now(),
    });
  } catch {
    // Ignore write errors (storage full, private browsing, etc.)
  }

  return result;
}
