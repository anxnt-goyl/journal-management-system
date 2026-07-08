/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPapers, submitReview } from '../services/mockData';
import { Paper, Review } from '../types';
import { Button, Input, StatusChip, useToasts } from '../components/common/UI';
import {
  ShieldAlert,
  ClipboardCheck,
  History,
  TrendingUp,
  User,
  Settings,
  Star,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export const ReviewerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toasts, addToast, ToastComponent } = useToasts();
  const [activeTab, setActiveTab] = useState<'assigned' | 'history' | 'profile'>('assigned');
  const [assignedPapers, setAssignedPapers] = useState<Paper[]>([]);
  const [completedReviews, setCompletedReviews] = useState<Review[]>([]);

  // Review Form States
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [recommendation, setRecommendation] = useState<'accept' | 'minor_revision' | 'major_revision' | 'reject'>('accept');
  const [originality, setOriginality] = useState(5);
  const [methodology, setMethodology] = useState(5);
  const [significance, setSignificance] = useState(5);
  const [commentsAuthor, setCommentsAuthor] = useState('');
  const [commentsEditor, setCommentsEditor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      // Find papers where this reviewer is assigned
      const papers = getPapers();
      
      // Filter out papers already reviewed by this reviewer
      const assigned = papers.filter(
        p => p.assignedReviewers.includes(user.id) &&
             !p.reviews.some(r => r.reviewerId === user.id)
      );
      setAssignedPapers(assigned);

      // Extract reviews completed by this reviewer
      const completed: Review[] = [];
      papers.forEach(p => {
        p.reviews.forEach(r => {
          if (r.reviewerId === user.id) {
            completed.push(r);
          }
        });
      });
      setCompletedReviews(completed);
    }
  }, [user, activeTab]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper || !commentsAuthor) {
      addToast('Please enter comments for the author.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (user) {
        submitReview(selectedPaper.id, {
          paperId: selectedPaper.id,
          reviewerId: user.id,
          reviewerName: user.name,
          recommendation,
          originalityRating: originality,
          methodologyRating: methodology,
          significanceRating: significance,
          commentsForAuthor: commentsAuthor,
          commentsForEditor: commentsEditor
        });

        // Update paper status conditionally to model peer workflow
        const allPapers = getPapers();
        const pIndex = allPapers.findIndex(p => p.id === selectedPaper.id);
        if (pIndex !== -1) {
          const p = allPapers[pIndex];
          p.status = recommendation === 'accept' ? 'accepted' : 'revision_requested';
          localStorage.setItem('jms_papers', JSON.stringify(allPapers));
        }

        setIsSubmitting(false);
        addToast('Technical review report submitted to Editor-in-Chief!', 'success');
        
        // Reset states
        setSelectedPaper(null);
        setCommentsAuthor('');
        setCommentsEditor('');
        setActiveTab('history');
      }
    }, 1500);
  };

  return (
    <div className="w-full bg-background-gray min-h-[85vh] flex text-left flex-col md:flex-row">
      {ToastComponent}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-150 p-6 shrink-0 space-y-8 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Specialist Board</h4>
            <h3 className="font-serif font-black text-lg text-primary">Peer Review Portal</h3>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => {
                setActiveTab('assigned');
                setSelectedPaper(null);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'assigned'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ClipboardCheck className="w-4.5 h-4.5" /> Assigned Evaluation Tasks ({assignedPapers.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                setSelectedPaper(null);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'history'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <History className="w-4.5 h-4.5" /> Completed Evaluations ({completedReviews.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setSelectedPaper(null);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-4.5 h-4.5" /> Specialization Profile
            </button>
          </nav>
        </div>

        {/* PROFILE CARD */}
        <div className="border-t border-gray-100 pt-4 flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl hidden md:flex">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover border border-primary/20 shrink-0"
          />
          <div className="text-left overflow-hidden">
            <h5 className="text-xs font-bold text-gray-800 leading-none truncate">{user?.name}</h5>
            <span className="text-[9px] text-gray-400 block truncate mt-1">Review Specialty Fellow</span>
          </div>
        </div>
      </aside>

      {/* CORE ACTIVE PANEL */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* ==========================================
            TAB: ASSIGNED MANUSCRIPTS FOR REVIEW
            ========================================== */}
        {activeTab === 'assigned' && !selectedPaper && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h1 className="font-serif font-black text-2.5xl sm:text-3.5xl text-gray-900 leading-none">Assigned Peer Reviews</h1>
              <p className="text-sm text-gray-500">Rigorous reviews must verify mathematical originality, methodology soundness, and citation ethicality.</p>
            </div>

            {/* General metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">Assigned & Active</span>
                <span className="text-3xl font-serif font-bold text-primary block mt-1">{assignedPapers.length}</span>
                <span className="text-[10px] text-gray-400 block mt-1 font-mono">Pending feedback report</span>
              </div>
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">Completed evaluations</span>
                <span className="text-3xl font-serif font-bold text-green-600 block mt-1">{completedReviews.length}</span>
                <span className="text-[10px] text-gray-400 block mt-1 font-mono">Archived historical scores</span>
              </div>
            </div>

            <div className="space-y-4">
              {assignedPapers.map((paper) => (
                <div key={paper.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs flex flex-col md:flex-row justify-between gap-6 items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold tracking-wider bg-primary-cream text-primary px-1.5 py-0.5 rounded border border-primary/5 uppercase">
                        {paper.category}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">Assigned: {new Date(paper.submittedAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg text-gray-900 leading-snug">{paper.title}</h3>
                    
                    {/* Double blind formatting: hide author names from peer reviewer! */}
                    <div className="text-[11px] font-mono bg-amber-50 text-amber-800 px-3 py-1.5 rounded border border-amber-100 inline-flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      Double-Blind Rule Active: Author names and affiliations are omitted.
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed italic border-l-2 border-gray-100 pl-3 pt-1">
                      "{paper.abstract.slice(0, 200)}..."
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 self-stretch md:self-auto justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedPaper(paper)}
                    >
                      Conduct Peer Evaluation
                    </Button>
                  </div>
                </div>
              ))}

              {assignedPapers.length === 0 && (
                <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
                  <p className="font-bold text-base">No Evaluations Currently Assigned</p>
                  <p className="text-xs text-gray-400 mt-1">The Editor-in-Chief will assign manuscripts matching your academic specialties.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: SUBMISSION OF PEER REVIEW EVALUATION
            ========================================== */}
        {selectedPaper && (
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-xl shadow-xs text-left space-y-6 animate-fade-in">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">CONDUCTING EVALUATION FOR ARTICLE ID: {selectedPaper.id}</span>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-gray-900 leading-tight mt-1">"{selectedPaper.title}"</h2>
              </div>
              <button
                onClick={() => setSelectedPaper(null)}
                className="text-xs text-gray-400 hover:text-gray-600 focus:outline-none font-semibold border border-gray-200 px-2 py-1 rounded"
              >
                Cancel Review
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-6">
              
              {/* ACCORDION RATINGS SCORING */}
              <div className="bg-gray-50 border border-gray-150 p-5 rounded-xl space-y-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-2">Academic Score Matrix (1-5 Stars)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Originality */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 block">1. Mathematical Originality</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setOriginality(val)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-5 h-5 ${originality >= val ? 'fill-accent text-accent' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Methodology */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 block">2. Methodological Rigor</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setMethodology(val)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-5 h-5 ${methodology >= val ? 'fill-accent text-accent' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Significance */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 block">3. Practical Significance</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSignificance(val)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-5 h-5 ${significance >= val ? 'fill-accent text-accent' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* COMMENTS FOR AUTHORS */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Comments & Constructive Feedback for Authors *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Review specific sections, request additional experimental figures, or point out typographic errors..."
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-normal"
                  value={commentsAuthor}
                  onChange={(e) => setCommentsAuthor(e.target.value)}
                />
              </div>

              {/* COMMENTS FOR EDITORS */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Confidential Editorial Remarks (Only visible to Editor-in-Chief)</label>
                <textarea
                  rows={3}
                  placeholder="Private notes explaining potential scoping conflicts of interest, formatting flags, or severe plagiarism concerns..."
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-normal"
                  value={commentsEditor}
                  onChange={(e) => setCommentsEditor(e.target.value)}
                />
              </div>

              {/* RECOMMENDATION DROPDOWN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Overall Academic Recommendation *</label>
                  <select
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer font-bold text-primary"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value as any)}
                  >
                    <option value="accept">Accept Manuscript (High Quality)</option>
                    <option value="minor_revision">Accept with Minor Revisions</option>
                    <option value="major_revision">Accept with Major Revisions</option>
                    <option value="reject">Decline / Reject Manuscript</option>
                  </select>
                </div>
                
                <div className="text-xs text-gray-500 leading-relaxed bg-primary-cream border border-primary/5 p-3 rounded-lg flex items-start gap-2 self-end">
                  <AlertCircle className="w-4.5 h-4.5 text-accent shrink-0" />
                  Please verify that no co-author affiliations are referenced in your feedback to preserve double-blind integrity.
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button
                  type="submit"
                  variant="primary"
                  className="font-bold py-2.5 px-8"
                  isLoading={isSubmitting}
                >
                  Submit Technical Evaluation Report
                </Button>
              </div>

            </form>
          </div>
        )}

        {/* ==========================================
            TAB: HISTORY OF COMPLETED REVIEWS
            ========================================== */}
        {activeTab === 'history' && (
          <div className="space-y-6 text-left">
            <div className="border-b border-gray-100 pb-3">
              <h1 className="font-serif font-black text-2.5xl text-gray-900 leading-none font-bold">Historical Completed Reviews ({completedReviews.length})</h1>
              <p className="text-sm text-gray-500 mt-1">Archived reviews and ratings submitted for the Journal of Modern Science.</p>
            </div>

            <div className="space-y-4">
              {completedReviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 block uppercase">Review ID: {rev.id}</span>
                      <h3 className="font-serif font-bold text-base text-gray-900 leading-tight mt-1">Evaluated Manuscript ID: {rev.paperId}</h3>
                      <span className="text-[10px] font-mono text-gray-400 mt-1 block">Submitted on: {new Date(rev.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold capitalize bg-primary/5 text-primary border border-primary/20">
                      Recommendation: {rev.recommendation.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Ratings block */}
                  <div className="grid grid-cols-3 gap-4 border-y border-gray-50 py-3 text-xs">
                    <div>
                      <span className="text-gray-400">Originality:</span>
                      <span className="font-bold text-gray-800 ml-1">{rev.originalityRating}/5 Stars</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Methodology:</span>
                      <span className="font-bold text-gray-800 ml-1">{rev.methodologyRating}/5 Stars</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Significance:</span>
                      <span className="font-bold text-gray-800 ml-1">{rev.significanceRating}/5 Stars</span>
                    </div>
                  </div>

                  {/* Comments Author */}
                  <div className="p-3.5 bg-gray-50 rounded-lg text-xs leading-relaxed text-gray-600 italic">
                    <strong>Your Comments to Author:</strong> "{rev.commentsForAuthor}"
                  </div>

                </div>
              ))}

              {completedReviews.length === 0 && (
                <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
                  No completed evaluations recorded in this profile yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: PROFILE & SPECIALIZATION
            ========================================== */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-xl shadow-xs text-left space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="font-serif font-bold text-xl text-gray-900">Reviewer Specialty Fellow Settings</h2>
              <p className="text-xs text-gray-500 mt-1">Reviewers are assigned submissions precisely matching their declared fields of interest.</p>
            </div>

            <div className="space-y-4 max-w-xl">
              <Input
                label="Full Academic Name"
                disabled
                value={user?.name}
              />
              <Input
                label="Primary Institution"
                disabled
                value={user?.institution}
              />
              <Input
                label="Field of Specialties (Comma Separated)"
                defaultValue="Quantum Computing, Cryptography, Parallel Architectures"
              />
              
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={() => addToast('Review specialty fields updated successfully.', 'success')}
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
