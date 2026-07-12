import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { PaperModel } from '../models/Paper';
import { createNotification } from '../utils/notifications';
import { sendMail } from '../utils/mailer';

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

export const getPapers = async (_req: Request, res: Response) => {
  try {
    const papers = await PaperModel.find({}).sort({ createdAt: -1 }).lean();
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load papers', error });
  }
};

// Public: only ever returns papers that have cleared review and been published.
// Safe to expose without authentication (used on the public landing/search pages).
export const getPublishedPapers = async (_req: Request, res: Response) => {
  try {
    const papers = await PaperModel.find({ status: 'published' }).sort({ createdAt: -1 }).lean();
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load published papers', error });
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

// Returns only the papers submitted by the currently logged-in user.
// The generic getPapers() above intentionally returns everything (used by
// reviewers/admins to browse the full pool) — this endpoint is what
// "My Manuscripts" on the author dashboard should actually call.
export const getMyPapers = async (req: Request, res: Response) => {
  try {
    const authorId = req.user?.id;
    if (!authorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const papers = await PaperModel.find({ submittedBy: authorId }).sort({ createdAt: -1 }).lean();
    return res.json(papers);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load your manuscripts', error });
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
