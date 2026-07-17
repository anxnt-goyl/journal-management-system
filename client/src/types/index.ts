/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'author' | 'reviewer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
  department?: string;
  bio?: string;
  avatar?: string;
  specialty?: string[];
  publicationsCount?: number;
}

export type PaperStatus = 'submitted' | 'under_review' | 'revision_requested' | 'accepted' | 'rejected' | 'published';

export interface AuthorInfo {
  name: string;
  email: string;
  institution: string;
  isCorresponding: boolean;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  authors: AuthorInfo[];
  submittedBy: string; // User ID of primary author
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  status: PaperStatus;
  submittedAt: string;
  updatedAt: string;
  category: string;
  volume?: string;
  issue?: string;
  doi?: string;
  assignedReviewers: string[]; // User IDs of reviewers
  reviews: Review[];
  decisionLetter?: string;
  // Set when this paper is a resubmitted revision of an earlier submission.
  revisionOf?: string;
  parentPaperId?: string;
  version?: number;
}

export interface Review {
  id: string;
  paperId: string;
  reviewerId: string;
  reviewerName: string;
  recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  originalityRating: number; // 1-5
  methodologyRating: number; // 1-5
  significanceRating: number; // 1-5
  commentsForAuthor: string;
  commentsForEditor: string;
  submittedAt: string;
  reportUrl?: string;
}

export interface JournalIssue {
  id: string;
  volumeNumber: number;
  issueNumber: number;
  year: number;
  month: string;
  title?: string;
  coverImage?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  description?: string;
  papersCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'call_for_papers' | 'general' | 'news' | 'event';
  publishedAt: string;
  isFeatured?: boolean;
}

export interface JournalStats {
  impactFactor: number;
  hIndex: number;
  acceptanceRate: number; // percentage
  averageReviewDays: number;
  papersSubmittedTotal: number;
  papersPublishedTotal: number;
  activeReviewers: number;
  volumesCount: number;
}
