/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, BookOpen, Users, Compass, HelpCircle } from 'lucide-react';
import { AccordionItem } from '../components/common/UI';

export const About: React.FC = () => {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const editorialMembers = [
    {
      name: 'Prof. Alistair Sterling',
      role: 'Editor-in-Chief',
      institution: 'Journal of Modern Science Publishing / Stanford Academic Press',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      bio: 'Former director of high-energy physics at Stanford. Research interests span subatomic particles, neural-matrix architectures, and global open publication science.'
    },
    {
      name: 'Prof. Marcus Vance',
      role: 'Associate Editor (Quantum & Computer Architectures)',
      institution: 'Oxford e-Research Centre, University of Oxford',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Lead fellow on parallel processing nodes, cryptographic zero-knowledge frameworks, and advanced silicon optimization.'
    },
    {
      name: 'Dr. Kenji Tanaka',
      role: 'Associate Editor (Climate Systems & Environmental Engineering)',
      institution: 'Tokyo Institute of Technology, Japan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Recipient of the Global Ecology Prize. Focuses on advanced hydro-geologic sensing, LSTM climate predictions, and coastal salinity modeling.'
    },
    {
      name: 'Dr. Sarah Lee',
      role: 'Editor (Materials & Nano-structures)',
      institution: 'Massachusetts Institute of Technology (MIT)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Pioneered several printed biodegradable zinc-air batteries. Investigates synthetic biology and biocompatible epidermal patches.'
    }
  ];

  const faqs = [
    {
      q: 'What are the publication charges (APCs) for Journal of Modern Science?',
      a: 'The Journal of Modern Science is a pure Open Access journal. To sustain server infrastructure and rigorous archiving pipelines, we charge an Article Processing Charge (APC) of $1,200 USD upon formal manuscript acceptance. However, fully funded fee waivers are available for authors from low-and-middle-income countries and independent PhD scholars.'
    },
    {
      q: 'How long does the peer review process take?',
      a: 'Our average submission-to-decision timeline is 38 days. The first editorial screening takes 3-5 days. If passed, the peer-review process (handled by three blind independent specialists) typically concludes in 21-30 days, followed by author revisions.'
    },
    {
      q: 'Is the journal indexed in Web of Science or Scopus?',
      a: 'Yes, the Journal of Modern Science has been accepted and indexed in Scopus, Clarivate Web of Science (Science Citation Index Expanded), PubMed Central (PMC), and the Directory of Open Access Journals (DOAJ).'
    },
    {
      q: 'What copyright licensing terms are applied to published manuscripts?',
      a: 'All published articles are distributed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). Under this license, authors retain complete copyright, and the public is granted permission to share, copy, and build upon the work, provided proper citation is given.'
    }
  ];

  return (
    <div className="w-full bg-background-gray py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* HEADER SECTION */}
        <div className="text-center">
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">Aim, Scope & Editorial Board</h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto mt-3">Learn about our academic directives, founding editors, and open research publishing statements.</p>
        </div>

        {/* 1. AIM & SCOPE */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm text-left">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <Compass className="w-6 h-6 text-primary" />
            <h2 className="font-serif font-bold text-xl text-gray-900">Aim & Academic Scope</h2>
          </div>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              The <strong className="font-serif font-bold text-primary">Journal of Modern Science (JMS)</strong> aims to accelerate the dissemination of breakthrough computational, physical, and engineering innovations. We believe that critical academic knowledge should not be kept behind commercial paywalls; hence, our entire catalog is open access without user subscription fees.
            </p>
            <p>
              Our publication scope is highly selective and prioritizes research papers demonstrating high theoretical novelty alongside robust experimental or simulated validations. We actively publish in the following core disciplines:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-500">
              <li><strong>Computer Science & Generative AI:</strong> Parameterized quantum networks, foundational transformer designs, graph neural architectures, and cognitive machine alignment.</li>
              <li><strong>Environmental Engineering & Climate Systems:</strong> LSTM-based coastal saltwater modeling, hydraulic-head modeling, green biogas processing, and tidal geodetic simulations.</li>
              <li><strong>Electrical Engineering & IoT:</strong> Secure smart grid consensus systems, homomorphic lattice architectures, edge microgrids, and hardware attestation loops.</li>
              <li><strong>Materials Science & Biomedical Sensors:</strong> Biodegradable zinc-air diagnostic batteries, micro-hydroelectric inlets, wearable sensor arrays, and biocompatible polymers.</li>
            </ul>
          </div>
        </section>

        {/* 2. EDITORIAL BOARD */}
        <section className="text-left">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="font-serif font-bold text-xl text-gray-900">Governing Editorial Board</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editorialMembers.map((member, idx) => (
              <div key={idx} className="academic-card p-6 bg-white flex items-start gap-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-primary/10"
                />
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-gray-900 leading-tight">{member.name}</h4>
                  <p className="text-xs font-semibold text-accent leading-none">{member.role}</p>
                  <p className="text-[11px] font-medium text-gray-400 leading-tight">{member.institution}</p>
                  <p className="text-xs text-gray-500 mt-2.5 leading-relaxed line-clamp-3 italic">
                    "{member.bio}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. FAQ SECTION */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm text-left">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h2 className="font-serif font-bold text-xl text-gray-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                title={faq.q}
                isOpen={openFaqIdx === idx}
                onToggle={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
              >
                {faq.a}
              </AccordionItem>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
