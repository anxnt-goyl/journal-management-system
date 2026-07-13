/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { getIssuesFromBackend } from '../services/api';
import { JournalIssue } from '../types';

export const Archives: React.FC = () => {
  const [issues, setIssues] = useState<JournalIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getIssuesFromBackend()
      .then((all) => {
        setIssues(all.filter(i => i.status === 'published'));
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Group issues by their actual year, newest first — instead of hardcoded
  // year sections that used to always render (even with zero matching
  // issues), which is what made this page look permanently empty.
  const years = Array.from(new Set(issues.map(i => i.year))).sort((a, b) => b - a);

  return (
    <div className="w-full bg-background-gray py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* HEADER SECTION */}
        <div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">Journal Archives</h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mt-3">Access historical indexes, volumes, and thematic issues published by the Journal of Modern Science.</p>
        </div>

        {/* ISSUES ARCHIVE TIMELINE GRID */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {issues
                  .filter(i => i.year === year)
                  .sort((a, b) => b.issueNumber - a.issueNumber)
                  .map((issue) => (
                    <div key={issue.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex group">
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

                        <button className="text-xs text-primary font-bold hover:text-primary-light flex items-center gap-1 mt-3">
                          Browse Issue Papers
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
