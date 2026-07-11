/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FloatingShapes } from './components/common/FloatingShapes';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { CurrentIssue } from './pages/CurrentIssue';
import { Archives } from './pages/Archives';
import { Guidelines } from './pages/Guidelines';
import { Contact } from './pages/Contact';
import { Search } from './pages/Search';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthorDashboard } from './dashboard/AuthorDashboard';
import { ReviewerDashboard } from './dashboard/ReviewerDashboard';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { currentRole, isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('home');

  // Smooth scroll to top on page transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  // Route Guard: Redirect dashboard requests if unauthenticated
  const handleNavigate = (path: string) => {
    if (path.startsWith('dashboard_') && !isAuthenticated) {
      setCurrentPath('login');
      return;
    }
    setCurrentPath(path);
  };

  // Render Page Component Dynamically
  const renderPage = () => {
    switch (currentPath) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'current':
        return <CurrentIssue />;
      case 'archives':
        return <Archives />;
      case 'editorial':
      case 'about':
        return <About />;
      case 'guidelines':
        return <Guidelines />;
      case 'contact':
        return <Contact />;
      case 'search':
        return <Search />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      
      // Role-Based Dashboards
      case 'dashboard_author':
        return <AuthorDashboard />;
      case 'dashboard_reviewer':
        return <ReviewerDashboard />;
      case 'dashboard_admin':
        return <AdminDashboard />;
      
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  // Check if current view is a dashboard to dynamically hide public Footer
  const isDashboardView = currentPath.startsWith('dashboard_');

  return (
    <div className="min-h-screen flex flex-col bg-background-gray font-sans antialiased text-gray-800 selection:bg-primary/10 selection:text-primary relative">
      <FloatingShapes />

      {/* Dynamic Header */}
      <div className="relative z-10">
        <Navbar onNavigate={handleNavigate} currentPath={currentPath} />
      </div>

      {/* Main Container with Motion Page Transitions */}
      <main className="flex-grow flex flex-col w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full flex-grow flex flex-col"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dynamic Academic Footer (Hidden inside busy work dashboards) */}
      {!isDashboardView && (
        <div className="relative z-10">
          <Footer onNavigate={handleNavigate} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
