import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, avatar_url } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const user = await prisma.users.create({
      data: {
        name,
        email,
        avatar_url: avatar_url || null,
        role: 'Bronze',
      },
    });

    return res.status(201).json(user);
  } catch (error: any) {
    console.error('Error in createUser:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
