import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

/**
 * GET /pages/recent/new
 * Fetch most recently created pages (default limit: 5)
 */
export const getRecentNewPages = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const pages = await prisma.live_pages.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: limit,
      select: {
        page_id: true,
        title: true,
        slug: true,
        created_at: true,
      },
    });
    return res.json(pages);
  } catch (error: any) {
    console.error('Error in getRecentNewPages:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * GET /pages/recent/updated
 * Fetch most recently updated pages (default limit: 5)
 */
export const getRecentUpdatedPages = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const pages = await prisma.live_pages.findMany({
      where: { deleted_at: null },
      orderBy: { updated_at: 'desc' },
      take: limit,
      select: {
        page_id: true,
        title: true,
        slug: true,
        updated_at: true,
      },
    });
    return res.json(pages);
  } catch (error: any) {
    console.error('Error in getRecentUpdatedPages:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * GET /pages/search
 * Search both live pages and pending drafts (status = in_review, page_id = null)
 */
export const searchPages = async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || '';

    // Search live_pages
    const livePages = await prisma.live_pages.findMany({
      where: {
        deleted_at: null,
        OR: query
          ? [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ]
          : undefined,
      },
      select: {
        page_id: true,
        title: true,
        slug: true,
        content: true,
        metadata: true,
      },
    });

    // Search pending drafts (unreviewed brand new pages)
    const pendingPages = await prisma.pending_pages.findMany({
      where: {
        status: 'in_review',
        page_id: null,
        OR: query
          ? [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ]
          : undefined,
      },
      select: {
        pending_id: true,
        title: true,
        content: true,
        metadata: true,
        status: true,
      },
    });

    const results = [];
    const cleanContent = (content: string | null) => {
      if (!content) return '';
      const clean = content.replace(/^---[\s\S]*?---/, '').trim();
      return clean.length > 150 ? clean.substring(0, 150) + '...' : clean;
    };

    for (const p of livePages) {
      const meta = p.metadata as any;
      const category = meta?.category || 'Campus';
      results.push({
        title: p.title || 'Untitled',
        slug: p.slug,
        path: `/wiki/${p.slug}`,
        category,
        description: cleanContent(p.content),
        is_pending: false,
      });
    }

    for (const p of pendingPages) {
      const meta = p.metadata as any;
      let draftSlug = meta?.slug;
      if (!draftSlug && p.title) {
        const baseSlug = p.title
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .trim()
          .toLowerCase();
        draftSlug = baseSlug.replace(/[\s-]+/g, '-');
      }
      const category = meta?.category || 'Campus';
      results.push({
        title: p.title || 'Untitled',
        slug: draftSlug || 'untitled',
        path: `/wiki/${draftSlug || 'untitled'}`,
        category,
        description: cleanContent(p.content),
        is_pending: true,
      });
    }

    return res.json(results);
  } catch (error: any) {
    console.error('Error in searchPages:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * GET /pages/:slug
 * Retrieve a live page by its slug. 
 * Fallback to searching unreviewed pending page drafts with a matching slugified title.
 */
export const getPage = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;

    // 1. Try to find the live page
    const livePage = await prisma.live_pages.findFirst({
      where: {
        slug,
        deleted_at: null,
      },
      include: {
        original_author: {
          select: { name: true },
        },
      },
    });

    if (livePage) {
      return res.json({
        ...livePage,
        users: { name: livePage.original_author?.name },
      });
    }

    // 2. Check pending_pages where status is 'in_review' and page_id is null (new page proposals)
    const pendingPages = await prisma.pending_pages.findMany({
      where: {
        status: 'in_review',
        page_id: null,
      },
      include: {
        editor: {
          select: { name: true },
        },
      },
    });

    for (const draft of pendingPages) {
      const meta = draft.metadata as any;
      let draftSlug = meta?.slug;
      if (!draftSlug && draft.title) {
        const baseSlug = draft.title
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .trim()
          .toLowerCase();
        draftSlug = baseSlug.replace(/[\s-]+/g, '-');
      }

      if (draftSlug === slug) {
        return res.json({
          page_id: null,
          pending_id: draft.pending_id,
          title: draft.title,
          slug: draftSlug,
          content: draft.content,
          metadata: draft.metadata || {},
          version: null,
          status: 'in_review',
          created_at: draft.created_at,
          updated_at: draft.created_at,
          users: { name: draft.editor.name },
        });
      }
    }

    return res.status(404).json({ detail: 'Page not found or deleted' });
  } catch (error: any) {
    console.error('Error in getPage:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
