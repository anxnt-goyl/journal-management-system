import { Request, Response } from 'express';
import { PaperModel } from '../models/Paper';
import { UserModel } from '../models/User';
import { IssueModel } from '../models/Issue';

export const getStats = async (_req: Request, res: Response) => {
  try {
    const [papersSubmittedTotal, papersPublishedTotal, activeReviewers, volumeNumbers, decidedPapers] =
      await Promise.all([
        PaperModel.countDocuments({}),
        PaperModel.countDocuments({ status: 'published' }),
        UserModel.countDocuments({ role: 'reviewer' }),
        IssueModel.distinct('volumeNumber'),
        PaperModel.find({ status: { $in: ['accepted', 'published', 'rejected'] } })
          .select('status')
          .lean(),
      ]);

    const decidedCount = decidedPapers.length;
    const acceptedCount = decidedPapers.filter((p) => p.status === 'accepted' || p.status === 'published').length;
    const acceptanceRate = decidedCount > 0 ? Math.round((acceptedCount / decidedCount) * 1000) / 10 : 0;

    // Average turnaround from submission to first review, in days.
    const papersWithReviews = await PaperModel.find({ 'reviews.0': { $exists: true } })
      .select('createdAt reviews.submittedAt')
      .lean();

    let averageReviewDays = 0;
    if (papersWithReviews.length > 0) {
      const totalDays = papersWithReviews.reduce((sum, paper: any) => {
        const firstReviewDate = paper.reviews
          .map((r: any) => new Date(r.submittedAt).getTime())
          .sort((a: number, b: number) => a - b)[0];
        const submittedDate = new Date(paper.createdAt).getTime();
        const diffDays = Math.max(0, (firstReviewDate - submittedDate) / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      averageReviewDays = Math.round(totalDays / papersWithReviews.length);
    }

    // Impact factor and h-index are standard bibliometric measures that
    // require tracking external citations over multiple years — this app
    // doesn't ingest citation data, so there is no honest way to compute
    // them yet. We report them as 0 rather than fabricate a number, and the
    // frontend should treat 0 here as "not yet available" rather than a real
    // score. Wiring these up for real would mean integrating a citation
    // index (e.g. Crossref/OpenAlex) — a good follow-up, not something to
    // fake with a placeholder formula.
    const impactFactor = 0;
    const hIndex = 0;

    res.json({
      impactFactor,
      hIndex,
      acceptanceRate,
      averageReviewDays,
      papersSubmittedTotal,
      papersPublishedTotal,
      activeReviewers,
      volumesCount: volumeNumbers.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load statistics', error });
  }
};
