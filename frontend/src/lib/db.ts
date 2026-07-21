import Dexie, { type Table } from 'dexie';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GithubReposCache {
  /** "<category>::<level>::page=<n>", e.g. "web-dev::all::page=1" */
  cache_key:   string;
  repos:       unknown[];
  total_count: number;
  cached_at:   number; // Unix ms timestamp
}

export interface CompetitionContestCache {
  /** Fixed key — only one record: "all_contests" */
  cache_key: string;
  contests:  unknown[];
  cached_at: number; // Unix ms timestamp
}

// ---------------------------------------------------------------------------
// Dexie class
// ---------------------------------------------------------------------------

export class WikiDexie extends Dexie {
  bookmarks!:             Table<any, string>;
  news!:                  Table<any, string>;
  pendingpages!:          Table<any, string>;
  updatedpages!:          Table<any, string>;
  meta!:                  Table<any, string>;
  cachedpages!:           Table<any, string>;
  featured!:              Table<any, string>;
  popular!:               Table<any, string>;
  events!:                Table<any, string>;
  /** GitHub repo search results cached per (category + level + page). 24 h TTL. */
  github_repos!:          Table<GithubReposCache, string>;
  /** Upcoming contests cached from contest-hive API. 4 h TTL. */
  competitions_contests!: Table<CompetitionContestCache, string>;

  constructor() {
    super('WikiDB');

    // ---- v3 ----
    this.version(3).stores({
      bookmarks:    'id',
      news:         'id',
      contributors: 'id',
      pendingpages: 'id',
      updatedpages: 'id',
      meta:         'key',
      cachedpages:  'slug',
      featured:     'id',
      popular:      'id',
      events:       'id',
    });

    // ---- v4 ---- (removed contributors store)
    this.version(4).stores({
      bookmarks:    'id',
      news:         'id',
      pendingpages: 'id',
      updatedpages: 'id',
      meta:         'key',
      cachedpages:  'slug',
      featured:     'id',
      popular:      'id',
      events:       'id',
      contributors: null, // explicitly drop
    });

    // ---- v5 ---- (add competition caches)
    this.version(5).stores({
      bookmarks:              'id',
      news:                   'id',
      pendingpages:           'id',
      updatedpages:           'id',
      meta:                   'key',
      cachedpages:            'slug',
      featured:               'id',
      popular:                'id',
      events:                 'id',
      github_repos:           'cache_key',
      competitions_contests:  'cache_key',
    });
  }
}

export const db = new WikiDexie();
