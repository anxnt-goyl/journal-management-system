import { Request, Response } from 'express';
import { IssueModel } from '../models/Issue';
import { PaperModel } from '../models/Paper';

export const getIssues = async (_req: Request, res: Response) => {
  try {
    const issues = await IssueModel.find({}).sort({ publishedAt: -1, createdAt: -1 }).lean();

    // The stored papersCount is only set once, at issue-creation time — it
    // never updates when a paper gets published into that volume/issue
    // afterward. Recomputing it live here keeps "Articles Count" honest.
    const issuesWithLiveCounts = await Promise.all(
      issues.map(async (issue) => {
        const papersCount = await PaperModel.countDocuments({
          status: 'published',
          volume: String(issue.volumeNumber),
          issue: String(issue.issueNumber),
        });
        return { ...issue, papersCount };
      })
    );

    res.json(issuesWithLiveCounts);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load issues', error });
  }
};

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { volumeNumber, issueNumber, year, month, title, description, coverImage, status } = req.body;

    if (!volumeNumber || !issueNumber || !year || !month) {
      return res.status(400).json({ message: 'volumeNumber, issueNumber, year, and month are required' });
    }

    // papersCount reflects reality (papers already published under this
    // volume/issue) rather than being a manually-tracked counter that can
    // drift out of sync.
    const papersCount = await PaperModel.countDocuments({
      status: 'published',
      volume: String(volumeNumber),
      issue: String(issueNumber),
    });

    const resolvedStatus = status === 'published' ? 'published' : 'draft';

    const issue = await IssueModel.create({
      volumeNumber,
      issueNumber,
      year,
      month,
      title,
      description,
      coverImage,
      status: resolvedStatus,
      publishedAt: resolvedStatus === 'published' ? new Date() : undefined,
      papersCount,
    });

    return res.status(201).json(issue);
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create issue', error });
  }
};

export const publishIssue = async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    const issue = await IssueModel.findById(issueId);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.status = 'published';
    issue.publishedAt = new Date();
    await issue.save();

    return res.json(issue);
  } catch (error) {
    return res.status(400).json({ message: 'Unable to publish issue', error });
  }
};
