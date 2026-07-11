import { Request, Response } from 'express';
import { PaperModel } from '../models/Paper';
import { ReviewModel } from '../models/Review';

export const getAssignedPapers = async (req: Request, res: Response) => {
  try {
    const reviewerId = req.user?.id;
    if (!reviewerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const papers = await PaperModel.find({ assignedReviewers: reviewerId }).sort({ createdAt: -1 }).lean();
    return res.json(papers);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load assigned papers', error });
  }
};

export const getReviewerDashboard = async (req: Request, res: Response) => {
  try {
    const reviewerId = req.user?.id;
    if (!reviewerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const assignedPapers = await PaperModel.find({ assignedReviewers: reviewerId }).sort({ createdAt: -1 }).lean();
    const completedReviews = await ReviewModel.find({ reviewerId }).sort({ createdAt: -1 }).lean();

    const pendingReviews = assignedPapers.filter((paper) => !paper.reviews.some((review) => review.reviewerId === reviewerId));

    return res.json({
      assignedPapers,
      completedReviews,
      pendingReviews,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load reviewer dashboard', error });
  }
};
