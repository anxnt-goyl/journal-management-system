import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = await NotificationModel.find({ recipientId: userId }).sort({ createdAt: -1 }).lean();
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load notifications', error });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId || !notificationId) {
      return res.status(400).json({ message: 'notificationId is required' });
    }

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update notification', error });
  }
};
