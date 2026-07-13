/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Search as SearchIcon, FileText, Download, Bookmark, Layers, Calendar } from 'lucide-react';
import { getPublishedPapersFromBackend } from '../services/api';
import { Paper } from '../types';
import { Button, useToasts } from '../components/common/UI';

export const Search: React.FC = () => {
  const { toasts, addToast, ToastComponent } = useToasts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [results, setResults] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);

  // Load the published paper pool once from the real backend
  useEffect(() => {
    getPublishedPapersFromBackend()
      .then(setAllPapers)
      .catch((error) => {
        console.error('Failed to load published papers:', error);
        addToast('Unable to load published papers right now.', 'error');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Derive filtered results from the loaded pool whenever the query/category changes
  useEffect(() => {
    let filtered = allPapers;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p => p.title.toLowerCase().includes(q) ||
             p.abstract.toLowerCase().includes(q) ||
             p.authors.some(a => a.name.toLowerCase().includes(q)) ||
             p.keywords.some(kw => kw.toLowerCase().includes(q))
      );
    }

    setResults(filtered);
  }, [allPapers, searchQuery, selectedCategory]);

  const handleDownloadPDF = (paper: Paper) => {
    if (!paper.fileUrl) {
      addToast('No manuscript file is available for this paper.', 'error');
      return;
    }
    window.open(paper.fileUrl, '_blank', 'noopener,noreferrer');
  };

  const categories = [
    'All',
    'Computer Science & AI',
    'Environmental Engineering',
    'Electrical Engineering & IoT',
    'Materials Science'
  ];

  return (
    <div className="w-full bg-background-gray py-12 px-4 sm:px-6 lg:px-8 text-left">
      {ToastComponent}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">Search Published Literature</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-2">Browse the complete repository of peer-reviewed articles, Special Issues, and technical notes.</p>
        </div>

        {/* SEARCH BAR & FILTERS CARD */}
        <div className="bg-white border border-gray-150 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keywords, titles, abstract terms, or author names..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-800 placeholder-gray-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories tag slider */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">Category Focus</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS FEED */}
        <section className="space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400 px-1">
            <span>Query Results: {results.length} Matches Found</span>
            <span>Sorted by: Relevance</span>
          </div>

          <div className="space-y-4">
            {isLoading && (
              <div className="p-12 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
                Loading published literature...
              </div>
            )}

            {!isLoading && results.map((paper) => {
              const isExpanded = expandedAbstractId === paper.id;
              return (
                <div key={paper.id} className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 shadow-xs hover:border-primary/25 transition-all">
                  <span className="text-[10px] font-mono font-semibold tracking-wider bg-primary-cream text-primary px-1.5 py-0.5 rounded border border-primary/5 uppercase">
                    {paper.category}
                  </span>
                  
                  <h3 className="font-serif font-bold text-lg text-gray-900 mt-2.5 leading-snug hover:text-primary cursor-pointer" onClick={() => setExpandedAbstractId(isExpanded ? null : paper.id)}>
                    {paper.title}
                  </h3>

                  <p className="text-xs text-gray-500 font-semibold mt-2.5">
                    By {paper.authors.map(a => a.name).join(', ')} — <span className="text-primary font-mono">{paper.doi}</span>
                  </p>

                  <p className="text-xs sm:text-sm text-gray-500 mt-3.5 leading-relaxed line-clamp-3">
                    {paper.abstract}
                  </p>

                  {/* Expanded block */}
                  {isExpanded && (
                    <div className="mt-4 p-4 bg-primary-cream/20 rounded-lg text-xs sm:text-sm text-gray-600 leading-relaxed border border-primary/5">
                      <strong>Full Abstract:</strong> "{paper.abstract}"
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {paper.keywords.map((kw, idx) => (
                          <span key={idx} className="bg-white px-2 py-0.5 rounded border border-gray-150 text-[11px] text-gray-500 font-medium">#{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Volume 12, Issue 2 ({paper.submittedAt.split('-')[0]})</span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadPDF(paper)}
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedAbstractId(isExpanded ? null : paper.id)}
                      >
                        {isExpanded ? 'Hide Abstract' : 'View Abstract'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {!isLoading && results.length === 0 && (
              <div className="p-12 text-center text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl space-y-2">
                <p className="font-bold text-base">No Matching Literature Found</p>
                <p className="text-xs text-gray-400">Try simplifying keywords or selecting 'All' focus categories.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
