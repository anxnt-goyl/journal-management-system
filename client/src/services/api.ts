import { Paper, User, Review } from '../types';

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

export async function publishPaperOnBackend(paperId: string, token: string | null): Promise<Paper> {
  const data = await authedJson<any>(`/admin/papers/${paperId}/publish`, token, {
    method: 'PATCH',
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

export async function registerWithBackend(name: string, email: string, password: string, institution: string, role: string) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, institution, role }),
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
