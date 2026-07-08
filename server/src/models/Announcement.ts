import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: 'call_for_papers' | 'general' | 'news' | 'event';
  publishedAt: Date;
  isFeatured?: boolean;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['call_for_papers', 'general', 'news', 'event'], default: 'general' },
    publishedAt: { type: Date, default: Date.now },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AnnouncementModel = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
