import { Paper, User, Review, JournalIssue, Announcement, JournalStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizePaper(paper: any): Paper {
  return {
    id: paper._id || paper.id,
    title: paper.title,
    abstract: paper.abstract || '',
    keywords: Array.isArray(paper.keywords) ? paper.keywords : [],
    authors: Array.isArray(paper.authors) ? paper.authors : [],
    submittedBy: paper.submittedBy || '',
    fileUrl: paper.filePath || paper.fileUrl,
    fileName: paper.fileName,
    fileSize: paper.fileSize,
    status: paper.status || 'submitted',
    submittedAt: paper.createdAt || paper.submittedAt || new Date().toISOString(),
    updatedAt: paper.updatedAt || paper.submittedAt || new Date().toISOString(),
    category: paper.category || 'General',
    volume: paper.volume,
    issue: paper.issue,
    doi: paper.doi,
    assignedReviewers: Array.isArray(paper.assignedReviewers) ? paper.assignedReviewers : [],
    reviews: Array.isArray(paper.reviews) ? paper.reviews.map(normalizeReview) : [],
    decisionLetter: paper.decisionLetter,
    revisionOf: paper.revisionOf,
    parentPaperId: paper.parentPaperId,
    version: paper.version,
  };
}

function normalizeReview(review: any): Review {
  return {
    id: review._id || review.id || `${review.paperId}_${review.reviewerId}`,
    paperId: review.paperId,
    reviewerId: review.reviewerId,
    reviewerName: review.reviewerName,
    recommendation: review.recommendation,
    originalityRating: review.originalityRating,
    methodologyRating: review.methodologyRating,
    significanceRating: review.significanceRating,
    commentsForAuthor: review.commentsForAuthor,
    commentsForEditor: review.commentsForEditor,
    submittedAt: review.createdAt || review.submittedAt || new Date().toISOString(),
  };
}

function normalizeUser(u: any): User {
  return {
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    institution: u.institution || '',
    bio: u.bio,
    specialty: u.specialty,
    publicationsCount: u.publicationsCount,
    avatar: u.avatar,
  };
}

async function authedJson<T>(path: string, token: string | null, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request to ${path} failed`);
  }

  return response.json();
}

// The full pool of papers (used by reviewers/admins to see everything, not just their own)
// Public: published papers only, safe for unauthenticated landing/search/current-issue pages
export async function getPublishedPapersFromBackend(): Promise<Paper[]> {
  const payload = await authedJson<any>('/papers/published', null);
  const papers = Array.isArray(payload) ? payload : payload?.papers || [];
  return papers.map(normalizePaper);
}

export async function getAllPapers(token: string | null): Promise<Paper[]> {
  const payload = await authedJson<any>('/papers', token);
  const papers = Array.isArray(payload) ? payload : payload?.papers || [];
  return papers.map(normalizePaper);
}

// Admin-only: full user directory (used to populate the reviewer-assignment dropdown)
export async function getAllUsers(token: string | null): Promise<User[]> {
  const payload = await authedJson<any>('/users', token);
  const users = Array.isArray(payload) ? payload : payload?.users || [];
  return users.map(normalizeUser);
}

export async function assignReviewerToPaper(
  paperId: string,
  reviewerId: string,
  token: string | null
): Promise<void> {
  await authedJson('/admin/reviewer-assignments', token, {
    method: 'POST',
    body: JSON.stringify({ paperId, reviewerId }),
  });
}

export async function publishPaperOnBackend(
  paperId: string,
  token: string | null,
  volumeIssue?: { volume: string; issue: string }
): Promise<Paper> {
  const data = await authedJson<any>(`/admin/papers/${paperId}/publish`, token, {
    method: 'PATCH',
    body: volumeIssue ? JSON.stringify(volumeIssue) : undefined,
  });
  return normalizePaper(data.paper || data);
}

// Reviewer's own workspace: assigned papers + completed/pending reviews
export async function getReviewerDashboardData(token: string | null): Promise<{
  assignedPapers: Paper[];
  completedReviews: Review[];
  pendingReviews: Paper[];
}> {
  const data = await authedJson<any>('/dashboard/reviewer', token);
  return {
    assignedPapers: (data.assignedPapers || []).map(normalizePaper),
    completedReviews: (data.completedReviews || []).map(normalizeReview),
    pendingReviews: (data.pendingReviews || []).map(normalizePaper),
  };
}

export async function submitReviewToBackend(
  payload: {
    paperId: string;
    recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
    originalityRating: number;
    methodologyRating: number;
    significanceRating: number;
    commentsForAuthor: string;
    commentsForEditor: string;
  },
  token: string | null
): Promise<void> {
  await authedJson('/reviewer/reviews', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUserFromBackend(token: string | null): Promise<User | null> {
  if (!token) return null;
  try {
    const data = await authedJson<any>('/auth/me', token);
    return normalizeUser(data.user);
  } catch {
    return null;
  }
}

export async function loginWithBackend(email: string, password: string, role: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Unable to sign in');
  }

  const data = await response.json();
  return {
    token: data.token,
    user: {
      id: data.user?.id || data.user?._id,
      name: data.user?.name,
      email: data.user?.email,
      role: data.user?.role || role,
      institution: data.user?.institution || '',
      avatar: data.user?.avatar,
    } as User,
  };
}

export async function registerWithBackend(
  name: string,
  email: string,
  password: string,
  institution: string,
  role: string,
  avatarFile?: File | null
) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('institution', institution);
  formData.append('role', role);
  if (avatarFile) {
    formData.append('avatar', avatarFile, avatarFile.name);
  }

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Unable to register');
  }

  const data = await response.json();
  return {
    token: data.token,
    user: {
      id: data.user?.id || data.user?._id,
      name: data.user?.name,
      email: data.user?.email,
      role: data.user?.role || role,
      institution: data.user?.institution || institution,
      avatar: data.user?.avatar,
    } as User,
  };
}

export async function fetchMyPapers(token: string | null): Promise<Paper[]> {
  if (!token) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/papers/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to load manuscripts');
  }

  const payload = await response.json();
  const papers = Array.isArray(payload) ? payload : payload?.papers || [];
  return papers.map(normalizePaper);
}

export async function submitPaperToBackend(
  payload: {
    title: string;
    abstract: string;
    category: string;
    keywords: string[];
    authors: Array<{ name: string; email: string; institution: string; isCorresponding: boolean }>;
    submittedBy: string;
    file: File | null;
  },
  token: string | null
) {
  if (!token) {
    throw new Error('You need to sign in before submitting a paper');
  }

  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('abstract', payload.abstract);
  formData.append('category', payload.category);
  formData.append('submittedBy', payload.submittedBy);
  formData.append('keywords', JSON.stringify(payload.keywords));
  formData.append('authors', JSON.stringify(payload.authors));

  if (payload.file) {
    formData.append('file', payload.file, payload.file.name);
  }

  const response = await fetch(`${API_BASE_URL}/papers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Paper submission failed');
  }

  const data = await response.json();
  return normalizePaper(data);
}

