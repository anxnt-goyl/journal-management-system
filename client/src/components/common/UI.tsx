/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';

// ==========================================
// BUTTON COMPONENT
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
    secondary: 'bg-white text-primary border border-primary/20 hover:bg-primary-cream hover:border-primary',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    accent: 'bg-accent text-primary-dark hover:bg-accent-dark font-semibold shadow-sm focus:ring-accent'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

// ==========================================
// INPUT FIELD COMPONENT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="w-full mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400 ${
          error ? 'border-red-500 focus:ring-red-100 focus:border-red-500' : 'border-gray-200'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="w-3.5 h-3.5 mr-1" />
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

// ==========================================
// SELECT COMPONENT
// ==========================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="w-full mb-4">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer ${
          error ? 'border-red-500 focus:ring-red-100 focus:border-red-500' : 'border-gray-200'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

// ==========================================
// BADGE & STATUS CHIP COMPONENTS
// ==========================================
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'primary' | 'neutral';
}> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    primary: 'bg-primary/5 text-primary border-primary/20',
    neutral: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'primary' | 'neutral' }> = {
    submitted: { label: 'Manuscript Submitted', variant: 'primary' },
    under_review: { label: 'In Peer Review', variant: 'info' },
    revision_requested: { label: 'Revision Required', variant: 'warning' },
    resubmitted: { label: 'Revision Submitted', variant: 'info' },
    accepted: { label: 'Manuscript Accepted', variant: 'success' },
    rejected: { label: 'Declined', variant: 'danger' },
    published: { label: 'Published in Issue', variant: 'success' }
  };

  const item = config[status] || { label: status, variant: 'neutral' };

  return <Badge variant={item.variant}>{item.label}</Badge>;
};

// ==========================================
// ACCORDION COMPONENT
// ==========================================
export const AccordionItem: React.FC<{
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200 py-3">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
      >
        <span className="font-semibold text-gray-800 hover:text-primary transition-colors text-sm sm:text-base">
          {title}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-1 text-sm text-gray-600 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// TABS COMPONENT
// ==========================================
interface Tab {
  id: string;
  label: string;
}

export const Tabs: React.FC<{
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex border-b border-gray-200 overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none ${
              isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// ==========================================
// MODAL COMPONENT (using Framer Motion)
// ==========================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
  const sizes = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`relative w-full ${sizes[size]} bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden`}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-serif font-semibold text-lg text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1 text-sm text-gray-600 leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-3.5 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// TOAST NOTIFICATIONS (Client Simulated)
// ==========================================
export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, transition: { duration: 0.15 } }}
            layout
            className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 bg-white text-gray-800 ${
              t.type === 'success' ? 'border-green-100 shadow-green-500/5' :
              t.type === 'error' ? 'border-red-100 shadow-red-500/5' : 'border-blue-100 shadow-blue-500/5'
            }`}
          >
            {t.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /> :
             t.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" /> :
             <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
            
            <div className="flex-1 text-xs sm:text-sm font-medium">{t.text}</div>
            
            <button
              onClick={() => onRemove(t.id)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none text-xs leading-none"
            >
              &times;
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Custom Hook to manage local alerts easily in pages
export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast, ToastComponent: <ToastContainer toasts={toasts} onRemove={removeToast} /> };
}
