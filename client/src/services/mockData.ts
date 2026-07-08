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
const API_BASE_URL = '/api';

let hasSyncedUsers = false;
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

function syncFromApiOnce<T>(path: string, key: string, fallback: T, flagRef: { current: boolean }) {
  if (flagRef.current) {
    return;
  }

  flagRef.current = true;
  void requestJson<T>(path).then((data) => {
    if (data) {
      writeStorage(key, data);
    }
  });
}

// 1. Initial Mock Users
const INITIAL_USERS: User[] = [
  {
    id: 'user_author_1',
    name: 'Dr. Emily Harrison',
    email: 'emily.h@university.edu',
    role: 'author',
    institution: 'Department of Computer Science, Stanford University',
    bio: 'Associate Professor specializing in Neural Architectures, Generative AI, and Intelligent Systems.',
    publicationsCount: 14,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_reviewer_1',
    name: 'Prof. Marcus Vance',
    email: 'marcus.v@oxford.ac.uk',
    role: 'reviewer',
    institution: 'Oxford e-Research Centre, University of Oxford',
    bio: 'Lead researcher in high-performance computing, quantum computing architectures, and cryptographic structures.',
    specialty: ['Quantum Computing', 'Cryptography', 'Parallel Systems'],
    publicationsCount: 42,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_reviewer_2',
    name: 'Dr. Kenji Tanaka',
    email: 'k.tanaka@tokyotech.ac.jp',
    role: 'reviewer',
    institution: 'Tokyo Institute of Technology',
    bio: 'Expert in Climate Modeling, Sustainable Development, and Environmental Engineering.',
    specialty: ['Climate Systems', 'Socio-Ecological Systems', 'Deep Learning'],
    publicationsCount: 29,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_admin_1',
    name: 'Prof. Alistair Sterling',
    email: 'a.sterling@nature-jms.org',
    role: 'admin',
    institution: 'Editor-in-Chief, Journal of Modern Science',
    bio: 'Distinguished Fellow of the IEEE and Royal Society of Chemistry. Veteran editor with 20+ years of academic publishing experience.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
];

// 2. Initial Mock Announcements
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Call for Papers: Special Issue on Generative AI and Cognitive Architectures',
    content: 'We invite original research submissions for our upcoming Special Issue focusing on Generative AI, foundational models, cognitive alignment, and socio-ethical impacts. Submissions are peer-reviewed on an accelerated timeline. Submission deadline: September 30, 2026.',
    category: 'call_for_papers',
    publishedAt: '2026-06-15T10:00:00Z',
    isFeatured: true
  },
  {
    id: 'ann_2',
    title: 'Journal of Modern Science Indexed in Web of Science and Scopus',
    content: 'We are pleased to announce that the Journal of Modern Science has been formally accepted for inclusion in Clarivate Web of Science (Science Citation Index Expanded) and Scopus. This achievement reflects our commitment to publishing peer-reviewed research of the highest caliber.',
    category: 'news',
    publishedAt: '2026-05-20T14:30:00Z',
    isFeatured: false
  },
  {
    id: 'ann_3',
    title: 'Call for Papers: Sustainable Biotechnology and Bio-Circular Economy',
    content: 'This special issue aims to gather pioneering papers addressing climate resilience through green biochemistry, waste-to-energy pathways, and synthetic biology. Guest Editors: Dr. Kenji Tanaka and Prof. Chloe Dubois.',
    category: 'call_for_papers',
    publishedAt: '2026-06-01T08:00:00Z',
    isFeatured: false
  },
  {
    id: 'ann_4',
    title: 'Upcoming Virtual Academic Symposium and Editorial Board Panel',
    content: 'Join us on July 25, 2026, for our annual virtual symposium. Learn about modern editorial standards, peer-review training, and a keynote address by our Editor-in-Chief Alistair Sterling on "The Future of Open Access and Research Integrity."',
    category: 'event',
    publishedAt: '2026-06-28T09:15:00Z',
    isFeatured: false
  }
];

// 3. Initial Mock Issues
const INITIAL_ISSUES: JournalIssue[] = [
  {
    id: 'issue_1',
    volumeNumber: 12,
    issueNumber: 2,
    year: 2026,
    month: 'June',
    title: 'Emergent Fields in Artificial Intelligence & Biospheres',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80',
    status: 'published',
    publishedAt: '2026-06-10T12:00:00Z',
    description: 'A comprehensive issue presenting advanced research in quantum-inspired deep learning models, biodegradable micro-grids, and deep-ocean climate monitoring arrays.',
    papersCount: 4
  },
  {
    id: 'issue_2',
    volumeNumber: 12,
    issueNumber: 1,
    year: 2026,
    month: 'March',
    title: 'Nanomaterials and Autonomous Cryptographic Systems',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    status: 'published',
    publishedAt: '2026-03-15T12:00:00Z',
    description: 'Highlighting cutting-edge research in carbon nanotube electrical pathways and homomorphic cryptographic lattices suitable for Internet-of-Things (IoT) edge devices.',
    papersCount: 3
  },
  {
    id: 'issue_3',
    volumeNumber: 11,
    issueNumber: 4,
    year: 2025,
    month: 'December',
    title: 'Socio-Ecological Resilience and Climate Geodesics',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80',
    status: 'published',
    publishedAt: '2025-12-20T12:00:00Z',
    description: 'Focusing on algorithmic modeling of coastal siltation, urban heat mitigation grids, and the socio-economic impacts of clean transition carbon pricing frameworks.',
    papersCount: 3
  }
];

