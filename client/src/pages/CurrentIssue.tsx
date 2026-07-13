/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Download, Quote, Check, BookMarked, Layers, ChevronDown } from 'lucide-react';
import { Button, useToasts } from '../components/common/UI';
import { getIssuesFromBackend, getPublishedPapersFromBackend } from '../services/api';
import { JournalIssue, Paper } from '../types';

export const CurrentIssue: React.FC = () => {
  const { toasts, addToast, ToastComponent } = useToasts();
  const [currentIssue, setCurrentIssue] = useState<JournalIssue | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  const [citationFormat, setCitationFormat] = useState<'IEEE' | 'Harvard'>('IEEE');

  useEffect(() => {
    void Promise.all([getIssuesFromBackend(), getPublishedPapersFromBackend()])
      .then(([issues, publishedPapers]) => {
        // An issue can technically be marked "published" (e.g. created while
        // testing) without having any real papers attached to it yet. Never
        // show one of those as the "Current Issue" — prefer the most recent
        // published issue that actually has content.
        const published = issues
          .filter(i => i.status === 'published')
          .filter(i => i.papersCount > 0);

        if (published.length > 0) {
          const latest = published[0];
          setCurrentIssue(latest);
          const papersInIssue = publishedPapers.filter(
            p => p.volume === String(latest.volumeNumber) && p.issue === String(latest.issueNumber)
          );
          setPapers(papersInIssue);
        }
      })
      .catch((error) => {
        console.error('Failed to load current issue:', error);
        addToast('Unable to load the current issue right now.', 'error');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleDownloadPDF = (paper: Paper) => {
    if (!paper.fileUrl) {
      addToast('No manuscript file is available for this paper.', 'error');
      return;
    }
    window.open(paper.fileUrl, '_blank', 'noopener,noreferrer');
  };

  const getFormattedCitation = (paper: Paper, format: 'IEEE' | 'Harvard') => {
    const authorsStr = paper.authors.map(a => {
      const parts = a.name.split(' ');
      const lastName = parts[parts.length - 1];
      const initial = parts[0] ? parts[0][0] + '.' : '';
      return format === 'IEEE' ? `${initial} ${lastName}` : `${lastName}, ${initial}`;
    }).join(format === 'IEEE' ? ', ' : ' and ');

    const volume = paper.volume || currentIssue?.volumeNumber || '';
    const issue = paper.issue || currentIssue?.issueNumber || '';
    const year = currentIssue?.year || new Date().getFullYear();
    const doi = paper.doi || `10.5555/jms.${year}.${volume}`;

    if (format === 'IEEE') {
      return `${authorsStr}, "${paper.title}," Journal of Modern Science, vol. ${volume}, no. ${issue}, ${year}. DOI: ${doi}`;
    } else {
      return `${authorsStr} (${year}) '${paper.title}', Journal of Modern Science, ${volume}(${issue}). doi: ${doi}.`;
    }
  };

  const copyToClipboard = (paperId: string, citationText: string) => {
    navigator.clipboard.writeText(citationText);
    setCopiedCitationId(paperId);
    addToast('Academic citation copied to clipboard!', 'info');
    setTimeout(() => setCopiedCitationId(null), 2500);
  };

  return (
    <div className="w-full bg-background-gray py-12 px-4 sm:px-6 lg:px-8 text-left">
      {ToastComponent}
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* ISSUE HEADER CARD */}
        {currentIssue && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
            <img
              src={currentIssue.coverImage || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80'}
              alt={currentIssue.title}
              className="w-full md:w-44 h-56 rounded-lg object-cover shadow-md border border-gray-200/50"
            />
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                <BookMarked className="w-3.5 h-3.5" /> Latest Current Issue
              </span>
              <h1 className="font-serif font-black text-2.5xl sm:text-3.5xl text-gray-900 tracking-tight leading-tight">
                Volume {currentIssue.volumeNumber}, Issue {currentIssue.issueNumber} ({currentIssue.month} {currentIssue.year})
              </h1>
              <p className="text-sm font-serif italic text-accent font-semibold text-lg">{currentIssue.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                {currentIssue.description}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-xs text-gray-400 font-mono">
                <span>Published on: {currentIssue.publishedAt ? new Date(currentIssue.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</span>
                <span>•</span>
                <span>Articles Count: {papers.length}</span>
                <span>•</span>
                <span>Archived in: CLOCKSS & Portico</span>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !currentIssue && (
          <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
            <p className="text-sm text-gray-500">
              No issue has been published yet. Once the editorial team publishes an issue, it will appear here.
            </p>
          </div>
        )}

        {/* ARTICLES TABLE OF CONTENTS */}
        {currentIssue && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <Layers className="w-5.5 h-5.5 text-primary" />
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-gray-900 uppercase tracking-wide">Table of Contents</h2>
          </div>

          <div className="space-y-4">
            {papers.length === 0 && (
              <div className="p-10 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
                No articles have been attached to this issue yet.
              </div>
            )}
            {papers.map((paper, index) => {
              const isExpanded = expandedPaperId === paper.id;
              const isCopied = copiedCitationId === paper.id;
              const citation = getFormattedCitation(paper, citationFormat);

              return (
                <div key={paper.id} className="bg-white border border-gray-200/80 rounded-xl overflow-hidden transition-all shadow-xs hover:border-primary/20">
                  {/* Article main row */}
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start gap-4 md:gap-8">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold tracking-wider bg-primary-cream px-2 py-0.5 rounded border border-primary/5 text-primary uppercase">
                          {paper.category}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">Pages 104-121</span>
                      </div>
                      
                      <h3 
                        onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                        className="font-serif font-bold text-base sm:text-lg text-gray-900 leading-snug hover:text-primary cursor-pointer transition-colors"
                      >
                        {paper.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">
                        {paper.authors.map(a => a.name).join(', ')}
                      </p>
                      
                      <p className="text-xs font-mono text-gray-400">
                        DOI: <span className="text-primary hover:underline cursor-pointer">{paper.doi}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-stretch md:self-auto justify-end md:justify-start border-t md:border-t-0 border-gray-50 pt-3 md:pt-0 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadPDF(paper)}
                        title="Download PDF Manuscript"
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                        className="px-3"
                      >
                        {isExpanded ? 'Hide Abstract' : 'Abstract'}
                        <ChevronDown className={`w-3.5 h-3.5 ml-1.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>
                  </div>

                  {/* Abstract & citation expander panel */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden bg-primary-cream/20 border-t border-gray-100"
                      >
                        <div className="p-5 sm:p-6 space-y-6">
                          
                          {/* ABSTRACT */}
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Abstract</h4>
                            <p className="text-sm text-gray-600 leading-relaxed italic">
                              "{paper.abstract}"
                            </p>
                          </div>

                          {/* KEYWORDS */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">Keywords:</span>
                            {paper.keywords.map((kw, i) => (
                              <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{kw}</span>
                            ))}
                          </div>

                          {/* CITATION GENERATOR */}
                          <div className="bg-white border border-gray-150 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <Quote className="w-3.5 h-3.5" /> Export Citation
                              </h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setCitationFormat('IEEE')}
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                                    citationFormat === 'IEEE' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200'
                                  }`}
                                >
                                  IEEE
                                </button>
                                <button
                                  onClick={() => setCitationFormat('Harvard')}
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                                    citationFormat === 'Harvard' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200'
                                  }`}
                                >
                                  Harvard
                                </button>
                              </div>
                            </div>
                            <p className="text-xs font-mono text-gray-600 select-all leading-relaxed p-2.5 bg-gray-50 rounded border border-gray-100">
                              {citation}
                            </p>
                            <div className="flex justify-end">
                              <button
                                onClick={() => copyToClipboard(paper.id, citation)}
                                className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:text-primary-dark"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-3.5 h-3.5" />
                                    Copy Citation
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
        )}

      </div>
    </div>
  );
};
