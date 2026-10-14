import React from 'react';
import { 
  Building2, 
  Globe2, 
  BarChart3, 
  MapPin, 
  GitCompare, 
  Lightbulb, 
  FileSpreadsheet, 
  FileText, 
  Settings, 
  Layers,
  Sparkles
} from 'lucide-react';
import { CalculationMethodTier } from '../../../shared/types';
import { Language, t } from '../../../shared/i18n';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  tier: CalculationMethodTier;
  setTier: (tier: CalculationMethodTier) => void;
  institutionName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  tier,
  setTier,
  institutionName
}) => {
  const navItems = [
    { id: 'overview', label: t('navOverview', lang), icon: BarChart3 },
    { id: 'boundaries', label: t('navBoundaries', lang), icon: Building2 },
    { id: 'collect', label: t('navCollect', lang), icon: FileSpreadsheet },
    { id: 'enter', label: t('navEnter', lang), icon: Layers },
    { id: 'results', label: t('navResults', lang), icon: BarChart3 },
    { id: 'map', label: t('navMap', lang), icon: MapPin },
    { id: 'compare', label: t('navCompare', lang), icon: GitCompare },
    { id: 'mitigation', label: t('navMitigation', lang), icon: Lightbulb },
    { id: 'factors', label: t('navFactors', lang), icon: Sparkles },
    { id: 'reports', label: t('navReports', lang), icon: FileText }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-slate-100 text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            {institutionName}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">
            Methodology: IEEE Access 2025 / GHG Protocol HEI Standard
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Tier Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
            <span className="text-slate-500 px-1 font-medium">Calculation Tier:</span>
            <button
              onClick={() => setTier('current_inventory_method')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                tier === 'current_inventory_method'
                  ? 'bg-white text-teal-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Standard reviewed GHG Protocol method: ODS out-of-scope, T&D in Scope 3"
            >
              Current Method
            </button>
            <button
              onClick={() => setTier('legacy_study_reproduction')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                tier === 'legacy_study_reproduction'
                  ? 'bg-amber-100 text-amber-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Exact replication of original ULAB research spreadsheet calculations (2,498.79 tCO2e)"
            >
              Legacy Reproduction
            </button>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition font-medium"
            title="Toggle language English / Bangla"
          >
            <Globe2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('overview')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-600 to-forest-700 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              CC
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base leading-tight">
                Campus Carbon <span className="text-teal-700">Bangladesh</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                National HEI Decarbonization Platform
              </div>
            </div>
          </div>

          <nav className="flex space-x-1 overflow-x-auto py-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
