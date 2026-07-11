import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { PaperModel } from '../models/Paper';
import { ReviewModel } from '../models/Review';
import { createNotification } from '../utils/notifications';
import { sendMail } from '../utils/mailer';

export const submitReview = async (req: Request, res: Response) => {
  try {
    const reviewerId = req.user?.id;
    const reviewerName = req.user?.name;

    if (!reviewerId || !reviewerName) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      paperId,
      recommendation,
      originalityRating,
      methodologyRating,
      significanceRating,
      commentsForAuthor,
      commentsForEditor,
    } = req.body;

    if (!paperId || !recommendation) {
      return res.status(400).json({ message: 'paperId and recommendation are required' });
    }

    const paper = await PaperModel.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const alreadyReviewed = paper.reviews.some((review) => review.reviewerId === reviewerId);
    if (alreadyReviewed) {
      return res.status(409).json({ message: 'You have already submitted a review for this paper' });
    }

    const review = await ReviewModel.create({
      paperId,
      reviewerId,
      reviewerName,
      recommendation,
      originalityRating,
      methodologyRating,
      significanceRating,
      commentsForAuthor,
      commentsForEditor,
    });

    paper.reviews.push({
      reviewerId,
      reviewerName,
      recommendation,
      originalityRating,
      methodologyRating,
      significanceRating,
      commentsForAuthor,
      commentsForEditor,
      submittedAt: new Date(),
    } as any);

    let nextStatus: typeof paper.status = paper.status;
    switch (recommendation) {
      case 'accept':
        nextStatus = 'accepted';
        break;
      case 'minor_revision':
        nextStatus = 'revision_requested';
        break;
      case 'major_revision':
        nextStatus = 'revision_requested';
        break;
      case 'reject':
        nextStatus = 'rejected';
        break;
    }

    paper.status = nextStatus;
    await paper.save();

    const notificationType = nextStatus === 'accepted'
      ? 'paper_accepted'
      : nextStatus === 'rejected'
        ? 'paper_rejected'
        : 'revision_required';

    await createNotification({
      type: notificationType,
      recipientId: paper.submittedBy,
      paperId: paper._id.toString(),
      paperTitle: paper.title,
    });

    const authorForDecision = await UserModel.findById(paper.submittedBy).lean();
    if (authorForDecision?.email) {
      const subject = nextStatus === 'accepted'
        ? 'Your paper has been accepted'
        : nextStatus === 'rejected'
          ? 'Your paper has been rejected'
          : 'Revision requested for your paper';

      const html = nextStatus === 'accepted'
        ? `<p>Your paper <strong>${paper.title}</strong> has been accepted.</p>`
        : nextStatus === 'rejected'
          ? `<p>Your paper <strong>${paper.title}</strong> has been rejected.</p>`
          : `<p>Your paper <strong>${paper.title}</strong> requires revision before further review.</p>`;

      await sendMail({
        to: authorForDecision.email,
        subject,
        html,
      });
    }

    return res.status(201).json({ message: 'Review submitted successfully', review, paper });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to submit review', error });
  }
};
