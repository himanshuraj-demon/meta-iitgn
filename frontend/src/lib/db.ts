import Dexie, { type Table } from 'dexie';

export class WikiDexie extends Dexie {
  bookmarks!: Table<any, string>;
  news!: Table<any, string>;
  pendingpages!: Table<any, string>;
  updatedpages!: Table<any, string>;
  meta!: Table<any, string>;
  cachedpages!: Table<any, string>;
  featured!: Table<any, string>;
  popular!: Table<any, string>;
  events!: Table<any, string>;

  constructor() {
    super('WikiDB');
    this.version(3).stores({
      bookmarks: 'id',
      news: 'id',
      contributors: 'id',
      pendingpages: 'id',
      updatedpages: 'id',
      meta: 'key',
      cachedpages: 'slug',
      featured: 'id',
      popular: 'id',
      events: 'id',
    });
    this.version(4).stores({
      bookmarks: 'id',
      news: 'id',
      pendingpages: 'id',
      updatedpages: 'id',
      meta: 'key',
      cachedpages: 'slug',
      featured: 'id',
      popular: 'id',
      events: 'id',
      contributors: null,
    });
  }
}

export const db = new WikiDexie();
