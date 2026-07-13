/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, FileCheck, HelpCircle, Download, FileText, CheckSquare, Square } from 'lucide-react';
import { Button, useToasts } from '../components/common/UI';

export const Guidelines: React.FC = () => {
  const { toasts, addToast, ToastComponent } = useToasts();
  const [checklist, setChecklist] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
  });

  const toggleCheck = (idx: number) => {
    setChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const downloadTemplate = (formatName: 'LaTeX' | 'Word') => {
    const fileMap: Record<'LaTeX' | 'Word', { path: string; filename: string }> = {
      LaTeX: { path: '/templates/JMS_LaTeX_Template.tex', filename: 'JMS_LaTeX_Template.tex' },
      Word: { path: '/templates/JMS_Word_Template.docx', filename: 'JMS_Word_Template.docx' },
    };
    const { path, filename } = fileMap[formatName];

    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Downloading manuscript template: ${filename}`, 'success');
  };

  const checklistItems = [
    'The submission has not been previously published, nor is it under consideration by another journal.',
    'The manuscript file is in PDF format, and all figures/tables are embedded directly in the text.',
    'The text is double-spaced, using 12pt Garamond or Times New Roman, and has line numbers enabled.',
    'All references match IEEE (for computing/engineering) or Harvard (for biological/environmental sciences) standards.',
    'An independent abstract (max 250 words) and 3 to 6 keywords are declared on page one.',
    'All author names, institutions, and emails are specified exactly inside the submission form.'
  ];

  const allChecked = Object.values(checklist).every(v => v);

  return (
    <div className="w-full bg-background-gray py-12 px-4 sm:px-6 lg:px-8 text-left">
      {ToastComponent}
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="text-center">
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">Instructions for Authors</h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto mt-3">Comprehensive formatting and ethical requirements for manuscript submissions.</p>
        </div>

        {/* GUIDELINES DIRECTORY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            
            {/* 1. MANUSCRIPT FORMATTING */}
            <section className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif font-bold text-lg sm:text-xl text-gray-900 border-b border-gray-100 pb-3 mb-4">1. Manuscript Organization</h2>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  To ensure rapid double-blind peer review, please structure your research manuscript following standard IMRAD conventions:
                </p>
                <ol className="list-decimal pl-5 space-y-3 text-xs sm:text-sm text-gray-500">
                  <li><strong>Title Page:</strong> Title, absolute author list, institutional affiliations, corresponding emails, funding disclosures.</li>
                  <li><strong>Abstract & Keywords:</strong> Single paragraph structured abstract (Aims, Methods, Results, Practical Significance) not exceeding 250 words.</li>
                  <li><strong>Introduction:</strong> Background state-of-the-art literature review, problem formulation, and explicit academic contribution.</li>
                  <li><strong>Materials & Methodology:</strong> Mathematical formalisms, experimental systems, simulation parameters, and sensor setups to allow 100% scientific replication.</li>
                  <li><strong>Results & Discussions:</strong> Comprehensive analysis of outcomes, comparing achievements with existing standard reference algorithms.</li>
                  <li><strong>References:</strong> Peer-reviewed sources only. No self-citations exceeding 10% of total bibliography.</li>
                </ol>
              </div>
            </section>

            {/* 2. PLAGIARISM & ETHICS */}
            <section className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif font-bold text-lg sm:text-xl text-gray-900 border-b border-gray-100 pb-3 mb-4">2. Ethics & Plagiarism Statement</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                The Journal of Modern Science takes academic integrity with absolute seriousness. All submitted drafts undergo cross-examination using Turnitin Similarity Reports. A similarity threshold exceeding 15% (excluding reference listing) will prompt instant desk rejection by the Editor-in-Chief. AI-generated text must be clearly annotated under the Acknowledgements statement, identifying exact tools and prompt guidelines utilized.
              </p>
            </section>

          </div>

          {/* SIDEBAR CHECKS & TEMPLATE DOWNLOADS */}
          <div className="space-y-6">
            
            {/* A. TEMPLATE DOWNLOAD CARD */}
            <div className="bg-primary text-white rounded-xl p-6 shadow-sm border border-primary/20 space-y-4">
              <h3 className="font-serif font-bold text-base text-white">Manuscript Templates</h3>
              <p className="text-xs text-gray-200 leading-relaxed">
                Please prepare your final manuscript files using our official templates to guarantee quick layouts.
              </p>
              
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => downloadTemplate('LaTeX')}
                  className="w-full bg-white/10 hover:bg-white/15 text-white py-2 px-3 rounded text-xs font-semibold flex items-center justify-between border border-white/10 transition-colors"
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> LaTeX Template</span>
                  <Download className="w-3.5 h-3.5 text-accent" />
                </button>
                <button
                  onClick={() => downloadTemplate('Word')}
                  className="w-full bg-white/10 hover:bg-white/15 text-white py-2 px-3 rounded text-xs font-semibold flex items-center justify-between border border-white/10 transition-colors"
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> MS Word Template</span>
                  <Download className="w-3.5 h-3.5 text-accent" />
                </button>
              </div>
            </div>

            {/* B. SUBMISSION CHECKLIST */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm text-left">
              <h3 className="font-serif font-bold text-base text-gray-900 border-b border-gray-100 pb-2.5 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Submission Checklist
              </h3>
              
              <div className="space-y-3.5">
                {checklistItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className="w-full flex items-start gap-3 text-left focus:outline-none"
                  >
                    {checklist[idx] ? (
                      <CheckSquare className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4.5 h-4.5 text-gray-300 shrink-0 mt-0.5" />
                    )}
                    <span className="text-xs text-gray-600 leading-normal">{item}</span>
                  </button>
                ))}
              </div>

              {allChecked && (
                <div className="mt-5 p-3.5 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700 font-semibold text-center animate-pulse">
                  ✓ Your submission is ready! Proceed to the author login to submit.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
