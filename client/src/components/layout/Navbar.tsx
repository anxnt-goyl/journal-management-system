/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, User, LogOut, Menu, X, ArrowRight, ShieldCheck, HelpCircle, Sun, Moon } from 'lucide-react';
import { Button } from '../common/UI';

interface NavbarProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPath }) => {
  const { user, currentRole, switchRole, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: 'home' },
    { label: 'Current Issue', path: 'current' },
    { label: 'Archives', path: 'archives' },
    { label: 'Editorial Board', path: 'editorial' },
    { label: 'Author Guidelines', path: 'guidelines' },
    { label: 'Contact', path: 'contact' }
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const getDashboardPath = (role: string) => {
    return `dashboard_${role}`;
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      {/* 1. DEMO ROLE SELECTOR ACCENT BAR */}
      <div className="w-full bg-primary-cream border-b border-primary/10 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono uppercase tracking-wider text-[10px] bg-primary/10 px-1.5 py-0.5 rounded mr-1">Demo Mode</span>
            Instant dashboard role simulation:
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => switchRole('author')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                currentRole === 'author'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Author Profile
            </button>
            <button
              onClick={() => switchRole('reviewer')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                currentRole === 'reviewer'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Peer Reviewer
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                currentRole === 'admin'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Managing Editor
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-primary flex items-center justify-center text-white font-serif font-bold text-lg group-hover:scale-105 transition-transform">
              JMS
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-gray-900 leading-tight">
                Journal of Modern Science
              </span>
              <span className="text-[10px] font-mono tracking-widest text-accent font-semibold uppercase leading-tight">
                Peer-Reviewed • Open Access
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-primary bg-primary-cream font-semibold' 
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-accent rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              title={theme === 'premium' ? 'Switch to modern light theme' : 'Switch to dark premium theme'}
            >
              {theme === 'premium' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleLinkClick('search')}
              className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
              title="Search published articles"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleLinkClick(getDashboardPath(currentRole || 'author'))}
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Button>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-1 pr-3">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover border border-primary/10"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-gray-800 leading-none">{user?.name.split(' ')[1] || 'User'}</span>
                    <span className="text-[9px] font-mono capitalize text-primary font-medium">{currentRole}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLinkClick('login')}
                  className="text-gray-600 hover:text-primary font-medium text-sm px-3.5 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleLinkClick('login')}
                >
                  Submit Manuscript
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-accent rounded-lg transition-colors border border-gray-200"
              title="Toggle theme"
            >
              {theme === 'premium' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleLinkClick('search')}
              className="p-2 text-gray-500 hover:text-primary rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white py-4 px-4 shadow-inner flex flex-col gap-3">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-primary bg-primary-cream font-bold' 
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <hr className="border-gray-100" />

          {isAuthenticated ? (
            <div className="flex flex-col gap-2.5 py-1">
              <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</span>
                  <span className="text-[10px] text-gray-500 mt-1">{user?.institution}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleLinkClick(getDashboardPath(currentRole || 'author'))}
                >
                  Go to Dashboard
                </Button>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => handleLinkClick('login')}
                className="w-full text-center text-gray-600 hover:text-primary font-medium py-2 rounded-lg text-sm transition-colors border border-gray-100"
              >
                Sign In
              </button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleLinkClick('login')}
              >
                Submit Manuscript
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