// 4. Initial Mock Papers
const INITIAL_PAPERS: Paper[] = [
  {
    id: 'paper_1',
    title: 'Deep Quantum Convolutional Networks for Molecular Docking Predictions',
    abstract: 'Predicting small-molecule docking onto protein targets remains a computational bottleneck in virtual screening. In this work, we present a hybrid classical-quantum framework utilizing Deep Quantum Convolutional Neural Networks (DQCNNs). We demonstrate that parameterized quantum circuits running on 16-qubit superconducting processors can capture multi-body electronic interactions with 84% lower sample complexity than equivalent classical graph neural networks. The proposed architecture is validated on the PDBbind database, demonstrating significant performance improvements in high-affinity candidate discovery.',
    keywords: ['Quantum Machine Learning', 'Drug Discovery', 'Neural Networks', 'Molecular Docking'],
    category: 'Computer Science & AI',
    submittedBy: 'user_author_1',
    authors: [
      { name: 'Dr. Emily Harrison', email: 'emily.h@university.edu', institution: 'Stanford University', isCorresponding: true },
      { name: 'Dr. Charles Fletcher', email: 'c.fletcher@mit.edu', institution: 'Massachusetts Institute of Technology', isCorresponding: false }
    ],
    status: 'published',
    submittedAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-06-08T15:00:00Z',
    volume: '12',
    issue: '2',
    doi: '10.5555/jms.2026.12.2.1',
    assignedReviewers: ['user_reviewer_1'],
    reviews: [
      {
        id: 'rev_1',
        paperId: 'paper_1',
        reviewerId: 'user_reviewer_1',
        reviewerName: 'Prof. Marcus Vance',
        recommendation: 'accept',
        originalityRating: 5,
        methodologyRating: 5,
        significanceRating: 4,
        commentsForAuthor: 'This is a stellar, forward-thinking paper. The integration of parameterized quantum circuits for graph representation of protein targets is highly original and thoroughly detailed.',
        commentsForEditor: 'Strong accept. Extremely high technical quality. Standard setting for future virtual screening research.',
        submittedAt: '2026-05-12T11:00:00Z'
      }
    ],
    fileName: 'dqcnn_docking_v3.pdf',
    fileSize: '2.4 MB'
  },
  {
    id: 'paper_2',
    title: 'Spatio-Temporal Analysis of Coastal Aquifer Salinization Using Deep LSTM Arrays',
    abstract: 'Coastal groundwater basins suffer from accelerated saltwater intrusion due to rising sea levels and intense agricultural extraction. We implement a recurrent spatial neural network utilizing Long Short-Term Memory (LSTM) cells coupled with hydrodynamic models to simulate and predict salinization trends in the San Joaquin Delta. Feeding 24 years of daily sensor telemetry, our models predict saltwater encroachment boundaries up to 180 days in advance with a root-mean-square error of 1.2 ppt. These results provide regional water author boards with actionable mitigation timelines.',
    keywords: ['Climate Systems', 'Hydrology', 'LSTM Networks', 'Socio-Ecological Systems'],
    category: 'Environmental Engineering',
    submittedBy: 'user_author_1',
    authors: [
      { name: 'Dr. Emily Harrison', email: 'emily.h@university.edu', institution: 'Stanford University', isCorresponding: true }
    ],
    status: 'under_review',
    submittedAt: '2026-05-15T14:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
    assignedReviewers: ['user_reviewer_2'],
    reviews: [],
    fileName: 'coastal_salinization_final.pdf',
    fileSize: '3.1 MB'
  },
  {
    id: 'paper_3',
    title: 'Decentralized Consensus Mechanism for Zero-Knowledge IoT Smart Grids',
    abstract: 'Traditional microgrid administration relies on centralized clearinghouses, introducing single points of failure and security concerns. We propose an alternative: a decentralized consensus protocol called Proof-of-Attestation (PoA) operating on resource-constrained IoT nodes. By leveraging recursive zero-knowledge succinct non-interactive arguments of knowledge (zk-SNARKs), our design aggregates state proofs into a single verifiable chain block. Over a benchmark of 2,000 smart meters, transaction validation was achieved in under 1.8 seconds while using 45% less power than typical proof-of-stake networks.',
    keywords: ['Smart Grids', 'IoT Security', 'zk-SNARKs', 'Blockchain'],
    category: 'Electrical Engineering & IoT',
    submittedBy: 'user_author_1',
    authors: [
      { name: 'Dr. Emily Harrison', email: 'emily.h@university.edu', institution: 'Stanford University', isCorresponding: true },
      { name: 'Prof. Li Wei', email: 'li.wei@tsinghua.edu.cn', institution: 'Tsinghua University', isCorresponding: false }
    ],
    status: 'revision_requested',
    submittedAt: '2026-04-10T08:30:00Z',
    updatedAt: '2026-05-25T16:45:00Z',
    assignedReviewers: ['user_reviewer_1'],
    reviews: [
      {
        id: 'rev_2',
        paperId: 'paper_3',
        reviewerId: 'user_reviewer_1',
        reviewerName: 'Prof. Marcus Vance',
        recommendation: 'minor_revision',
        originalityRating: 4,
        methodologyRating: 3,
        significanceRating: 4,
        commentsForAuthor: 'The concept of zk-SNARK aggregation for IoT meters is robust. However, the author needs to elaborate on the hardware constraints of the target smart meters. Running zk-proving loops on Cortex-M4 CPUs is highly intense; please provide energy profiling measurements or simulated execution cycles.',
        commentsForEditor: 'Minor revision. The mathematical proofs are correct, but practical feasibility on ultra-low-power microcontrollers must be clarified.',
        submittedAt: '2026-05-20T10:15:00Z'
      }
    ],
    fileName: 'zk_iot_grid_draft.pdf',
    fileSize: '1.8 MB'
  },
  {
    id: 'paper_4',
    title: 'Optimal Placement of Micro-Hydroelectric Power Inlets in Mountainous Irrigation Channels',
    abstract: 'Small-scale run-of-the-river power plants in remote farming regions offer sustainable energy alternatives. We mathematically model the hydrodynamic optimization of water-intake structures placed in steep agricultural channels. Through multi-objective genetic algorithm runs (NSGA-II), we maximize hydraulic head and sediment separation simultaneously. Field simulations in the Swiss Alps indicate our optimized designs yield a 14% power output increase and cut sand dredging requirements by half.',
    keywords: ['Hydroelectric Power', 'Hydrodynamics', 'Genetic Algorithms', 'Agriculture'],
    category: 'Civil & Mechanical Engineering',
    submittedBy: 'author_john_doe', // Custom mock ID
    authors: [
      { name: 'Dr. John Doe', email: 'john.doe@bern.ch', institution: 'University of Bern', isCorresponding: true }
    ],
    status: 'published',
    submittedAt: '2026-02-12T11:00:00Z',
    updatedAt: '2026-06-08T15:00:00Z',
    volume: '12',
    issue: '2',
    doi: '10.5555/jms.2026.12.2.4',
    assignedReviewers: [],
    reviews: [],
    fileName: 'micro_hydro_optimization.pdf',
    fileSize: '1.5 MB'
  },
  {
    id: 'paper_5',
    title: 'Biodegradable Zinc-Air Micro-Batteries for Wearable Epidermal Bio-Sensors',
    abstract: 'Electronic waste from single-use biomedical diagnostic sensors presents a growing ecological challenge. In this paper, we demonstrate a fully biodegradable, lightweight zinc-air micro-battery printed entirely on cellulose sheets. Utilizing gelatinized chitosan as a solid electrolyte, the battery sustains a stable voltage of 1.2V with a specific capacity of 140 mAh/g. The battery dissolves under soil moisture exposure in less than 45 days, creating zero toxic heavy metal runoff.',
    keywords: ['Bio-Sensors', 'Zinc-Air Battery', 'Biodegradable Materials', 'Diagnostics'],
    category: 'Materials Science',
    submittedBy: 'author_sara_lee',
    authors: [
      { name: 'Dr. Sarah Lee', email: 'sara.lee@mit.edu', institution: 'MIT', isCorresponding: true }
    ],
    status: 'published',
    submittedAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-06-08T15:00:00Z',
    volume: '12',
    issue: '2',
    doi: '10.5555/jms.2026.12.2.5',
    assignedReviewers: [],
    reviews: [],
    fileName: 'biodegradable_zinc_air.pdf',
    fileSize: '4.2 MB'
  }
];

// 5. Initial Mock Statistics
const INITIAL_STATS: JournalStats = {
  impactFactor: 6.94,
  hIndex: 72,
  acceptanceRate: 14.8, // %
  averageReviewDays: 38,
  papersSubmittedTotal: 1248,
  papersPublishedTotal: 342,
  activeReviewers: 310,
  volumesCount: 12
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
export function getUsers(): User[] {
  const users = readStorage<User[]>(USERS_KEY, INITIAL_USERS);
  syncFromApiOnce<User[]>( '/users', USERS_KEY, INITIAL_USERS, { current: hasSyncedUsers });
  hasSyncedUsers = true;
  return users;
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
  syncFromApiOnce<Paper[]>('/papers', PAPERS_KEY, INITIAL_PAPERS, { current: hasSyncedPapers });
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
