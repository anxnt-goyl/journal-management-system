/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, useToasts } from '../components/common/UI';
import { UserPlus, ArrowLeft, GraduationCap } from 'lucide-react';
import { UserRole } from '../types';

interface RegisterProps {
  onNavigate: (path: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { toasts, addToast, ToastComponent } = useToasts();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState<UserRole>('author');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !institution.trim()) {
      addToast('Please fill out all required academic fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, institution, role);
      addToast(`Registration complete! Created your ${role.toUpperCase()} profile.`, 'success');
      setTimeout(() => {
        onNavigate(`dashboard_${role}`);
      }, 1200);
    } catch {
      addToast('Registration failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center bg-background-gray py-12 px-4 sm:px-6 lg:px-8 text-left">
      {ToastComponent}
      <div className="max-w-md w-full bg-white border border-gray-150 rounded-xl shadow-xl p-8 space-y-6">
        
        {/* TOP */}
        <div className="space-y-1.5 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-cream border border-primary/10 flex items-center justify-center text-primary mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-gray-900 tracking-tight">Academic Registration</h2>
          <p className="text-xs text-gray-500">Register as a submitting Author or technical peer Reviewer.</p>
        </div>

        {/* REGISTRATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ROLE TOGGLE */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Intended System Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('author')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  role === 'author'
                    ? 'bg-primary text-white border-primary font-bold'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Submitting Author
              </button>
              <button
                type="button"
                onClick={() => setRole('reviewer')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  role === 'reviewer'
                    ? 'bg-primary text-white border-primary font-bold'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Peer Reviewer
              </button>
            </div>
          </div>

          <Input
            label="Full Academic Name"
            required
            placeholder="e.g. Dr. Arthur Conan Doyle"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Institutional Email Address"
            required
            type="email"
            placeholder="e.g. doyle@edinburgh.ac.uk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Affiliation / Institution"
            required
            placeholder="e.g. University of Edinburgh"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />

          <div className="text-xs text-gray-500 leading-normal bg-gray-50 p-3 rounded-lg border border-gray-100 flex gap-2">
            <GraduationCap className="w-5 h-5 text-primary shrink-0" />
            <span>By registering, you agree to follow COPE Publishing Ethics and declare no severe conflicts of interest.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full font-bold py-2.5"
            isLoading={isSubmitting}
          >
            Create Academic Profile
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <button
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to portal sign-in
          </button>
        </div>

      </div>
    </div>
  );
};
