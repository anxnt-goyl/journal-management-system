import { Request, Response } from 'express';
import { IssueModel } from '../models/Issue';

export const getIssues = async (_req: Request, res: Response) => {
  try {
    const issues = await IssueModel.find({}).sort({ year: -1, issueNumber: -1 }).lean();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load issues', error });
  }
};
