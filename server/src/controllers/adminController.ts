import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { PaperModel } from '../models/Paper';
import { ReviewerAssignmentModel } from '../models/ReviewerAssignment';
import { createNotification } from '../utils/notifications';
import { sendMail } from '../utils/mailer';

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find({}).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load users', error });
  }
};

export const getAdminDashboard = async (_req: Request, res: Response) => {
  try {
    const [totalPapers, publishedPapers, authors, reviewers] = await Promise.all([
      PaperModel.countDocuments(),
      PaperModel.countDocuments({ status: 'published' }),
      UserModel.countDocuments({ role: 'author' }),
      UserModel.countDocuments({ role: 'reviewer' }),
    ]);

    return res.json({
      totalPapers,
      publishedPapers,
      authors,
      reviewers,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load admin dashboard', error });
  }
};

export const assignReviewer = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { paperId, reviewerId, note } = req.body;
    if (!paperId || !reviewerId) {
      return res.status(400).json({ message: 'paperId and reviewerId are required' });
    }

    const paper = await PaperModel.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const existingAssignment = await ReviewerAssignmentModel.findOne({ paperId, reviewerId });
    if (existingAssignment) {
      return res.status(409).json({ message: 'Reviewer already assigned to this paper' });
    }

    const assignment = await ReviewerAssignmentModel.create({
      paperId,
      reviewerId,
      assignedBy: adminId,
      note,
      status: 'pending',
    });

    if (!paper.assignedReviewers.includes(reviewerId)) {
      paper.assignedReviewers.push(reviewerId);
    }

    paper.status = 'under_review';
    await paper.save();

    await createNotification({
      type: 'reviewer_assigned',
      recipientId: reviewerId,
      paperId: paper._id.toString(),
      paperTitle: paper.title,
    });

    const reviewer = await UserModel.findById(reviewerId).lean();
    if (reviewer?.email) {
      await sendMail({
        to: reviewer.email,
        subject: 'You have been assigned as a reviewer',
        html: `<p>You have been assigned to review paper <strong>${paper.title}</strong>.</p>`,
      });
    }

    return res.status(201).json({
      message: 'Reviewer assigned successfully',
      assignment,
      paper,
      notification: {
        reviewerId,
        paperId,
        message: `You have been assigned to review paper "${paper.title}"`,
        type: 'review_assignment',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to assign reviewer', error });
  }
};

export const publishPaper = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { paperId } = req.params;
    const paper = await PaperModel.findById(paperId);

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    if (paper.status !== 'accepted') {
      return res.status(400).json({
        message: `Only accepted papers can be published (current status: ${paper.status}).`,
      });
    }

    paper.status = 'published';
    await paper.save();

    await createNotification({
      type: 'paper_published',
      recipientId: paper.submittedBy,
      paperId: paper._id.toString(),
      paperTitle: paper.title,
    });

    const authorForPublish = await UserModel.findById(paper.submittedBy).lean();
    if (authorForPublish?.email) {
      await sendMail({
        to: authorForPublish.email,
        subject: 'Your paper has been published',
        html: `<p>Your paper <strong>${paper.title}</strong> has been published.</p>`,
      });
    }

    return res.json({ message: 'Paper published successfully', paper });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to publish paper', error });
  }
};
