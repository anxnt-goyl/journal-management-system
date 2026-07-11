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
