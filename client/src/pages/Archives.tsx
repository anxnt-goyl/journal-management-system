/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronRight, Download } from 'lucide-react';
import { getIssuesFromBackend, getPublishedPapersFromBackend } from '../services/api';
import { JournalIssue, Paper } from '../types';
import { Button, useToasts } from '../components/common/UI';

export const Archives: React.FC = () => {
  const { toasts, addToast, ToastComponent } = useToasts();
  const [issues, setIssues] = useState<JournalIssue[]>([]);
  const [allPublishedPapers, setAllPublishedPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([getIssuesFromBackend(), getPublishedPapersFromBackend()])
      .then(([allIssues, publishedPapers]) => {
        setIssues(allIssues.filter(i => i.status === 'published'));
        setAllPublishedPapers(publishedPapers);
      })
      .catch((error) => {
        console.error('Failed to load archives:', error);
        addToast('Unable to load the archives right now.', 'error');
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

  const getPapersForIssue = (issue: JournalIssue) =>
    allPublishedPapers.filter(
      p => p.volume === String(issue.volumeNumber) && p.issue === String(issue.issueNumber)
    );

  // Group issues by their actual year, newest first
  const years = Array.from(new Set(issues.map(i => i.year))).sort((a, b) => b - a);

  return (
    <div className="w-full bg-background-gray py-12 px-4 sm:px-6 lg:px-8 text-left">
      {ToastComponent}
      <div className="max-w-4xl mx-auto space-y-10">

        {/* HEADER SECTION */}
        <div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">Journal Archives</h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mt-3">Access historical indexes, volumes, and thematic issues published by the Journal of Modern Science.</p>
        </div>

        {!isLoading && years.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
            <p className="text-sm text-gray-500">No published issues yet. Once the editorial team publishes an issue, it will appear here.</p>
          </div>
        )}

        <div className="space-y-10">
          {years.map((year) => (
            <div key={year}>
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-6">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-serif font-bold text-lg sm:text-xl text-gray-800">Academic Year {year}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {issues
                  .filter(i => i.year === year)
                  .sort((a, b) => b.issueNumber - a.issueNumber)
                  .map((issue) => {
                    const isExpanded = expandedIssueId === issue.id;
                    const issuePapers = getPapersForIssue(issue);

                    return (
                      <div key={issue.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                        <div className="flex group">
                          <img
                            src={issue.coverImage || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80'}
                            alt={issue.title}
                            className="w-28 h-36 object-cover border-r border-gray-100 group-hover:scale-102 transition-transform"
                          />
                          <div className="p-4 flex flex-col justify-between text-left flex-1">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-semibold tracking-wider bg-primary-cream text-primary px-1.5 py-0.5 rounded border border-primary/5">
                                Volume {issue.volumeNumber}, Issue {issue.issueNumber}
                              </span>
                              <h4 className="font-serif font-bold text-sm sm:text-base text-gray-900 mt-1 line-clamp-2 leading-tight">
                                {issue.title}
                              </h4>
                              <p className="text-xs text-gray-400 mt-1">{issue.month} {issue.year} • {issue.papersCount} papers</p>
                            </div>

                            <button
                              onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                              className="text-xs text-primary font-bold hover:text-primary-light flex items-center gap-1 mt-3"
                            >
                              {isExpanded ? 'Hide Papers' : 'Browse Issue Papers'}
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden border-t border-gray-100 bg-gray-50/40"
                            >
                              <div className="p-4 space-y-3">
                                {issuePapers.length === 0 && (
                                  <p className="text-xs text-gray-400 text-center py-2">No articles attached to this issue yet.</p>
                                )}
                                {issuePapers.map((paper) => (
                                  <div key={paper.id} className="bg-white border border-gray-150 rounded-lg p-3 flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-gray-900 leading-snug">{paper.title}</p>
                                      <p className="text-xs text-gray-500">{paper.authors.map(a => a.name).join(', ')}</p>
                                    </div>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleDownloadPDF(paper)}
                                      className="shrink-0"
                                    >
                                      <Download className="w-3.5 h-3.5 mr-1" /> PDF
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
