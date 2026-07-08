import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewerAssignment extends Document {
  paperId: string;
  reviewerId: string;
  assignedBy: string;
  assignedAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  note?: string;
}

const reviewerAssignmentSchema = new Schema<IReviewerAssignment>(
  {
    paperId: { type: String, required: true, index: true },
    reviewerId: { type: String, required: true, index: true },
    assignedBy: { type: String, required: true },
    assignedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'completed'], default: 'pending' },
    note: { type: String },
  },
  { timestamps: true }
);

export const ReviewerAssignmentModel = mongoose.model<IReviewerAssignment>('ReviewerAssignment', reviewerAssignmentSchema);
