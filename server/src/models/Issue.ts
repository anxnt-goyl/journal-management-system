import mongoose, { Schema, Document } from 'mongoose';

export interface IIssue extends Document {
  volumeNumber: number;
  issueNumber: number;
  year: number;
  month: string;
  title?: string;
  coverImage?: string;
  status: 'draft' | 'published';
  publishedAt?: Date;
  description?: string;
  papersCount: number;
}

const issueSchema = new Schema<IIssue>(
  {
    volumeNumber: { type: Number, required: true },
    issueNumber: { type: Number, required: true },
    year: { type: Number, required: true },
    month: { type: String, required: true },
    title: { type: String },
    coverImage: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date },
    description: { type: String },
    papersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const IssueModel = mongoose.model<IIssue>('Issue', issueSchema);
