import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  paperId: string;
  reviewerId: string;
  reviewerName: string;
  recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  originalityRating: number;
  methodologyRating: number;
  significanceRating: number;
  commentsForAuthor: string;
  commentsForEditor: string;
  submittedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    paperId: { type: String, required: true, index: true },
    reviewerId: { type: String, required: true, index: true },
    reviewerName: { type: String, required: true, trim: true },
    recommendation: {
      type: String,
      enum: ['accept', 'minor_revision', 'major_revision', 'reject'],
      required: true,
    },
    originalityRating: { type: Number, min: 1, max: 5, default: 0 },
    methodologyRating: { type: Number, min: 1, max: 5, default: 0 },
    significanceRating: { type: Number, min: 1, max: 5, default: 0 },
    commentsForAuthor: { type: String, default: '' },
    commentsForEditor: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ReviewModel = mongoose.model<IReview>('Review', reviewSchema);
