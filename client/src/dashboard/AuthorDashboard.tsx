/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getPapers,
  getStats
} from '../services/mockData';
import { fetchMyPapers, submitPaperToBackend } from '../services/api';
import { Paper, PaperStatus, AuthorInfo } from '../types';
import { Button, Input, StatusChip, useToasts } from '../components/common/UI';
import {
  BookOpen,
  FileText,
  FileUp,
  History,
  Mail,
  User,
  Settings,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export const AuthorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toasts, addToast, ToastComponent } = useToasts();
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'my_papers' | 'revisions' | 'settings'>('overview');
  const [myPapers, setMyPapers] = useState<Paper[]>([]);
  
  // Submit Form States
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState('Computer Science & AI');
  const [keywordsStr, setKeywordsStr] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [coAuthors, setCoAuthors] = useState<AuthorInfo[]>([]);
  const [coName, setCoName] = useState('');
  const [coEmail, setCoEmail] = useState('');
  const [coInstitution, setCoInstitution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load User Papers
  useEffect(() => {
    const loadPapers = async () => {
      if (!user) {
        return;
      }

      try {
        const token = localStorage.getItem('jms_auth_token');
        const papers = await fetchMyPapers(token);
        setMyPapers(papers);
      } catch {
        const fallbackPapers = getPapers().filter(p => p.submittedBy === user.id);
        setMyPapers(fallbackPapers);
      }
    };

    void loadPapers();
  }, [user, activeTab]);

  const handleAddCoAuthor = () => {
    if (!coName || !coEmail || !coInstitution) {
      addToast('Please fill co-author name, email, and institution.', 'error');
      return;
    }
    const newCo: AuthorInfo = {
      name: coName,
      email: coEmail,
      institution: coInstitution,
      isCorresponding: false
    };
    setCoAuthors([...coAuthors, newCo]);
    setCoName('');
    setCoEmail('');
    setCoInstitution('');
    addToast('Co-author added to drafting list.', 'success');
  };

  const handleRemoveCoAuthor = (index: number) => {
    setCoAuthors(coAuthors.filter((_, i) => i !== index));
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        addToast('Only PDF manuscripts are accepted.', 'error');
        return;
      }
      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(1) + ' MB');
      addToast('PDF manuscript attached successfully.', 'success');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        addToast('Only PDF manuscripts are accepted.', 'error');
        return;
      }
      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(1) + ' MB');
      addToast('PDF manuscript attached successfully.', 'success');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !abstract || !fileName) {
      addToast('Manuscript Title, Abstract, and PDF file are required.', 'error');
      return;
    }

    if (!user) {
      addToast('Please sign in before submitting a manuscript.', 'error');
      return;
    }

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    const selectedFile = fileInput?.files?.[0] ?? null;

    if (!selectedFile) {
      addToast('Please attach a PDF manuscript.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const keywords = keywordsStr.split(',').map(s => s.trim()).filter(Boolean);
      const mainAuthor: AuthorInfo = {
        name: user.name,
        email: user.email,
        institution: user.institution,
        isCorresponding: true
      };

      const token = localStorage.getItem('jms_auth_token');
      await submitPaperToBackend({
        title,
        abstract,
        category,
        keywords,
        authors: [mainAuthor, ...coAuthors],
        submittedBy: user.id,
        file: selectedFile,
      }, token);

      addToast('Manuscript submitted successfully to Editorial Prescreening!', 'success');

      setTitle('');
      setAbstract('');
      setKeywordsStr('');
      setFileName('');
      setFileSize('');
      setCoAuthors([]);
      setActiveTab('my_papers');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Submission failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusProgression = (status: PaperStatus) => {
    const steps = [
      { key: 'submitted', label: 'Draft Submitted', active: true },
      { key: 'under_review', label: 'Peer Review', active: ['under_review', 'revision_requested', 'accepted', 'published'].includes(status) },
      { key: 'revision_requested', label: 'Revision Required', active: ['revision_requested', 'accepted', 'published'].includes(status) },
      { key: 'accepted', label: 'Accepted', active: ['accepted', 'published'].includes(status) },
      { key: 'published', label: 'Published Open Access', active: status === 'published' }
    ];
    return steps;
  };

  return (
    <div className="w-full bg-background-gray min-h-[85vh] flex text-left flex-col md:flex-row">
      {ToastComponent}

      {/* DASHBOARD DRAWER / SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-150 p-6 shrink-0 space-y-8 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Researcher Desk</h4>
            <h3 className="font-serif font-black text-lg text-primary">Author Portal</h3>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <History className="w-4.5 h-4.5" /> Workspace Overview
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'submit'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileUp className="w-4.5 h-4.5" /> Submit Paper
            </button>
            <button
              onClick={() => setActiveTab('my_papers')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'my_papers'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4.5 h-4.5" /> My Manuscripts ({myPapers.length})
            </button>
            <button
              onClick={() => setActiveTab('revisions')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'revisions'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-4.5 h-4.5" /> Decision Letters
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4.5 h-4.5" /> settings
            </button>
          </nav>
        </div>

        {/* PROFILE CHIP AT BOTTOM */}
        <div className="border-t border-gray-100 pt-4 flex items-center gap-3 bg-gray-50 p-2 rounded-xl hidden md:flex">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover border border-primary/20 shrink-0"
          />
          <div className="text-left overflow-hidden">
            <h5 className="text-xs font-bold text-gray-800 leading-none truncate">{user?.name}</h5>
            <span className="text-[9px] text-gray-400 font-mono truncate block mt-1">{user?.institution.split(',')[0]}</span>
          </div>
        </div>
      </aside>

      {/* CORE ACTIVE WORKSPACE CONTENT */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* ==========================================
            TAB: OVERVIEW
            ========================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="font-serif font-black text-2.5xl sm:text-3.5xl text-gray-900 leading-none">Welcome back, {user?.name.split(' ')[0]}</h1>
              <p className="text-sm text-gray-500">Track and manage your draft research manuscripts and academic correspondences.</p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">Manuscripts submitted</span>
                <span className="text-3xl font-serif font-bold text-primary block mt-1">{myPapers.length}</span>
                <span className="text-[10px] text-gray-400 block mt-1.5 font-mono">Open-access publishing</span>
              </div>
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">In active peer review</span>
                <span className="text-3xl font-serif font-bold text-amber-600 block mt-1">
                  {myPapers.filter(p => p.status === 'under_review' || p.status === 'revision_requested').length}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1.5 font-mono">Assigned to technical specialists</span>
              </div>
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-semibold">Accepted & Published</span>
                <span className="text-3xl font-serif font-bold text-green-600 block mt-1">
                  {myPapers.filter(p => p.status === 'published' || p.status === 'accepted').length}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1.5 font-mono">DOI identifiers registered</span>
              </div>
            </div>

            {/* Active draft statuses */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs text-left space-y-4">
              <h3 className="font-serif font-bold text-base text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Active Manuscript Progress
              </h3>

              {myPapers.length > 0 ? (
                <div className="space-y-6 pt-2">
                  {myPapers.slice(0, 2).map((paper) => (
                    <div key={paper.id} className="border border-gray-100 p-4 rounded-xl space-y-4 bg-gray-50/40">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-serif font-bold text-sm sm:text-base text-gray-900 leading-snug">{paper.title}</h4>
                          <span className="text-[10px] font-mono text-gray-400 mt-1 block">Category: {paper.category}</span>
                        </div>
                        <StatusChip status={paper.status} />
                      </div>

                      {/* Timeline bar */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {getStatusProgression(paper.status).map((step, sIdx) => (
                          <div key={sIdx} className="space-y-1">
                            <div className={`h-1.5 rounded-full transition-all ${step.active ? 'bg-primary' : 'bg-gray-200'}`} />
                            <span className={`text-[9px] font-mono truncate block text-center ${step.active ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                              {step.label.split(' ')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  <p className="font-semibold text-sm">No submissions recorded.</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Submit Paper" in the sidebar to start.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: SUBMIT MANUSCRIPT FORM
            ========================================== */}
        {activeTab === 'submit' && (
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-xl shadow-xs text-left space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="font-serif font-bold text-xl text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5.5 h-5.5 text-accent" /> Draft New Manuscript
              </h2>
              <p className="text-xs text-gray-500 mt-1">Ensure your PDF has double-blind formatting enabled before final submission.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              <Input
                label="Manuscript Title *"
                required
                placeholder="e.g. Robust Quantum Convolutional Encoders for Image Classification"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Structured Abstract *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Summarize Research Objectives, Methodologies, Results and Key Originality (Max 250 words)..."
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-normal"
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Focus Category *</label>
                  <select
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Computer Science & AI">Computer Science & AI</option>
                    <option value="Environmental Engineering">Environmental Engineering</option>
                    <option value="Electrical Engineering & IoT">Electrical Engineering & IoT</option>
                    <option value="Materials Science">Materials Science</option>
                  </select>
                </div>
                <Input
                  label="Keywords (comma separated) *"
                  required
                  placeholder="e.g. Deep Learning, CNN, Quantum, Physics"
                  value={keywordsStr}
                  onChange={(e) => setKeywordsStr(e.target.value)}
                />
              </div>

              {/* CO-AUTHORS LIST BUILDER */}
              <div className="border border-gray-150 p-4 rounded-xl space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-100 pb-2 flex items-center justify-between">
                  Co-Author Declarations <span>({coAuthors.length} Added)</span>
                </h4>

                {coAuthors.length > 0 && (
                  <div className="space-y-2">
                    {coAuthors.map((ca, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs text-gray-700">
                        <div>
                          <strong>{ca.name}</strong> ({ca.institution}) — <span className="font-mono text-gray-400">{ca.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCoAuthor(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <Input
                    label="Co-Author Name"
                    placeholder="e.g. Dr. John Doyle"
                    value={coName}
                    onChange={(e) => setCoName(e.target.value)}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. doyle@mit.edu"
                    value={coEmail}
                    onChange={(e) => setCoEmail(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        label="Institution"
                        placeholder="e.g. MIT"
                        value={coInstitution}
                        onChange={(e) => setCoInstitution(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCoAuthor}
                      className="p-2.5 bg-primary text-white hover:bg-primary-dark rounded-lg mb-4 cursor-pointer focus:outline-none"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* FILE DRAG DROP AREA */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50 hover:bg-primary-cream/20 hover:border-primary/40 transition-all cursor-pointer relative"
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                {fileName ? (
                  <div>
                    <p className="text-sm font-bold text-gray-800">Attached: {fileName}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">File Size: {fileSize}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Drag & Drop PDF Manuscript file here</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Only PDF formatted files under 15MB are allowed</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="font-bold py-2.5 px-8"
                  isLoading={isSubmitting}
                >
                  Submit Paper for Peer Review
                </Button>
              </div>

            </form>
          </div>
        )}

        {/* ==========================================
            TAB: MY MANUSCRIPTS
            ========================================== */}
        {activeTab === 'my_papers' && (
          <div className="space-y-6 text-left">
            <div className="border-b border-gray-100 pb-3">
              <h1 className="font-serif font-black text-2.5xl text-gray-900 leading-none">Your Manuscripts ({myPapers.length})</h1>
              <p className="text-sm text-gray-500 mt-1">Review editor prescreen logs, peer reports, and decisions.</p>
            </div>

            <div className="space-y-4">
              {myPapers.map((paper) => (
                <div key={paper.id} className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <span className="text-[10px] font-mono bg-primary-cream text-primary border border-primary/5 px-2 py-0.5 rounded font-semibold uppercase">{paper.category}</span>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-gray-900 leading-snug">{paper.title}</h3>
                      <p className="text-xs text-gray-400 font-mono">Submitted on: {new Date(paper.submittedAt).toLocaleDateString()} • ID: {paper.id}</p>
                    </div>
                    <StatusChip status={paper.status} />
                  </div>

                  {/* Vertical micro-timeline inside paper log */}
                  <div className="mt-6 border-t border-gray-50 pt-5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-3.5 tracking-wider">LIFECYCLE STAGE TIMELINE</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {getStatusProgression(paper.status).map((step, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                          <div className={`h-1 rounded-full transition-all ${step.active ? 'bg-primary' : 'bg-gray-200'}`} />
                          <span className={`text-[10px] font-mono leading-none block ${step.active ? 'text-primary font-bold' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback summary if available */}
                  {paper.reviews && paper.reviews.length > 0 && (
                    <div className="mt-5 p-4 bg-amber-50/60 border border-amber-100 rounded-lg text-xs leading-relaxed text-amber-950">
                      <strong>Editor Note / Peer Summary:</strong> "The mathematical proofs in Section 3 are highly sound, but we request further empirical validation parameters to solidify industrial relevance."
                      <button onClick={() => setActiveTab('revisions')} className="text-primary font-bold hover:underline ml-2">Read Complete Decision Letter &rarr;</button>
                    </div>
                  )}

                </div>
              ))}

              {myPapers.length === 0 && (
                <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
                  <p className="font-bold text-base">No Draft Submissions Found</p>
                  <p className="text-xs text-gray-400 mt-1">Submit your first draft utilizing the "Submit Paper" side menu.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: DECISION LETTERS
            ========================================== */}
        {activeTab === 'revisions' && (
          <div className="space-y-6 text-left">
            <div className="border-b border-gray-100 pb-3">
              <h1 className="font-serif font-black text-2.5xl text-gray-900 leading-none">Decision Letters</h1>
              <p className="text-sm text-gray-500 mt-1">Official communications regarding revisions, desk rejections, and acceptances.</p>
            </div>

            <div className="space-y-4">
              {myPapers.filter(p => p.reviews && p.reviews.length > 0).map((paper) => (
                <div key={paper.id} className="bg-white border border-gray-150 p-6 sm:p-8 rounded-xl shadow-xs space-y-4 font-mono text-xs text-gray-700 leading-relaxed border-t-4 border-accent">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3 font-sans">
                    <span className="font-serif font-black text-base text-gray-900">Official Decision Brief</span>
                    <span className="text-[10px] font-mono text-gray-400">Date: {new Date(paper.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <p><strong>To:</strong> {user?.name} &lt;{user?.email}&gt;</p>
                  <p><strong>Ref:</strong> Journal of Modern Science Submission ID: {paper.id}</p>
                  <p><strong>Title:</strong> "{paper.title}"</p>
                  
                  <hr className="border-dashed border-gray-200" />
                  
                  <p>Dear Dr. {user?.name.split(' ').pop()},</p>
                  <p>
                    Thank you for submitting your manuscript to the Journal of Modern Science. The technical panel has completed its double-blind peer-review. We are pleased to inform you that your work is considered for publication, subject to resolving the following revisions:
                  </p>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2 text-gray-600">
                    <p><strong>Reviewer 1 Feedback (Prof. Vance):</strong></p>
                    <p className="italic">
                      "The zero-knowledge attestation metrics are highly rigorous. However, the author must elaborate on the computational energy parameters on Cortex-M4 CPUs. Please supply direct simulated energy cycles or hardware profiling figures."
                    </p>
                  </div>

                  <p>
                    Please upload your revised PDF manuscript along with a complete responses matrix via the portal settings.
                  </p>
                  <p>Sincerely,</p>
                  <p className="font-bold text-primary font-sans text-sm">Prof. Alistair Sterling</p>
                  <p className="text-[10px] text-gray-400">Editor-in-Chief, Journal of Modern Science</p>

                  {/* Submission box for revisions */}
                  <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between font-sans">
                    <span className="text-xs text-gray-500 font-medium">Have you compiled your revised manuscript?</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => addToast('Revision upload channel is temporarily in simulation mode.', 'info')}
                    >
                      Upload Revised PDF Manuscript
                    </Button>
                  </div>
                </div>
              ))}

              {myPapers.filter(p => p.reviews && p.reviews.length > 0).length === 0 && (
                <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
                  No decision letters have been issued for your active manuscripts yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: SETTINGS
            ========================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-xl shadow-xs text-left space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="font-serif font-bold text-xl text-gray-900">Researcher Settings</h2>
              <p className="text-xs text-gray-500 mt-1">Configure your ORCID identifiers, institutional affiliations, and email digests.</p>
            </div>

            <div className="space-y-4 max-w-xl">
              <Input
                label="Full Academic Name"
                disabled
                value={user?.name}
              />
              <Input
                label="Primary Institutional Affiliation"
                disabled
                value={user?.institution}
              />
              <Input
                label="Email Address"
                disabled
                value={user?.email}
              />
              <Input
                label="ORCID Identifier (ID Link)"
                placeholder="0000-0002-1825-0097"
              />
              
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={() => addToast('Researcher profile updated successfully.', 'success')}
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