// Wires up the previously-unused backend revision endpoint: submits a revised
// PDF (and optionally updated title/abstract/keywords) for a paper that was
// sent back with 'revision_requested'. This creates a new linked paper
// document with status 'resubmitted' so it can go through review again.
export async function submitRevisionToBackend(
  paperId: string,
  file: File,
  token: string | null,
  overrides?: { title?: string; abstract?: string }
) {
  if (!token) {
    throw new Error('You need to sign in before submitting a revision');
  }

  const formData = new FormData();
  formData.append('file', file, file.name);
  if (overrides?.title) formData.append('title', overrides.title);
  if (overrides?.abstract) formData.append('abstract', overrides.abstract);

  const response = await fetch(`${API_BASE_URL}/papers/${paperId}/revise`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Revision submission failed');
  }

  const data = await response.json();
  return normalizePaper(data.paper);
}

// ---------------------------------------------------------------------------
// Issues, Announcements, and Stats — real MongoDB-backed data.
// ---------------------------------------------------------------------------

function normalizeIssue(issue: any): JournalIssue {
  return {
    id: issue._id || issue.id,
    volumeNumber: issue.volumeNumber,
    issueNumber: issue.issueNumber,
    year: issue.year,
    month: issue.month,
    title: issue.title,
    coverImage: issue.coverImage,
    status: issue.status || 'draft',
    publishedAt: issue.publishedAt,
    description: issue.description,
    papersCount: issue.papersCount || 0,
  };
}

function normalizeAnnouncement(ann: any): Announcement {
  return {
    id: ann._id || ann.id,
    title: ann.title,
    content: ann.content,
    category: ann.category || 'general',
    publishedAt: ann.publishedAt,
    isFeatured: Boolean(ann.isFeatured),
  };
}

export async function getIssuesFromBackend(): Promise<JournalIssue[]> {
  const response = await fetch(`${API_BASE_URL}/issues`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeIssue) : [];
}

export async function createIssueOnBackend(
  issue: {
    volumeNumber: number;
    issueNumber: number;
    year: number;
    month: string;
    title?: string;
    description?: string;
    coverImage?: string;
    status?: 'draft' | 'published';
  },
  token: string | null
): Promise<JournalIssue> {
  const data = await authedJson<any>('/issues', token, {
    method: 'POST',
    body: JSON.stringify(issue),
  });
  return normalizeIssue(data);
}

export async function publishIssueOnBackend(issueId: string, token: string | null): Promise<JournalIssue> {
  const data = await authedJson<any>(`/issues/${issueId}/publish`, token, {
    method: 'PATCH',
  });
  return normalizeIssue(data);
}

export async function getAnnouncementsFromBackend(): Promise<Announcement[]> {
  const response = await fetch(`${API_BASE_URL}/announcements`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeAnnouncement) : [];
}

export async function createAnnouncementOnBackend(
  announcement: { title: string; content: string; category: string; isFeatured?: boolean },
  token: string | null
): Promise<Announcement> {
  const data = await authedJson<any>('/announcements', token, {
    method: 'POST',
    body: JSON.stringify(announcement),
  });
  return normalizeAnnouncement(data);
}

export async function getStatsFromBackend(): Promise<JournalStats> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    return {
      impactFactor: 0,
      hIndex: 0,
      acceptanceRate: 0,
      averageReviewDays: 0,
      papersSubmittedTotal: 0,
      papersPublishedTotal: 0,
      activeReviewers: 0,
      volumesCount: 0,
    };
  }
  return response.json();
}
