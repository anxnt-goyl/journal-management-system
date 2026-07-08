/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Info } from 'lucide-react';
import { Button, Input, useToasts } from '../components/common/UI';

export const Contact: React.FC = () => {
  const { toasts, addToast, ToastComponent } = useToasts();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'author',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast('Inquiry sent successfully! Our editorial office will respond in 24-48 hours.', 'success');
      setFormData({
        name: '',
        email: '',
        role: 'author',
        subject: '',
        message: ''
      });
    }, 1200);
  };

  return (
    <div className="w-full bg-background-gray py-12 px-4 sm:px-6 lg:px-8 text-left">
      {ToastComponent}
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="text-center">
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">Contact Editorial Office</h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto mt-3">Need help with paper templates, review delays, or fee waiver requests? Send us an inquiry.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* DIRECTORY DETAILS */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 p-5 rounded-xl space-y-5 shadow-xs">
              
              <div className="flex gap-4 items-start">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-gray-900 leading-none">Global Office</h4>
                  <p className="text-xs text-gray-500 leading-normal mt-2">
                    JMS Publishing House Ltd.<br />
                    Research Quarter, Science Park Boulevard<br />
                    Palo Alto, CA 94304, USA
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start border-t border-gray-100 pt-4">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-gray-900 leading-none">Inquiries Desk</h4>
                  <p className="text-xs text-gray-500 mt-1">support@nature-jms.org</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">Mon-Fri (09:00 - 18:00 UTC)</p>
                </div>
              </div>

              <div className="flex gap-4 items-start border-t border-gray-100 pt-4">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-gray-900 leading-none">Telephone Support</h4>
                  <p className="text-xs text-gray-500 mt-1">+1 (650) 412-2470</p>
                </div>
              </div>

            </div>

            <div className="bg-primary-cream border border-primary/10 p-5 rounded-xl">
              <h4 className="font-serif font-bold text-sm text-primary flex items-center gap-1.5 mb-2">
                <Info className="w-4.5 h-4.5 text-accent" />
                Waiver Application Notice
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                If applying for Article Processing Charge (APC) waivers, please contact our Editorial Office BEFORE uploading your draft, indicating your institution and active funding status.
              </p>
            </div>
          </div>

          {/* CONTACT FORM CARD */}
          <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-xl shadow-xs md:col-span-2 text-left">
            <h3 className="font-serif font-bold text-lg text-gray-900 border-b border-gray-150 pb-3 mb-6">Send an Inquiry</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name *"
                  required
                  placeholder="e.g. Dr. John Watson"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="Institutional Email *"
                  required
                  type="email"
                  placeholder="e.g. watson@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Your Primary Role
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="author">Journal Author</option>
                    <option value="reviewer">Peer Reviewer</option>
                    <option value="reader">General Academic Reader</option>
                  </select>
                </div>
                <Input
                  label="Subject Title"
                  placeholder="e.g. Manuscript status delay"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Message Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Elaborate on your inquiry or specific manuscript DOI/ID..."
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400 leading-normal"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto font-bold py-2.5 px-6"
                isLoading={isSubmitting}
              >
                Submit Inquiry
                <Send className="w-3.5 h-3.5 ml-2" />
              </Button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
