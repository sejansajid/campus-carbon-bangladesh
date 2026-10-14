import React, { useState } from 'react';
import { 
  Building2, 
  Globe2, 
  BarChart3, 
  MapPin, 
  GitCompare, 
  Lightbulb, 
  FileSpreadsheet, 
  FileText, 
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Home,
  Menu,
  X
} from 'lucide-react';
import { CalculationMethodTier } from '../../../shared/types';
import { Language, t } from '../../../shared/i18n';

interface NavbarProps {
  currentView: 'home' | 'demo' | 'workspace' | 'resources';
  setCurrentView: (view: 'home' | 'demo' | 'workspace' | 'resources') => void;
  workspaceTab: string;
  setWorkspaceTab: (tab: string) => void;
  resourcesSub: 'factors' | 'methodology' | 'help';
  setResourcesSub: (sub: 'factors' | 'methodology' | 'help') => void;
  isDemo: boolean;
  institutionName: string;
  lang: Language;
  setLang: (lang: Language) => void;
  tier: CalculationMethodTier;
  setTier: (tier: CalculationMethodTier) => void;
  onStartAssessment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  workspaceTab,
  setWorkspaceTab,
  resourcesSub,
  setResourcesSub,
  isDemo,
  institutionName,
  lang,
  setLang,
  tier,
  setTier,
  onStartAssessment
}) => {
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isBn = lang === 'bn';

  return (
    <header className="bg-white border-b border-navy-100 sticky top-0 z-50">
      {/* 1. Global Context Bar for Demo or Workspace Mode */}
      {currentView !== 'home' && (
        <div className={`px-4 sm:px-6 lg:px-8 py-2 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
          isDemo ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-navy-50/80 border-navy-200 text-navy-900'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('home')}
              className="inline-flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{isBn ? 'হোমপেজে ফিরুন' : 'Back to Home'}</span>
            </button>
            <span className="text-navy-300">|</span>
            <span className="font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cobalt" />
              {isDemo ? (
                <span>
                  {isBn ? 'ইউল্যাব ২০২২ গবেষণা ডেমো — ঐতিহাসিক পদ্ধতি (রিড-অনলি)' : 'ULAB 2022 Study Demo — Historical Method (Read-Only Fixture)'}
                </span>
              ) : (
                <span>Workspace: {institutionName}</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isDemo ? (
              <button
                onClick={onStartAssessment}
                className="px-3 py-1 rounded-lg bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
              >
                {isBn ? 'আপনার বিশ্ববিদ্যালয়ের জন্য শুরু করুন' : 'Create my institution’s assessment'}
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-navy-500 font-medium">Method:</span>
                <select
                  value={tier}
                  onChange={e => setTier(e.target.value as CalculationMethodTier)}
                  className="bg-white border border-navy-200 rounded px-2 py-0.5 text-xs text-navy-800"
                >
                  <option value="current_inventory_method">Standardized Method (GHG Protocol)</option>
                  <option value="legacy_study_reproduction">Historical Reference Reproduction</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setCurrentView('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              CC
            </div>
            <div>
              <div className="font-extrabold text-navy-900 text-base leading-tight tracking-tight">
                Campus Carbon <span className="text-cobalt">Bangladesh</span>
              </div>
              <div className="text-[10px] text-navy-500 font-medium">
                Higher Education Emissions Analytics
              </div>
            </div>
          </div>

          {/* Desktop Short Public Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-navy-700">
            <button
              onClick={() => setCurrentView('home')}
              className={`hover:text-cobalt transition cursor-pointer ${
                currentView === 'home' ? 'text-cobalt font-bold' : ''
              }`}
            >
              {isBn ? 'কিভাবে কাজ করে' : 'How it works'}
            </button>

            <button
              onClick={() => {
                setCurrentView('demo');
                setWorkspaceTab('results');
              }}
              className={`hover:text-cobalt transition cursor-pointer ${
                currentView === 'demo' ? 'text-cobalt font-bold' : ''
              }`}
            >
              {isBn ? 'ইউল্যাব ২০২২ ডেমো' : 'ULAB 2022 demo'}
            </button>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowResourcesMenu(!showResourcesMenu)}
                className="flex items-center gap-1 hover:text-cobalt transition cursor-pointer"
              >
                <span>{isBn ? 'রিসোর্স ও তথ্য' : 'Resources'}</span>
                <ChevronDown className="w-4 h-4 text-navy-400" />
              </button>

              {showResourcesMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-navy-100 shadow-lg p-2 text-xs space-y-1 z-50 animate-fadeIn"
                  onMouseLeave={() => setShowResourcesMenu(false)}
                >
                  <button
                    onClick={() => {
                      setCurrentView('resources');
                      setResourcesSub('factors');
                      setShowResourcesMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-navy-50 flex items-center gap-2 cursor-pointer text-navy-800"
                  >
                    <Sparkles className="w-4 h-4 text-cobalt" />
                    <div>
                      <div className="font-semibold">{isBn ? 'নির্গমন ফ্যাক্টরসমূহ' : 'Emission Factors'}</div>
                      <div className="text-[10px] text-navy-400">Regional & IPCC database</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('resources');
                      setResourcesSub('methodology');
                      setShowResourcesMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-navy-50 flex items-center gap-2 cursor-pointer text-navy-800"
                  >
                    <BookOpen className="w-4 h-4 text-cobalt" />
                    <div>
                      <div className="font-semibold">{isBn ? 'পদ্ধতি ও রেফারেন্স' : 'Methodology & References'}</div>
                      <div className="text-[10px] text-navy-400">Study citations & math</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('resources');
                      setResourcesSub('help');
                      setShowResourcesMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-navy-50 flex items-center gap-2 cursor-pointer text-navy-800"
                  >
                    <HelpCircle className="w-4 h-4 text-cobalt" />
                    <div>
                      <div className="font-semibold">{isBn ? 'সহায়তা ও সেবা স্থিতি' : 'Integration Status & Help'}</div>
                      <div className="text-[10px] text-navy-400">Verified system capabilities</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1.5 bg-navy-50 hover:bg-navy-100 text-navy-700 px-3 py-1.5 rounded-xl transition text-xs font-semibold cursor-pointer border border-navy-200"
              title="Toggle language English / বাংলা"
            >
              <Globe2 className="w-3.5 h-3.5 text-navy-500" />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Start an Assessment Primary CTA */}
            <button
              onClick={onStartAssessment}
              className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isBn ? 'মূল্যায়ন শুরু করুন' : 'Start an assessment'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="px-2.5 py-1 text-xs font-bold bg-navy-50 rounded-lg text-navy-700"
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
            className="w-full text-left py-2 font-medium text-navy-800"
          >
            {isBn ? 'কিভাবে কাজ করে' : 'How it works'}
          </button>
          <button
            onClick={() => {
              setCurrentView('demo');
              setWorkspaceTab('results');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-medium text-navy-800"
          >
            {isBn ? 'ইউল্যাব ২০২২ ডেমো' : 'ULAB 2022 demo'}
          </button>
          <button
            onClick={() => {
              setCurrentView('resources');
              setResourcesSub('methodology');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-medium text-navy-800"
          >
            {isBn ? 'পদ্ধতি ও রেফারেন্স' : 'Methodology & References'}
          </button>
          <button
            onClick={() => {
              setCurrentView('resources');
              setResourcesSub('factors');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 font-medium text-navy-800"
          >
            {isBn ? 'নির্গমন ফ্যাক্টরসমূহ' : 'Emission Factors'}
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                onStartAssessment();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-cobalt text-white font-bold text-center block"
            >
              {isBn ? 'মূল্যায়ন শুরু করুন' : 'Start an assessment'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
