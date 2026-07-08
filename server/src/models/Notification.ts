import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: string;
  title: string;
  message: string;
  type: 'paper_submitted' | 'reviewer_assigned' | 'revision_required' | 'paper_accepted' | 'paper_rejected' | 'paper_published';
  paperId?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['paper_submitted', 'reviewer_assigned', 'revision_required', 'paper_accepted', 'paper_rejected', 'paper_published'],
      required: true,
    },
    paperId: { type: String, index: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);
