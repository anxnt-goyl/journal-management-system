import { Request, Response } from 'express';
import { AnnouncementModel } from '../models/Announcement';

export const getAnnouncements = async (_req: Request, res: Response) => {
  try {
    const announcements = await AnnouncementModel.find({}).sort({ publishedAt: -1 }).lean();
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load announcements', error });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, category, isFeatured } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'title and content are required' });
    }

    const announcement = await AnnouncementModel.create({
      title,
      content,
      category: category || 'general',
      isFeatured: Boolean(isFeatured),
      publishedAt: new Date(),
    });

    return res.status(201).json(announcement);
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create announcement', error });
  }
};
