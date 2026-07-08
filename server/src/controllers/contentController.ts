import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { PaperModel } from '../models/Paper';
import { IssueModel } from '../models/Issue';
import { AnnouncementModel } from '../models/Announcement';
import { ReviewModel } from '../models/Review';
import { ReviewerAssignmentModel } from '../models/ReviewerAssignment';
import { NotificationModel } from '../models/Notification';
import { createNotification } from '../utils/notifications';
import { sendMail } from '../utils/mailer';

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

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

export const getAuthorDashboard = async (req: Request, res: Response) => {
  try {
    const authorId = req.user?.id;
    if (!authorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const papers = await PaperModel.find({ submittedBy: authorId }).sort({ createdAt: -1 }).lean();

    const submissionStatus = papers.map((paper) => ({
      title: paper.title,
      status: paper.status,
      updatedAt: (paper as any).updatedAt ?? (paper as any).createdAt ?? new Date(),
    }));

    const reviewerComments = papers.flatMap((paper) =>
      paper.reviews.map((review) => ({
        paperTitle: paper.title,
        reviewerName: review.reviewerName,
        recommendation: review.recommendation,
        commentsForAuthor: review.commentsForAuthor,
        submittedAt: review.submittedAt,
      }))
    );

    return res.json({
      myPapers: papers,
      submissionStatus,
      reviewerComments,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load author dashboard', error });
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

export const getPapers = async (_req: Request, res: Response) => {
  try {
    const papers = await PaperModel.find({}).sort({ createdAt: -1 }).lean();
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load papers', error });
  }
};

export const searchPapers = async (req: Request, res: Response) => {
  try {
    const { title, author, keywords, category, year, volume, issue } = req.query;

    const filter: Record<string, unknown> = {};

    if (typeof title === 'string' && title.trim()) {
      filter.title = { $regex: title.trim(), $options: 'i' };
    }

    if (typeof author === 'string' && author.trim()) {
      filter.authors = { $elemMatch: { name: { $regex: author.trim(), $options: 'i' } } };
    }

    if (typeof keywords === 'string' && keywords.trim()) {
      const keywordList = keywords.split(',').map((item) => item.trim()).filter(Boolean);
      if (keywordList.length) {
        filter.keywords = { $in: keywordList.map((item) => new RegExp(item, 'i')) };
      }
    }

    if (typeof category === 'string' && category.trim()) {
      filter.category = { $regex: category.trim(), $options: 'i' };
    }

    if (typeof year === 'string' && year.trim()) {
      filter.year = year.trim();
    }

    if (typeof volume === 'string' && volume.trim()) {
      filter.volume = { $regex: volume.trim(), $options: 'i' };
    }

    if (typeof issue === 'string' && issue.trim()) {
      filter.issue = { $regex: issue.trim(), $options: 'i' };
    }

    const papers = await PaperModel.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(papers);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to search papers', error });
  }
};

export const createPaper = async (req: RequestWithFile, res: Response) => {
  try {
    const paperPayload: Record<string, unknown> = { ...req.body };

    if (req.body.authors && typeof req.body.authors === 'string') {
      try {
        paperPayload.authors = JSON.parse(req.body.authors as string);
      } catch {
        paperPayload.authors = [];
      }
    }

    if (req.file) {
      const uploadedFile = await import('../utils/cloudinary').then((module) => module.uploadBufferToCloudinary(req.file!.buffer, req.file!.originalname));

      paperPayload.fileName = req.file.originalname;
      paperPayload.filePath = uploadedFile.secure_url;
      paperPayload.fileSize = `${req.file.size}`;
      paperPayload.fileType = req.file.mimetype;
    }

    const paper = await PaperModel.create(paperPayload);

    if (paper.submittedBy) {
      await createNotification({
        type: 'paper_submitted',
        recipientId: paper.submittedBy,
        paperId: paper._id.toString(),
        paperTitle: paper.title,
      });

      const author = await UserModel.findById(paper.submittedBy).lean();
      if (author?.email) {
        await sendMail({
          to: author.email,
          subject: 'Paper submitted successfully',
          html: `<p>Your paper <strong>${paper.title}</strong> was submitted successfully.</p>`,
        });
      }
    }

    res.status(201).json(paper);
  } catch (error) {
    res.status(400).json({ message: 'Unable to create paper', error });
  }
};

export const createRevision = async (req: RequestWithFile, res: Response) => {
  try {
    const authorId = req.user?.id;
    const authorRole = req.user?.role;

    if (!authorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { paperId } = req.params;
    const originalPaper = await PaperModel.findById(paperId);

    if (!originalPaper) {
      return res.status(404).json({ message: 'Original paper not found' });
    }

    if (originalPaper.submittedBy !== authorId && authorRole !== 'admin') {
      return res.status(403).json({ message: 'You can only revise your own submissions' });
    }

    const revisionPayload: Record<string, unknown> = {
      title: req.body.title || originalPaper.title,
      abstract: req.body.abstract || originalPaper.abstract,
      keywords: req.body.keywords ? JSON.parse(req.body.keywords as string) : originalPaper.keywords,
      authors: req.body.authors ? JSON.parse(req.body.authors as string) : originalPaper.authors,
      submittedBy: originalPaper.submittedBy,
      category: req.body.category || originalPaper.category,
      parentPaperId: originalPaper._id.toString(),
      revisionOf: originalPaper._id.toString(),
      version: (originalPaper.version || 1) + 1,
      status: 'resubmitted',
      assignedReviewers: [],
      reviews: [],
    };

    if (req.file) {
      const uploadedFile = await import('../utils/cloudinary').then((module) => module.uploadBufferToCloudinary(req.file!.buffer, req.file!.originalname));

      revisionPayload.fileName = req.file.originalname;
      revisionPayload.filePath = uploadedFile.secure_url;
      revisionPayload.fileSize = `${req.file.size}`;
      revisionPayload.fileType = req.file.mimetype;
    }

    const revisionPaper = await PaperModel.create(revisionPayload);

    await createNotification({
      type: 'revision_required',
      recipientId: originalPaper.submittedBy,
      paperId: revisionPaper._id.toString(),
      paperTitle: revisionPaper.title,
    });

    const authorForRevision = await UserModel.findById(originalPaper.submittedBy).lean();
    if (authorForRevision?.email) {
      await sendMail({
        to: authorForRevision.email,
        subject: 'Revision requested for your paper',
        html: `<p>Your paper <strong>${revisionPaper.title}</strong> requires revision before further review.</p>`,
      });
    }

    return res.status(201).json({
      message: 'Revision submitted successfully',
      paper: revisionPaper,
      originalPaperId: originalPaper._id,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create paper revision', error });
  }
};

export const getIssues = async (_req: Request, res: Response) => {
  try {
    const issues = await IssueModel.find({}).sort({ year: -1, issueNumber: -1 }).lean();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load issues', error });
  }
};

export const getAnnouncements = async (_req: Request, res: Response) => {
  try {
    const announcements = await AnnouncementModel.find({}).sort({ publishedAt: -1 }).lean();
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load announcements', error });
  }
};

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
