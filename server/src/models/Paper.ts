import mongoose, { Schema, Document } from 'mongoose';

export interface IPaper extends Document {
  title: string;
  abstract: string;
  keywords: string[];
  authors: Array<{
    name: string;
    email: string;
    institution: string;
    isCorresponding: boolean;
  }>;
  submittedBy: string;
  fileName?: string;
  filePath?: string;
  fileSize?: string;
  fileType?: string;
  status: 'submitted' | 'under_review' | 'revision_requested' | 'accepted' | 'rejected' | 'published' | 'resubmitted';
  category: string;
  parentPaperId?: string;
  revisionOf?: string;
  version: number;
  volume?: string;
  issue?: string;
  doi?: string;
  assignedReviewers: string[];
  reviews: Array<{
    reviewerId: string;
    reviewerName: string;
    recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
    originalityRating: number;
    methodologyRating: number;
    significanceRating: number;
    commentsForAuthor: string;
    commentsForEditor: string;
    submittedAt: Date;
  }>;
}

const paperSchema = new Schema<IPaper>(
  {
    title: { type: String, required: true, trim: true },
    abstract: { type: String, required: true },
    keywords: [{ type: String }],
    authors: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        institution: { type: String, required: true },
        isCorresponding: { type: Boolean, default: false },
      },
    ],
    submittedBy: { type: String, required: true },
    fileName: { type: String },
    filePath: { type: String },
    fileSize: { type: String },
    fileType: { type: String },
    status: { type: String, enum: ['submitted', 'under_review', 'revision_requested', 'accepted', 'rejected', 'published', 'resubmitted'], default: 'submitted' },
    category: { type: String, required: true },
    parentPaperId: { type: String },
    revisionOf: { type: String },
    version: { type: Number, default: 1 },
    volume: { type: String },
    issue: { type: String },
    doi: { type: String },
    assignedReviewers: [{ type: String }],
    reviews: [
      {
        reviewerId: { type: String, required: true },
        reviewerName: { type: String, required: true },
        recommendation: { type: String, enum: ['accept', 'minor_revision', 'major_revision', 'reject'] },
        originalityRating: { type: Number },
        methodologyRating: { type: Number },
        significanceRating: { type: Number },
        commentsForAuthor: { type: String },
        commentsForEditor: { type: String },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const PaperModel = mongoose.model<IPaper>('Paper', paperSchema);
