/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, useToasts } from '../components/common/UI';
import { KeyRound, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { toasts, addToast, ToastComponent } = useToasts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('author');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast('Please enter both your email and password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const actualRole = await login(email, password, role);
      if (actualRole) {
        // Navigate using the role the backend actually assigned to this account,
        // not the tab the person had selected — those can differ if someone
        // signs in with, say, a reviewer account while "Author" is highlighted.
        if (actualRole !== role) {
          addToast(
            `Signed in as ${actualRole.toUpperCase()} (your account's actual role).`,
            'success'
          );
        } else {
          addToast(`Authenticated successfully as ${actualRole.toUpperCase()}!`, 'success');
        }
        setTimeout(() => {
          onNavigate(`dashboard_${actualRole}`);
        }, 1000);
      } else {
        addToast('Invalid email or password.', 'error');
      }
    } catch {
      addToast('Unable to sign in right now.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-left relative">
      {ToastComponent}
      <div className="max-w-4xl w-full glass-panel tilt-card rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative">

        {/* SIDEBAR: GENERAL PUBLISHING INFO */}
        <div className="bg-primary text-white p-8 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* subtle mesh decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--color-primary-light)_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/20 blur-3xl" />

          <div className="space-y-4 relative z-10">
            <span className="text-[10px] uppercase font-mono tracking-widest text-accent font-bold">Editorial Office Ingress</span>
            <h2 className="font-serif font-bold text-2.5xl leading-tight">Secure Manuscript & Review Portal</h2>
            <p className="text-sm text-gray-200 leading-relaxed font-light">
              Welcome to the Journal of Modern Science Submission Console. Authors can track peer-review progress, and assigned reviewers can submit technical score matrices.
            </p>
          </div>

          <div className="space-y-4 pt-10 border-t border-white/10 relative z-10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">Latest Editorial Policy</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              All uploads are scanned utilizing automated similarity crawlers. Ensure that co-author affiliations are declared in full.
            </p>
          </div>
        </div>

        {/* MAIN PANEL: AUTH FORM */}
        <div className="p-8 flex flex-col justify-center bg-white/40">
          <div className="mb-6">
            <h2 className="font-serif font-bold text-2xl text-gray-900 tracking-tight">Portal Authentication</h2>
            <p className="text-xs text-gray-500 mt-1">Please select your active role and sign in to access your specialized workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ROLE TOGGLE */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Your Active System Role</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-50 border border-gray-200 rounded-lg">
                {(['author', 'reviewer', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                      role === r
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Institutional Email"
              type="email"
              required
              placeholder="e.g. e.harrison@stanford.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-between items-center text-xs pb-1">
              <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer">
                <input type="checkbox" className="rounded text-primary border-gray-300 focus:ring-primary" /> Keep signed in
              </label>
              <button type="button" className="text-primary hover:underline font-semibold">Forgot credentials?</button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold py-2.5"
              isLoading={isSubmitting}
            >
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-400">
            Don't have an academic account?{' '}
            <button onClick={() => onNavigate('register')} className="text-primary hover:underline font-semibold">
              {role === 'reviewer' ? 'Register as Reviewer' : 'Register as Author'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
