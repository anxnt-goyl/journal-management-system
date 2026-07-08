/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  UserCheck,
  Globe,
  ArrowRight,
  Bookmark,
  Calendar
} from 'lucide-react';
import { Button } from '../components/common/UI';
import { getStats, getPapers, getAnnouncements } from '../services/mockData';
import { JournalStats, Paper, Announcement } from '../types';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [featuredPaper, setFeaturedPaper] = useState<Paper | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    setStats(getStats());
    const allPapers = getPapers().filter(p => p.status === 'published');
    if (allPapers.length > 0) {
      setFeaturedPaper(allPapers[0]);
    }
    setAnnouncements(getAnnouncements());
  }, []);

  const categories = ['All', 'Computer Science & AI', 'Environmental Engineering', 'Electrical Engineering & IoT', 'Materials Science'];

  const filterPapers = () => {
    const all = getPapers().filter(p => p.status === 'published');
    if (selectedCategory === 'All') return all;
    return all.filter(p => p.category === selectedCategory);
  };

  const timelineSteps = [
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: '1. Abstract & Manuscript Submission',
      desc: 'Submit PDF manuscript, select academic categories, declare co-authors, and identify conflicts of interest.'
    },
    {
      icon: <UserCheck className="w-5 h-5 text-primary" />,
      title: '2. Editorial Pre-Screening',
      desc: 'Editor-in-Chief reviews scope, academic formatting, plagiarism reports, and assigns peer reviewers.'
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: '3. Double-Blind Peer Review',
      desc: 'Three specialists assess methodology, mathematical originality, and impact, providing rigorous feedback.'
    },
    {
      icon: <Award className="w-5 h-5 text-primary" />,
      title: '4. Decision & Archiving',
      desc: 'Following revisions, paper receives a formal doi, indexed in digital libraries, and published open access.'
    }
  ];

  return (
    <div className="w-full bg-background-gray">
      
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-primary text-white py-20 sm:py-28 px-4 sm:px-6 border-b border-accent/20">
        {/* Subtle decorative background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(#167a4c_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -left-24 top-12 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/15 text-xs text-accent font-semibold tracking-wider uppercase mb-6"
          >
            <Award className="w-3.5 h-3.5" /> High-Impact Academic Open Access Journal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3.5xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto"
          >
            Pioneering Rigorous Science, For global advancement.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 font-light max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            The <span className="font-serif italic font-semibold text-accent">Journal of Modern Science</span> provides double-blind peer-reviewed open access publication for deep technology, computational algorithms, and climate geodesics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Button
              variant="accent"
              size="lg"
              className="w-full sm:w-auto font-bold py-3 px-8 text-primary-dark"
              onClick={() => onNavigate('login')}
            >
              Submit Your Manuscript
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white"
              onClick={() => onNavigate('current')}
            >
              Read Current Issue
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 2. JOURNAL METRICS BAR */}
      <section className="bg-white py-12 border-b border-gray-100 relative -mt-6 sm:-mt-10 mx-4 max-w-6xl xl:mx-auto rounded-xl shadow-xl z-25 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          <div className="flex flex-col items-center justify-center text-center p-2">
            <TrendingUp className="w-6 h-6 text-accent mb-2.5" />
            <span className="text-3xl font-serif font-black text-primary leading-tight">6.94</span>
            <span className="text-xs uppercase font-mono tracking-wider text-gray-500 font-semibold mt-1">Impact Factor</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-2 pt-6 md:pt-2">
            <BookOpen className="w-6 h-6 text-accent mb-2.5" />
            <span className="text-3xl font-serif font-black text-primary leading-tight">72</span>
            <span className="text-xs uppercase font-mono tracking-wider text-gray-500 font-semibold mt-1">h-index score</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-2 pt-6 md:pt-2">
            <Clock className="w-6 h-6 text-accent mb-2.5" />
            <span className="text-3xl font-serif font-black text-primary leading-tight">38 Days</span>
            <span className="text-xs uppercase font-mono tracking-wider text-gray-500 font-semibold mt-1">Avg. Peer Review</span>
          </div>

          <div className="flex flex-col items-center justify-center text-center p-2 pt-6 md:pt-2">
            <Globe className="w-6 h-6 text-accent mb-2.5" />
            <span className="text-3xl font-serif font-black text-primary leading-tight">14.8%</span>
            <span className="text-xs uppercase font-mono tracking-wider text-gray-500 font-semibold mt-1">Acceptance Rate</span>
          </div>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT & MID COLUMNS (Research papers and timeline) */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* A. FEATURED PAPER PREVIEW */}
          {featuredPaper && (
            <section className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-0.5 w-6 bg-accent" />
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-gray-900 uppercase tracking-wide">Featured Research</h2>
              </div>
              <div className="academic-card p-6 sm:p-8 bg-white">
                <span className="text-xs font-mono text-accent font-semibold tracking-wider uppercase bg-primary-cream px-2.5 py-1 rounded border border-primary/5">{featuredPaper.category}</span>
                <h3 className="font-serif font-bold text-lg sm:text-2xl text-gray-900 mt-4 leading-snug hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigate('current')}>
                  {featuredPaper.title}
                </h3>
                <p className="text-xs font-medium text-gray-500 mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-b border-gray-100 pb-4">
                  <span>By {featuredPaper.authors.map(a => a.name).join(', ')}</span>
                  <span>•</span>
                  <span>Stanford University</span>
                  <span>•</span>
                  <span className="text-primary font-mono">{featuredPaper.doi}</span>
                </p>
                <p className="text-sm text-gray-600 mt-4 leading-relaxed line-clamp-3 italic">
                  "{featuredPaper.abstract}"
                </p>
                <div className="mt-6 flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-gray-400">Published in Vol 12, Issue 2</span>
                  <button 
                    onClick={() => onNavigate('current')} 
                    className="text-primary hover:text-primary-light font-semibold text-xs flex items-center gap-1 group"
                  >
                    View Full Manuscript 
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* B. CATEGORIZED RESEARCH STREAM */}
          <section className="text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-6 bg-accent" />
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-gray-900 uppercase tracking-wide">Latest Articles</h2>
              </div>
              {/* Category buttons slider */}
              <div className="flex gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none">
                {categories.slice(0, 3).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 border border-gray-200/60 hover:bg-gray-50'
                    }`}
                  >
                    {cat === 'All' ? 'Latest' : cat.split('&')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filterPapers().slice(0, 4).map((paper) => (
                <div key={paper.id} className="academic-card p-5 bg-white flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-mono tracking-wider font-semibold text-accent uppercase">{paper.category}</span>
                    <h4 
                      onClick={() => onNavigate('current')}
                      className="font-serif font-bold text-base text-gray-900 mt-1.5 leading-snug cursor-pointer hover:text-primary hover:underline"
                    >
                      {paper.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-2">
                      {paper.authors.map(a => a.name).join(', ')} — <span className="font-mono text-gray-400">{paper.doi || 'Pre-publication DOI pending'}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate('current')}
                    className="shrink-0 p-1.5 text-gray-400 hover:text-primary rounded-lg border border-transparent hover:border-gray-100 transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {filterPapers().length === 0 && (
                <div className="p-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl bg-white">
                  No articles found in this category.
                </div>
              )}
            </div>
          </section>

          {/* C. INTERACTIVE PUBLICATION LIFECYCLE */}
          <section className="text-left bg-white p-6 sm:p-8 rounded-xl border border-gray-200/60 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-0.5 w-6 bg-accent" />
              <h2 className="font-serif font-bold text-xl text-gray-900 uppercase tracking-wide">Publishing Peer Review Lifecycle</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              We uphold standard integrity criteria mapped to COPE (Committee on Publication Ethics) guidelines. Here is our structured workflow from submission to open access preservation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-primary-cream flex items-center justify-center shrink-0 border border-primary/10">
                    {step.icon}
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-sm sm:text-base text-gray-900 leading-tight">{step.title}</h5>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (Announcements sidebar and quick tools) */}
        <div className="space-y-8">
          
          {/* A. CALL FOR PAPERS BULLETIN */}
          <section className="text-left bg-primary-cream border border-primary/10 rounded-xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full pointer-events-none" />
            <h3 className="font-serif font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-accent" />
              Special Issue Calls
            </h3>
            
            <div className="space-y-4">
              {announcements.filter(a => a.category === 'call_for_papers').map((ann) => (
                <div key={ann.id} className="border-b border-primary/5 pb-4 last:border-0 last:pb-0">
                  <h4 className="text-sm font-bold text-gray-900 hover:text-primary leading-snug cursor-pointer" onClick={() => onNavigate('archives')}>
                    {ann.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1.5 line-clamp-3 leading-relaxed">
                    {ann.content}
                  </p>
                  <button 
                    onClick={() => onNavigate('guidelines')}
                    className="text-xs text-primary hover:text-primary-light font-bold mt-2 inline-flex items-center gap-1 group"
                  >
                    View Call Specifics
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* B. CORE INSTRUCTIONS QUICK ACCESS */}
          <section className="text-left bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
            <h3 className="font-serif font-bold text-base text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-3 mb-4">Author Resources</h3>
            <div className="space-y-3">
              <button 
                onClick={() => onNavigate('guidelines')}
                className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:border-primary/20 hover:bg-primary-cream/40 transition-all flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium"
              >
                Manuscript Guidelines & Template
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </button>
              <button 
                onClick={() => onNavigate('guidelines')}
                className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:border-primary/20 hover:bg-primary-cream/40 transition-all flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium"
              >
                Peer Review Statement
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </button>
              <button 
                onClick={() => onNavigate('guidelines')}
                className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:border-primary/20 hover:bg-primary-cream/40 transition-all flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium"
              >
                APC Pricing (Fee Waivers Available)
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>
          </section>

          {/* C. EDITORIAL ENDORSEMENTS */}
          <section className="text-left bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
            <h3 className="font-serif font-bold text-base text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-3 mb-4">Editorial Endorsements</h3>
            <p className="text-xs text-gray-500 italic leading-relaxed">
              "The Journal of Modern Science has proven itself to be a leading venue for rigorous and rapid peer reviews, ensuring that pivotal computational advances find their audience without months of administrative bottlenecks."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Prof. Vance"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="text-left">
                <h5 className="text-xs font-bold text-gray-800">Prof. Marcus Vance</h5>
                <span className="text-[10px] text-gray-400">Board Fellow, University of Oxford</span>
              </div>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
};
