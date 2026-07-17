/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllPapers,
  getAllUsers,
  assignReviewerToPaper,
  publishPaperOnBackend,
  getIssuesFromBackend,
  createIssueOnBackend,
  getAnnouncementsFromBackend,
  createAnnouncementOnBackend,
  getStatsFromBackend,
} from '../services/api';
import { Paper, JournalIssue, Announcement, JournalStats, User } from '../types';
import { Button, Input, StatusChip, useToasts } from '../components/common/UI';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  ShieldAlert,
  Layers,
  Users,
  Settings,
  Plus,
  Trash2,
  Bookmark,
  TrendingUp,
  FileText,
  UserCheck,
  Megaphone,
  BookMarked,
  Star,
  ChevronDown,
  ChevronUp,
  Download,
  MessageSquare
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toasts, addToast, ToastComponent } = useToasts();
  const [activeTab, setActiveTab] = useState<'overview' | 'papers' | 'issues' | 'announcements' | 'settings'>('overview');
  
  // Database States
  const [papers, setPapers] = useState<Paper[]>([]);

  // A resubmitted revision creates a *new* paper document linked back to the
  // original via revisionOf/parentPaperId (see server/paperController.createRevision).
  // Without this, the admin panel showed both the old and new paper as
  // unrelated cards, which looked like a duplicate submission. Here we hide
  // any paper that's been superseded by a newer version and keep only the
  // latest one in the visible list.
  const supersededPaperIds = new Set(
    papers
      .map((p) => p.revisionOf || p.parentPaperId)
      .filter((id): id is string => Boolean(id))
  );
  const visiblePapers = papers.filter((p) => !supersededPaperIds.has(p.id));
  const [issues, setIssues] = useState<JournalIssue[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [reviewers, setReviewers] = useState<User[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);

  // Assignment states
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [expandedReviewsPaperId, setExpandedReviewsPaperId] = useState<string | null>(null);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');

  // New Issue States
  const [volumeNum, setVolumeNum] = useState(12);
  const [issueNum, setIssueNum] = useState(3);
  const [issueYear, setIssueYear] = useState(2026);
  const [issueMonth, setIssueMonth] = useState('September');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');

  // New Announcement States
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'call_for_papers' | 'general' | 'news' | 'event'>('call_for_papers');

  const [isLoadingPapers, setIsLoadingPapers] = useState(true);

  const loadData = async () => {
    try {
      const [fetchedIssues, fetchedAnnouncements, fetchedStats] = await Promise.all([
        getIssuesFromBackend(),
        getAnnouncementsFromBackend(),
        getStatsFromBackend(),
      ]);
      setIssues(fetchedIssues);
      setAnnouncements(fetchedAnnouncements);
      setStats(fetchedStats);
    } catch (error) {
      console.warn('Unable to load issues/announcements/stats from server:', error);
    }

    const token = localStorage.getItem('jms_auth_token');
    setIsLoadingPapers(true);
    try {
      const [allPapers, allUsers] = await Promise.all([
        getAllPapers(token),
        getAllUsers(token),
      ]);
      setPapers(allPapers);
      setReviewers(allUsers.filter(u => u.role === 'reviewer'));
    } catch (error) {
      console.warn('Unable to load editorial data from server:', error);
      addToast('Unable to load manuscripts/reviewers from the server.', 'error');
    } finally {
      setIsLoadingPapers(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [activeTab]);

  // Handle Reviewer Assignment
  const handleAssignReviewer = async (paperId: string) => {
    if (!selectedReviewerId) {
      addToast('Please select a reviewer to assign.', 'error');
      return;
    }

    try {
      await assignReviewerToPaper(paperId, selectedReviewerId, localStorage.getItem('jms_auth_token'));
      addToast('Reviewer successfully assigned! Paper moved to Peer Review.', 'success');
      setSelectedPaperId(null);
      setSelectedReviewerId('');
      await loadData();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to assign reviewer.', 'error');
    }
  };

  // Handle Publish (Editor-in-Chief final decision, once accepted by review)
  const handlePublishPaper = async (paperId: string) => {
    try {
      // The public Current Issue page filters published papers by volume/issue,
      // so publish this paper into whichever issue is currently marked
      // 'published' (falls back to 12/2 if no issue has been created yet,
      // matching the Current Issue page's own default).
      const activeIssue = issues.find((i) => i.status === 'published');
      const volumeIssue = activeIssue
        ? { volume: String(activeIssue.volumeNumber), issue: String(activeIssue.issueNumber) }
        : { volume: '12', issue: '2' };

      await publishPaperOnBackend(paperId, localStorage.getItem('jms_auth_token'), volumeIssue);
      addToast('Manuscript published to the current issue!', 'success');
      await loadData();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to publish paper.', 'error');
    }
  };

  // Handle Create Issue
  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle) {
      addToast('Issue Title is required.', 'error');
      return;
    }

    try {
      await createIssueOnBackend(
        {
          volumeNumber: volumeNum,
          issueNumber: issueNum,
          year: issueYear,
          month: issueMonth,
          title: issueTitle,
          description: issueDesc,
          status: 'published',
          coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
        },
        localStorage.getItem('jms_auth_token')
      );

      addToast(`Volume ${volumeNum}, Issue ${issueNum} published successfully!`, 'success');
      setIssueTitle('');
      setIssueDesc('');
      await loadData();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to create issue.', 'error');
    }
  };

  // Handle Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) {
      addToast('Announcement Title and Content are required.', 'error');
      return;
    }

    try {
      await createAnnouncementOnBackend(
        {
          title: annTitle,
          content: annContent,
          category: annCategory,
          isFeatured: annCategory === 'call_for_papers',
        },
        localStorage.getItem('jms_auth_token')
      );

      addToast('Academic announcement broadcasted successfully!', 'success');
      setAnnTitle('');
      setAnnContent('');
      await loadData();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to create announcement.', 'error');
    }
  };

  return (
    <div className="w-full bg-background-gray min-h-[85vh] flex text-left flex-col md:flex-row">
      {ToastComponent}

      {/* ADMIN DRAWER SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-150 p-6 shrink-0 space-y-8 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Editorial Cabinet</h4>
            <h3 className="font-serif font-black text-lg text-primary">Editor in Chief</h3>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'overview' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5" /> Editorial Overview
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'papers' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4.5 h-4.5" /> Manage Manuscripts ({visiblePapers.length})
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'issues' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Layers className="w-4.5 h-4.5" /> Volumes & Issues
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'announcements' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Megaphone className="w-4.5 h-4.5" /> Call for Papers / News
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'settings' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4.5 h-4.5" /> Settings
            </button>
          </nav>
        </div>

        {/* PROFILE AT BOTTOM */}
        <div className="border-t border-gray-100 pt-4 flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl hidden md:flex">
          <UserAvatar
            name={user?.name}
            avatarUrl={user?.avatar}
            className="w-10 h-10 rounded-full object-cover border border-primary/20 shrink-0"
          />
          <div className="text-left overflow-hidden">
            <h5 className="text-xs font-bold text-gray-800 leading-none truncate">{user?.name}</h5>
            <span className="text-[9px] text-gray-400 block truncate mt-1">Editor-in-Chief</span>
          </div>
        </div>
      </aside>

      {/* CORE WORKSPACE */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* ==========================================
            TAB: OVERVIEW
            ========================================== */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="space-y-1.5">
              <h1 className="font-serif font-black text-2.5xl sm:text-3.5xl text-gray-900 leading-none">Journal Editorial Desk</h1>
              <p className="text-sm text-gray-500">Supervise incoming papers, assign blind reviewers, and publish periodic volumes.</p>
            </div>

            {/* STATS MATRIX CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">Manuscripts submitted</span>
                <span className="text-3xl font-serif font-bold text-primary block mt-1">{papers.length}</span>
              </div>
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">Under review</span>
                <span className="text-3xl font-serif font-bold text-amber-600 block mt-1">
                  {papers.filter(p => p.status === 'under_review').length}
                </span>
              </div>
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">Active Review Board</span>
                <span className="text-3xl font-serif font-bold text-green-600 block mt-1">{reviewers.length} Fellows</span>
              </div>
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">Average decision</span>
                <span className="text-3xl font-serif font-bold text-indigo-600 block mt-1">{stats.averageReviewDays} Days</span>
              </div>
            </div>

            {/* REVENUE / SUBMISSIONS FLOW MOCK D3 CHART AREA */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs text-left space-y-4">
              <h3 className="font-serif font-bold text-base text-gray-900 border-b border-gray-100 pb-2.5">Academic Submission Ingress Trends</h3>
              
              {/* Simulated pure visual vector SVG chart */}
              <div className="w-full h-44 bg-gray-50/50 rounded-xl border border-gray-150 p-4 flex flex-col justify-between">
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>Q1 Submissions Flow</span>
                  <span>Q2 Peer Evaluated Influx</span>
                  <span>Q3 Projected Influx</span>
                </div>
                
                {/* SVG Line & Dots bar representation */}
                <div className="h-24 relative flex items-end">
                  <svg className="w-full h-full text-primary" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <path
                      d="M 0 80 Q 125 40 250 50 T 500 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                    {/* Shadow mesh */}
                    <path
                      d="M 0 80 Q 125 40 250 50 T 500 20 L 500 100 L 0 100 Z"
                      fill="currentColor"
                      className="opacity-5"
                    />
                  </svg>
                  {/* Scatter markers */}
                  <span className="absolute left-[5%] bottom-[15%] w-2.5 h-2.5 rounded-full bg-accent border-2 border-white shadow-xs" title="Vol 11: 42 papers" />
                  <span className="absolute left-[30%] bottom-[50%] w-2.5 h-2.5 rounded-full bg-accent border-2 border-white shadow-xs" />
                  <span className="absolute left-[60%] bottom-[45%] w-2.5 h-2.5 rounded-full bg-accent border-2 border-white shadow-xs" />
                  <span className="absolute left-[95%] bottom-[75%] w-2.5 h-2.5 rounded-full bg-accent border-2 border-white shadow-xs" />
                </div>

                <div className="flex justify-between text-[9px] font-mono text-gray-400 border-t border-gray-100 pt-2">
                  <span>January</span>
                  <span>March</span>
                  <span>May</span>
                  <span>July (Current)</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB: MANAGE MANUSCRIPTS & ASSIGN REVIEWERS
            ========================================== */}
        {activeTab === 'papers' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h1 className="font-serif font-black text-2.5xl text-gray-900 leading-none">Manuscripts Editorial Panel</h1>
              <p className="text-sm text-gray-500 mt-1">Prescreen similarity indexes and assign peer reviewers.</p>
            </div>

            <div className="space-y-4">
              {isLoadingPapers && (
                <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
                  Loading manuscripts from the server...
                </div>
              )}

              {!isLoadingPapers && visiblePapers.map((paper) => (
                <div key={paper.id} className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono bg-primary-cream text-primary border border-primary/5 px-2 py-0.5 rounded font-semibold uppercase">{paper.category}</span>
                      {(paper.version || 1) > 1 && (
                        <span className="text-[10px] font-mono bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded font-semibold uppercase ml-1.5">
                          Revision {paper.version}
                        </span>
                      )}
                      <h3 className="font-serif font-bold text-base sm:text-lg text-gray-900 leading-tight mt-1.5">{paper.title}</h3>
                      <p className="text-xs text-gray-400">Submitted by: {paper.authors[0]?.name} ({paper.authors[0]?.institution}) • ID: {paper.id}</p>
                    </div>
                    <StatusChip status={paper.status} />
                  </div>

                  {/* Reviewer allocation interface */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-left text-xs text-gray-500">
                      <strong>Assigned Reviewers:</strong>{' '}
                      {paper.assignedReviewers.length > 0 ? (
                        <span className="text-primary font-semibold">{paper.assignedReviewers.map(id => reviewers.find(r => r.id === id)?.name || id).join(', ')}</span>
                      ) : (
                        <span className="text-red-500 italic">No reviewers assigned</span>
                      )}
                    </div>

                    {selectedPaperId === paper.id ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                          className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-48 cursor-pointer"
                          value={selectedReviewerId}
                          onChange={(e) => setSelectedReviewerId(e.target.value)}
                        >
                          <option value="">-- Choose Reviewer --</option>
                          {reviewers.map(rev => (
                            <option key={rev.id} value={rev.id}>{rev.name} ({rev.institution.split(',')[0]})</option>
                          ))}
                        </select>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAssignReviewer(paper.id)}
                        >
                          Confirm
                        </Button>
                        <button
                          onClick={() => setSelectedPaperId(null)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : paper.status === 'accepted' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePublishPaper(paper.id)}
                      >
                        Publish to Current Issue
                      </Button>
                    ) : paper.status === 'published' ? (
                      <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5">
                        <BookMarked className="w-4 h-4" /> Published
                      </span>
                    ) : paper.status === 'revision_requested' ? (
                      <span className="text-xs font-medium text-amber-600 italic">
                        Awaiting the author's revised submission
                      </span>
                    ) : paper.status === 'rejected' ? (
                      <span className="text-xs font-medium text-gray-400 italic">
                        Declined — no further action needed
                      </span>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedPaperId(paper.id);
                          setSelectedReviewerId('');
                        }}
                      >
                        Assign Reviewer
                      </Button>
                    )}
                  </div>

                  {/* Reviews & Comments panel */}
                  {paper.reviews && paper.reviews.length > 0 && (
                    <div className="border border-gray-150 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedReviewsPaperId(expandedReviewsPaperId === paper.id ? null : paper.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-gray-100/60 transition-colors text-left"
                      >
                        <span className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Reviews &amp; Comments ({paper.reviews.length})
                        </span>
                        {expandedReviewsPaperId === paper.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      {expandedReviewsPaperId === paper.id && (
                        <div className="divide-y divide-gray-100">
                          {paper.reviews.map((review, idx) => (
                            <div key={idx} className="p-4 space-y-3 text-left bg-white">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-900">{review.reviewerName}</span>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(review.submittedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                                  review.recommendation === 'accept'
                                    ? 'bg-green-50 text-green-700 border-green-100'
                                    : review.recommendation === 'reject'
                                    ? 'bg-red-50 text-red-700 border-red-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {review.recommendation === 'accept' && 'Accept'}
                                  {review.recommendation === 'minor_revision' && 'Minor Revisions'}
                                  {review.recommendation === 'major_revision' && 'Major Revisions'}
                                  {review.recommendation === 'reject' && 'Reject'}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  Originality:
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.originalityRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                  ))}
                                </span>
                                <span className="flex items-center gap-1">
                                  Methodology:
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.methodologyRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                  ))}
                                </span>
                                <span className="flex items-center gap-1">
                                  Significance:
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.significanceRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                  ))}
                                </span>
                              </div>

                              {review.commentsForAuthor && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Feedback for Author</p>
                                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg p-2.5">{review.commentsForAuthor}</p>
                                </div>
                              )}

                              {review.commentsForEditor && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">Confidential Remarks (Editor-in-Chief only)</p>
                                  <p className="text-xs text-amber-900 leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-2.5">{review.commentsForEditor}</p>
                                </div>
                              )}

                              {review.reportUrl ? (
                                <a
                                  href={review.reportUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download Review Report (PDF)
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 italic">
                                  <Download className="w-3.5 h-3.5" />
                                  PDF report unavailable for this review
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}

              {!isLoadingPapers && visiblePapers.length === 0 && (
                <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
                  No manuscripts submitted yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: CREATE & MANAGE ISSUES
            ========================================== */}
        {activeTab === 'issues' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* INLINE DRAFT FORM */}
            <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-xs text-left h-fit space-y-5">
              <h3 className="font-serif font-bold text-base text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-primary" /> Create & Publish Issue
              </h3>
              
              <form onSubmit={handleCreateIssue} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Volume Num"
                    type="number"
                    required
                    value={volumeNum}
                    onChange={(e) => setVolumeNum(parseInt(e.target.value) || 12)}
                  />
                  <Input
                    label="Issue Num"
                    type="number"
                    required
                    value={issueNum}
                    onChange={(e) => setIssueNum(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Year"
                    type="number"
                    required
                    value={issueYear}
                    onChange={(e) => setIssueYear(parseInt(e.target.value) || 2026)}
                  />
                  <Input
                    label="Month"
                    required
                    placeholder="e.g. September"
                    value={issueMonth}
                    onChange={(e) => setIssueMonth(e.target.value)}
                  />
                </div>

                <Input
                  label="Thematic Issue Title *"
                  required
                  placeholder="e.g. Advancements in Deep Decryptors"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Description Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Outline thematic focuses and research contributions represented..."
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-normal text-xs"
                    value={issueDesc}
                    onChange={(e) => setIssueDesc(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full font-bold py-2"
                >
                  Publish Active Issue
                </Button>
              </form>
            </div>

            {/* LIST OF ISSUES */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-serif font-bold text-base text-gray-900 border-b border-gray-100 pb-2.5">Active Volumes Listing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {issues.map((issue) => (
                  <div key={issue.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4">
                    <img
                      src={issue.coverImage || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80'}
                      alt={issue.title}
                      className="w-16 h-20 object-cover rounded border border-gray-100 shrink-0"
                    />
                    <div className="text-left space-y-1">
                      <span className="text-[9px] font-mono bg-primary-cream text-primary border border-primary/5 px-1.5 py-0.5 rounded font-semibold uppercase">Vol {issue.volumeNumber}, Issue {issue.issueNumber}</span>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-tight">{issue.title || 'General Thematic Issue'}</h4>
                      <p className="text-[10px] text-gray-400">{issue.month} {issue.year} • {issue.papersCount} papers</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB: ANNOUNCEMENTS MANAGEMENT
            ========================================== */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* CREATE FORM */}
            <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-xs text-left h-fit space-y-5">
              <h3 className="font-serif font-bold text-base text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" /> Broadcast Notice
              </h3>
              
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <Input
                  label="Bulletin Title *"
                  required
                  placeholder="e.g. Special Issue on Bio-Circular Polymers"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Announcement Category</label>
                  <select
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                  >
                    <option value="call_for_papers">Call For Papers</option>
                    <option value="news">Editorial News</option>
                    <option value="general">General Update</option>
                    <option value="event">Symposium / Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Content Body *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Elaborate on details, deadlines, and guest editors..."
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-normal text-xs"
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full font-bold py-2"
                >
                  Publish Announcement
                </Button>
              </form>
            </div>

            {/* DIRECTORY */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-serif font-bold text-base text-gray-900 border-b border-gray-100 pb-2.5">Broadcast History</h3>
              <div className="space-y-3.5">
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-white border border-gray-100 p-4 rounded-xl text-left space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono bg-primary-cream text-primary border border-primary/5 px-1.5 py-0.5 rounded font-semibold capitalize">{ann.category.replace('_', ' ')}</span>
                      <span className="text-[9px] font-mono text-gray-400">{new Date(ann.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-gray-900 leading-tight">{ann.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB: SETTINGS
            ========================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-xl shadow-xs text-left space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="font-serif font-bold text-xl text-gray-900">Editorial Desk Settings</h2>
              <p className="text-xs text-gray-500 mt-1">Configure publishing charges (APCs), plagiarism thresholds, and reviewer blind rules.</p>
            </div>

            <div className="space-y-4 max-w-xl">
              <Input
                label="Primary Contact Email"
                placeholder="editor@nature-jms.org"
              />
              <Input
                label="Article Processing Charges (APC)"
                placeholder="$1,200 USD"
              />
              
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={() => addToast('Editorial configurations saved.', 'success')}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
