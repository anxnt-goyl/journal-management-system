/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Paper, JournalIssue, Announcement, JournalStats, User, Review } from '../types';

// Storage Keys
const STORAGE_PREFIX = 'jms_';
const PAPERS_KEY = `${STORAGE_PREFIX}papers`;
const ISSUES_KEY = `${STORAGE_PREFIX}issues`;
const ANNOUNCEMENTS_KEY = `${STORAGE_PREFIX}announcements`;
const USERS_KEY = `${STORAGE_PREFIX}users`;
const STATS_KEY = `${STORAGE_PREFIX}stats`;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

let hasSyncedPapers = false;
let hasSyncedIssues = false;
let hasSyncedAnnouncements = false;

async function requestJson<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`API request failed for ${path}:`, error);
    return null;
  }
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(key);
  if (!storedValue) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

// The backend returns Mongo documents (id lives in `_id`, not `id`). Anything
// read straight off the wire and pushed into localStorage needs this
// normalization — otherwise every list that keys off `.id` (papers,
// announcements, issues, etc.) ends up with `undefined` keys for every synced
// item, which triggers React's "duplicate/missing key" warning and breaks
// id-based lookups like getPaperById.
function normalizeSyncedId<T extends { id?: string; _id?: string }>(raw: T): T {
  if (raw && typeof raw === 'object' && !raw.id && raw._id) {
    return { ...raw, id: raw._id };
  }
  return raw;
}

function syncFromApiOnce<T>(path: string, key: string, fallback: T, flagRef: { current: boolean }) {
  if (flagRef.current) {
    return;
  }

  flagRef.current = true;
  void requestJson<T>(path).then((data) => {
    if (Array.isArray(data)) {
      writeStorage(key, data.map(normalizeSyncedId) as unknown as T);
    } else if (data) {
      writeStorage(key, data);
    }
  });
}


// No demo/seed content ships to production — a fresh deployment starts empty.
// Real users register themselves; real papers/issues/announcements are created
// through the app once it's live. (Issues/Announcements still persist to
// localStorage rather than MongoDB — see README for the follow-up needed to
// move those to real backend-managed collections.)
const INITIAL_USERS: User[] = [];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

const INITIAL_ISSUES: JournalIssue[] = [];

const INITIAL_PAPERS: Paper[] = [];

const INITIAL_STATS: JournalStats = {
  impactFactor: 0,
  hIndex: 0,
  acceptanceRate: 0,
  averageReviewDays: 0,
  papersSubmittedTotal: 0,
  papersPublishedTotal: 0,
  activeReviewers: 0,
  volumesCount: 0
};

// --- DATA ACCESS & SIMULATION HELPER FUNCTIONS ---

export function initializeStorage() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(PAPERS_KEY)) {
    localStorage.setItem(PAPERS_KEY, JSON.stringify(INITIAL_PAPERS));
  }
  if (!localStorage.getItem(ISSUES_KEY)) {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(INITIAL_ISSUES));
  }
  if (!localStorage.getItem(ANNOUNCEMENTS_KEY)) {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem(STATS_KEY)) {
    localStorage.setItem(STATS_KEY, JSON.stringify(INITIAL_STATS));
  }
}

// Ensure database is initialized
initializeStorage();

// User APIs
// Note: user directory is intentionally NOT synced from the backend here.
// /api/users is admin-only; hitting it from public/unauthenticated pages
// only produced console noise (401s) and had no legitimate use case.
export function getUsers(): User[] {
  return readStorage<User[]>(USERS_KEY, INITIAL_USERS);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function updateUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

// Paper APIs
export function getPapers(): Paper[] {
  const papers = readStorage<Paper[]>(PAPERS_KEY, INITIAL_PAPERS);
  syncFromApiOnce<Paper[]>('/papers/published', PAPERS_KEY, INITIAL_PAPERS, { current: hasSyncedPapers });
  hasSyncedPapers = true;
  return papers;
}

export function getPaperById(id: string): Paper | undefined {
  return getPapers().find(p => p.id === id);
}

export function createPaper(paper: Omit<Paper, 'id' | 'submittedAt' | 'updatedAt' | 'reviews' | 'assignedReviewers'>): Paper {
  const papers = getPapers();
  const newPaper: Paper = {
    ...paper,
    id: `paper_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedReviewers: [],
    reviews: []
  };
  papers.push(newPaper);
  localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
  void requestJson<Paper>('/papers', {
    method: 'POST',
    body: JSON.stringify(newPaper)
  });

  // Update stats
  const stats = getStats();
  stats.papersSubmittedTotal += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));

  return newPaper;
}

export function updatePaper(paper: Paper): void {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === paper.id);
  if (index !== -1) {
    papers[index] = {
      ...paper,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
  }
}

export function deletePaper(id: string): void {
  const papers = getPapers().filter(p => p.id !== id);
  localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
}

// Reviews APIs
export function submitReview(paperId: string, review: Omit<Review, 'id' | 'submittedAt'>): Review {
  const papers = getPapers();
  const paperIndex = papers.findIndex(p => p.id === paperId);
  if (paperIndex === -1) {
    throw new Error('Paper not found');
  }

  const newReview: Review = {
    ...review,
    id: `rev_${Date.now()}`,
    submittedAt: new Date().toISOString()
  };

  const paper = papers[paperIndex];
  paper.reviews = [...(paper.reviews || []), newReview];
  
  // Auto-advance paper status if appropriate, or keep for editor review
  paper.updatedAt = new Date().toISOString();
  
  papers[paperIndex] = paper;
  localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));

  return newReview;
}

// Issues APIs
export function getIssues(): JournalIssue[] {
  const issues = readStorage<JournalIssue[]>(ISSUES_KEY, INITIAL_ISSUES);
  syncFromApiOnce<JournalIssue[]>('/issues', ISSUES_KEY, INITIAL_ISSUES, { current: hasSyncedIssues });
  hasSyncedIssues = true;
  return issues;
}

export function createIssue(issue: Omit<JournalIssue, 'id' | 'papersCount'>): JournalIssue {
  const issues = getIssues();
  const newIssue: JournalIssue = {
    ...issue,
    id: `issue_${Date.now()}`,
    papersCount: 0
  };
  issues.unshift(newIssue);
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  return newIssue;
}

export function updateIssue(issue: JournalIssue): void {
  const issues = getIssues();
  const index = issues.findIndex(i => i.id === issue.id);
  if (index !== -1) {
    issues[index] = issue;
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  }
}

// Announcements APIs
export function getAnnouncements(): Announcement[] {
  const announcements = readStorage<Announcement[]>(ANNOUNCEMENTS_KEY, INITIAL_ANNOUNCEMENTS);
  syncFromApiOnce<Announcement[]>('/announcements', ANNOUNCEMENTS_KEY, INITIAL_ANNOUNCEMENTS, { current: hasSyncedAnnouncements });
  hasSyncedAnnouncements = true;
  return announcements;
}

export function createAnnouncement(ann: Omit<Announcement, 'id' | 'publishedAt'>): Announcement {
  const anns = getAnnouncements();
  const newAnn: Announcement = {
    ...ann,
    id: `ann_${Date.now()}`,
    publishedAt: new Date().toISOString()
  };
  anns.unshift(newAnn);
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(anns));
  return newAnn;
}

// Statistics APIs
export function getStats(): JournalStats {
  return JSON.parse(localStorage.getItem(STATS_KEY) || JSON.stringify(INITIAL_STATS));
}

export function updateStats(stats: JournalStats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
