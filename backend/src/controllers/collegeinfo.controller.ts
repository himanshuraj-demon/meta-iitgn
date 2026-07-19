import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { invalidateSyncCache } from './page.controller.js';
import { updateSyncMetadata } from '../utils/syncMetadata.js';

/**
 * GET /collegeinfo/events
 * Returns upcoming events (future events first, then recurring)
 */
export const getEvents = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const now = new Date();

    const events = await prisma.events.findMany({
      where: {
        deleted_at: null,
        OR: [
          { event_date: { gte: now } },
          { is_recurring: true },
        ],
      },
      orderBy: { event_date: 'asc' },
      take: limit,
    });

    return res.json({ success: true, data: events });
  } catch (error: any) {
    console.error('Error in getEvents:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

/**
 * POST /collegeinfo/events
 * Create a new event directly in the events table
 */
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, location, event_date, is_recurring, recur_day, recur_time } = req.body;
    if (!title || !description || !event_date) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'title, description and event_date are required' } });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const newEvent = await prisma.events.create({
      data: {
        title,
        slug,
        description,
        location: location || "IIT Gandhinagar",
        event_date: new Date(event_date),
        is_recurring: !!is_recurring,
        recur_day: recur_day || null,
        recur_time: recur_time || null
      }
    });

    await prisma.$transaction(async (tx) => {
      await updateSyncMetadata('events', 1, tx);
    });
    invalidateSyncCache('events');

    return res.status(201).json({ success: true, data: newEvent });
  } catch (error: any) {
    console.error('Error in createEvent:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

/**
 * PUT /collegeinfo/events/:event_id
 * Update an existing event in the events table
 */
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { event_id } = req.params;
    const { title, description, location, event_date, is_recurring, recur_day, recur_time } = req.body;

    const eventId = Number(event_id);
    const existing = await prisma.events.findUnique({ where: { event_id: eventId } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    const updatedEvent = await prisma.events.update({
      where: { event_id: eventId },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        location: location !== undefined ? location : existing.location,
        event_date: event_date !== undefined ? new Date(event_date) : existing.event_date,
        is_recurring: is_recurring !== undefined ? !!is_recurring : existing.is_recurring,
        recur_day: recur_day !== undefined ? recur_day : existing.recur_day,
        recur_time: recur_time !== undefined ? recur_time : existing.recur_time
      }
    });

    await prisma.$transaction(async (tx) => {
      await updateSyncMetadata('events', 0, tx);
    });
    invalidateSyncCache('events');

    return res.json({ success: true, data: updatedEvent });
  } catch (error: any) {
    console.error('Error in updateEvent:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

/**
 * DELETE /collegeinfo/events/:event_id
 * Soft-delete an event from the events table
 */
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { event_id } = req.params;
    const eventId = Number(event_id);

    const existing = await prisma.events.findUnique({ where: { event_id: eventId } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    await prisma.events.update({
      where: { event_id: eventId },
      data: { deleted_at: new Date() }
    });

    await prisma.$transaction(async (tx) => {
      await updateSyncMetadata('events', -1, tx);
    });
    invalidateSyncCache('events');

    return res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Error in deleteEvent:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
