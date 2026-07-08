/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Book, Shield, Send, ExternalLink, Globe2 } from 'lucide-react';
import { Button } from '../common/UI';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-primary text-gray-100 border-t-4 border-accent">
      
      {/* 1. Newsletter subscription bar */}
      <div className="border-b border-white/10 bg-primary-dark/40 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h4 className="font-serif font-bold text-lg sm:text-xl text-white">Subscribe to Call for Papers & Table of Contents</h4>
            <p className="text-sm text-gray-300 mt-1">Receive early notifications of upcoming Special Issues and major research bulletins.</p>
          </div>
          <form onSubmit={handleSubmit} className="w-full lg:max-w-md flex flex-col sm:flex-row gap-2 shrink-0">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter institutional email..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              />
            </div>
            <Button
              type="submit"
              variant="accent"
              className="px-5 shrink-0 flex items-center justify-center"
            >
              {subscribed ? 'Subscribed' : 'Join Digest'}
              <Send className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* 2. Core links directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Journal identity */}
          <div className="text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-white text-primary flex items-center justify-center font-serif font-black text-base">
                J
              </div>
              <span className="font-serif font-bold text-lg text-white">JMS</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              The Journal of Modern Science is an international, peer-reviewed, open-access publication. We publish pioneering research across computer architectures, biotechnology, and environmental engineering.
            </p>
            <div className="mt-5 flex gap-2.5">
              <span className="text-[10px] font-mono bg-white/10 px-2 py-1 rounded text-accent font-semibold">e-ISSN: 2474-9844</span>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-1 rounded text-accent font-semibold">p-ISSN: 0984-2474</span>
            </div>
          </div>

          {/* Column 2: Resources for Authors */}
          <div className="text-left">
            <h5 className="font-serif font-semibold text-sm tracking-wide text-accent uppercase mb-4">For Researchers</h5>
            <ul className="flex flex-col gap-2 text-xs text-gray-300">
              <li><button onClick={() => onNavigate('guidelines')} className="hover:text-accent hover:underline text-left">Manuscript Preparation Guidelines</button></li>
              <li><button onClick={() => onNavigate('guidelines')} className="hover:text-accent hover:underline text-left">Article Processing Charges (APCs)</button></li>
              <li><button onClick={() => onNavigate('guidelines')} className="hover:text-accent hover:underline text-left">Peer Review & Archiving Policies</button></li>
              <li><button onClick={() => onNavigate('current')} className="hover:text-accent hover:underline text-left">Current Special Issue Open Calls</button></li>
              <li><button onClick={() => onNavigate('login')} className="hover:text-accent hover:underline text-left">Submit Your Paper</button></li>
            </ul>
          </div>

          {/* Column 3: Indexing & Partnerships */}
          <div className="text-left">
            <h5 className="font-serif font-semibold text-sm tracking-wide text-accent uppercase mb-4">Indexed In</h5>
            <ul className="flex flex-col gap-2 text-xs text-gray-300">
              <li className="flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5 text-accent" /> Web of Science (SCIE)</li>
              <li className="flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5 text-accent" /> Scopus (Elsevier)</li>
              <li className="flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5 text-accent" /> PubMed Central (PMC)</li>
              <li className="flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5 text-accent" /> Directory of Open Access Journals (DOAJ)</li>
              <li className="flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5 text-accent" /> Crossref Metadata Search</li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div className="text-left">
            <h5 className="font-serif font-semibold text-sm tracking-wide text-accent uppercase mb-4">Editorial Office</h5>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              JMS Publishing House Ltd.<br />
              Research Quarter, Science Park Boulevard<br />
              Palo Alto, CA 94304, United States
            </p>
            <p className="text-xs text-gray-300">
              <strong>Support:</strong> support@nature-jms.org<br />
              <strong>Editor:</strong> editor@nature-jms.org
            </p>
          </div>

        </div>
      </div>

      {/* 3. Bottom legal row */}
      <div className="bg-primary-dark/80 py-5 px-4 sm:px-6 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Journal of Modern Science. All Rights Reserved. CC BY 4.0 Open Access.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">COPE Ethics Statement</a>
          </div>
        </div>
      </div>

    </footer>
  );
};
