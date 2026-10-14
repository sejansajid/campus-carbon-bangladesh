import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Homepage } from './components/Homepage';
import { AssessmentFlow } from './components/AssessmentFlow';
import { ResourcesPage } from './components/ResourcesPage';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'assessment' | 'resources'>('home');

  // URL Hash Sync for bookmarkability and seamless navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash.startsWith('assessment')) {
        setCurrentView('assessment');
      } else if (hash.startsWith('resources')) {
        setCurrentView('resources');
      } else if (hash.startsWith('demo')) {
        // Bookmarked demo links redirect cleanly to assessment
        setCurrentView('assessment');
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: 'home' | 'assessment' | 'resources') => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartAssessment = () => {
    navigateTo('assessment');
  };

  const handleViewExample = () => {
    window.location.hash = 'assessment/example';
    setCurrentView('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col selection:bg-cobalt-100 selection:text-navy-950 font-sans">
      {/* 1. Global Navigation: brand | Home | Assessment | Resources */}
      <Navbar
        currentView={currentView}
        setCurrentView={navigateTo}
        onStartAssessment={handleStartAssessment}
      />

      {/* 2. Main Page Shell */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'home' && (
          <Homepage
            onStartAssessment={handleStartAssessment}
            onViewExample={handleViewExample}
          />
        )}

        {currentView === 'assessment' && (
          <AssessmentFlow />
        )}

        {currentView === 'resources' && (
          <ResourcesPage />
        )}
      </main>

      {/* 3. Compact Professional Footer */}
      <footer className="bg-white border-t border-navy-100 py-6 text-xs text-navy-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-navy-800">Campus Carbon Bangladesh</span>
            <span>•</span>
            <span className="text-navy-600">Higher Education Carbon Accounting & Decarbonization Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-navy-400 text-[11px]">
            <span>GHG Protocol Corporate Standard</span>
            <span>•</span>
            <span>IPCC AR6 100-Year GWP</span>
            <span>•</span>
            <span>Bangladesh SREDA Grid Factor</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} OpenStreetMap</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
