export const seedUsers = [
  {
    name: 'Dr. Emily Harrison',
    email: 'emily.h@university.edu',
    role: 'author',
    institution: 'Department of Computer Science, Stanford University',
    bio: 'Associate Professor specializing in Neural Architectures, Generative AI, and Intelligent Systems.',
    publicationsCount: 14,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Prof. Marcus Vance',
    email: 'marcus.v@oxford.ac.uk',
    role: 'reviewer',
    institution: 'Oxford e-Research Centre, University of Oxford',
    bio: 'Lead researcher in high-performance computing, quantum computing architectures, and cryptographic structures.',
    specialty: ['Quantum Computing', 'Cryptography', 'Parallel Systems'],
    publicationsCount: 42,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Prof. Alistair Sterling',
    email: 'a.sterling@nature-jms.org',
    role: 'admin',
    institution: 'Editor-in-Chief, Journal of Modern Science',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

export const seedPapers = [
  {
    title: 'Deep Quantum Convolutional Networks for Molecular Docking Predictions',
    abstract: 'This paper introduces a hybrid classical-quantum framework for accelerated docking predictions.',
    keywords: ['Quantum Machine Learning', 'Drug Discovery', 'Neural Networks'],
    authors: [
      { name: 'Dr. Emily Harrison', email: 'emily.h@university.edu', institution: 'Stanford University', isCorresponding: true },
    ],
    submittedBy: 'seed-user-author',
    status: 'published',
    category: 'Computer Science & AI',
    volume: '12',
    issue: '2',
    doi: '10.5555/jms.2026.12.2.1',
    assignedReviewers: ['seed-user-reviewer'],
    reviews: [],
    fileName: 'dqcnn_docking_v3.pdf',
    fileSize: '2.4 MB',
  },
];

export const seedIssues = [
  {
    volumeNumber: 12,
    issueNumber: 2,
    year: 2026,
    month: 'June',
    title: 'Emergent Fields in Artificial Intelligence & Biospheres',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80',
    status: 'published',
    description: 'A comprehensive issue presenting advanced research in quantum-inspired deep learning models and biosphere systems.',
    papersCount: 1,
  },
];

export const seedAnnouncements = [
  {
    title: 'Call for Papers: Special Issue on Generative AI and Cognitive Architectures',
    content: 'We invite original research submissions for our upcoming Special Issue focusing on Generative AI, foundational models, cognitive alignment, and socio-ethical impacts.',
    category: 'call_for_papers',
    publishedAt: new Date('2026-06-15T10:00:00Z'),
    isFeatured: true,
  },
];
