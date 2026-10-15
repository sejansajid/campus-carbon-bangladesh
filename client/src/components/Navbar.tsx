import React, { useState } from 'react';
import { 
  ArrowRight, 
  Menu, 
  X,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'assessment' | 'resources';
  setCurrentView: (view: 'home' | 'assessment' | 'resources') => void;
  onStartAssessment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onStartAssessment
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-navy-100 sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none py-1" 
            onClick={() => setCurrentView('home')}
          >
            <img 
              src="/logo.png" 
              alt="Campus Carbon Bangladesh" 
              className="h-10 sm:h-11 w-auto object-contain" 
            />
            <div className="hidden lg:block border-l border-navy-200 pl-3">
              <div className="text-[10px] text-navy-500 font-medium">
                Higher Education Carbon Analytics & Decarbonization
              </div>
            </div>
          </div>

          {/* Desktop Navigation: Home | Assessment | Resources | CTA */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-navy-700">
            <button
              onClick={() => setCurrentView('home')}
              className={`hover:text-cobalt transition cursor-pointer py-1 ${
                currentView === 'home' ? 'text-cobalt font-bold border-b-2 border-cobalt' : ''
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setCurrentView('assessment')}
              className={`hover:text-cobalt transition cursor-pointer py-1 ${
                currentView === 'assessment' ? 'text-cobalt font-bold border-b-2 border-cobalt' : ''
              }`}
            >
              Assessment
            </button>

            <button
              onClick={() => setCurrentView('resources')}
              className={`hover:text-cobalt transition cursor-pointer py-1 ${
                currentView === 'resources' ? 'text-cobalt font-bold border-b-2 border-cobalt' : ''
              }`}
            >
              Resources
            </button>

            {/* Reset Draft CTA (when in Assessment) */}
            {currentView === 'assessment' && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('cc_reset_draft'));
                }}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                title="Reset all assessment draft data and start fresh"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                <span>Reset draft</span>
              </button>
            )}

            {/* Start Assessment CTA */}
            {currentView !== 'assessment' && (
              <button
                onClick={onStartAssessment}
                className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Start assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-navy-700 hover:text-navy-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-navy-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => {
              setCurrentView('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 font-medium ${currentView === 'home' ? 'text-cobalt font-bold' : 'text-navy-800'}`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentView('assessment');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 font-medium ${currentView === 'assessment' ? 'text-cobalt font-bold' : 'text-navy-800'}`}
          >
            Assessment
          </button>
          <button
            onClick={() => {
              setCurrentView('resources');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 font-medium ${currentView === 'resources' ? 'text-cobalt font-bold' : 'text-navy-800'}`}
          >
            Resources
          </button>

          {currentView === 'assessment' && (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('cc_reset_draft'));
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset assessment draft</span>
            </button>
          )}

          {currentView !== 'assessment' && (
            <button
              onClick={() => {
                onStartAssessment();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-cobalt text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <span>Start assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};
