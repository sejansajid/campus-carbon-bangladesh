import React, { useState } from 'react';
import { 
  Building2, 
  Globe2, 
  ArrowRight, 
  Menu, 
  X,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { Language, t } from '../../../shared/i18n';

interface NavbarProps {
  currentView: 'home' | 'assessment' | 'resources';
  setCurrentView: (view: 'home' | 'assessment' | 'resources') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onStartAssessment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  lang,
  setLang,
  onStartAssessment
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isBn = lang === 'bn';

  return (
    <header className="bg-white border-b border-navy-100 sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => setCurrentView('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center text-white shadow-xs font-bold text-lg">
              CC
            </div>
            <div>
              <div className="font-extrabold text-navy-900 text-base leading-tight tracking-tight">
                Campus Carbon <span className="text-cobalt">Bangladesh</span>
              </div>
              <div className="text-[10px] text-navy-500 font-medium">
                {isBn ? 'উচ্চশিক্ষা কার্বন মূল্যায়ন ও রূপরেখা' : 'Higher Education Carbon Analytics'}
              </div>
            </div>
          </div>

          {/* Desktop Navigation: brand | Home | Assessment | Resources | language */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-navy-700">
            <button
              onClick={() => setCurrentView('home')}
              className={`hover:text-cobalt transition cursor-pointer py-1 ${
                currentView === 'home' ? 'text-cobalt font-bold border-b-2 border-cobalt' : ''
              }`}
            >
              {isBn ? 'হোম' : 'Home'}
            </button>

            <button
              onClick={() => setCurrentView('assessment')}
              className={`hover:text-cobalt transition cursor-pointer py-1 ${
                currentView === 'assessment' ? 'text-cobalt font-bold border-b-2 border-cobalt' : ''
              }`}
            >
              {isBn ? 'মূল্যায়ন' : 'Assessment'}
            </button>

            <button
              onClick={() => setCurrentView('resources')}
              className={`hover:text-cobalt transition cursor-pointer py-1 ${
                currentView === 'resources' ? 'text-cobalt font-bold border-b-2 border-cobalt' : ''
              }`}
            >
              {isBn ? 'রিসোর্স' : 'Resources'}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1.5 bg-navy-50 hover:bg-navy-100 text-navy-700 px-3 py-1.5 rounded-xl transition text-xs font-semibold cursor-pointer border border-navy-200"
              title="Toggle language English / বাংলা"
            >
              <Globe2 className="w-3.5 h-3.5 text-navy-500" />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Start Assessment CTA (Active when on Home or Resources) */}
            {currentView !== 'assessment' && (
              <button
                onClick={onStartAssessment}
                className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isBn ? 'মূল্যায়ন শুরু করুন' : 'Start assessment'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="px-2.5 py-1 text-xs font-bold bg-navy-50 rounded-lg text-navy-700 border border-navy-200"
            >
              {lang === 'en' ? 'বাং' : 'EN'}
            </button>

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
            {isBn ? 'হোম' : 'Home'}
          </button>
          <button
            onClick={() => {
              setCurrentView('assessment');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 font-medium ${currentView === 'assessment' ? 'text-cobalt font-bold' : 'text-navy-800'}`}
          >
            {isBn ? 'মূল্যায়ন' : 'Assessment'}
          </button>
          <button
            onClick={() => {
              setCurrentView('resources');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 font-medium ${currentView === 'resources' ? 'text-cobalt font-bold' : 'text-navy-800'}`}
          >
            {isBn ? 'রিসোর্স' : 'Resources'}
          </button>

          <div className="pt-2">
            <button
              onClick={() => {
                onStartAssessment();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-cobalt text-white font-bold text-center block shadow-2xs"
            >
              {isBn ? 'মূল্যায়ন শুরু করুন' : 'Start assessment'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
