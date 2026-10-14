import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Homepage } from './components/Homepage';
import { SetupWizard } from './components/SetupWizard';
import { RouteACollectKit } from './components/RouteACollectKit';
import { RouteBGuidedEntry } from './components/RouteBGuidedEntry';
import { Dashboard } from './components/Dashboard';
import { CampusMap } from './components/CampusMap';
import { FairComparison } from './components/FairComparison';
import { PolicyActionPlan } from './components/PolicyActionPlan';
import { FactorRegistryBrowser } from './components/FactorRegistryBrowser';
import { MethodologyReferences } from './components/MethodologyReferences';
import { IntegrationHelp } from './components/IntegrationHelp';
import { ReportExporter } from './components/ReportExporter';

import { 
  Building2, 
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
  ShieldCheck,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';

import { 
  Institution, 
  PopulationRecord, 
  CampusBoundary, 
  InventoryCalculationResult, 
  SustainabilityAction, 
  CalculationMethodTier 
} from '../../shared/types';
import { Language, t } from '../../shared/i18n';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'demo' | 'workspace' | 'resources'>('home');
  const [workspaceTab, setWorkspaceTab] = useState<string>('results');
  const [resourcesSub, setResourcesSub] = useState<'factors' | 'methodology' | 'help'>('methodology');
  const [lang, setLang] = useState<Language>('en');
  const [tier, setTier] = useState<CalculationMethodTier>('current_inventory_method');

  // ULAB Benchmark Demo Data State (Frozen historical fixture)
  const [ulabInstitution, setUlabInstitution] = useState<Institution>({
    id: 'INST-ULAB',
    name: 'University of Liberal Arts Bangladesh',
    nameBn: 'ইউনিভার্সিটি অব লিবারেল আর্টস বাংলাদেশ',
    type: 'private',
    division: 'Dhaka',
    district: 'Dhaka',
    address: 'Permanent Campus, Mohammadpur, Dhaka 1207, Bangladesh',
    consolidationMethod: 'operational_control',
    reportingYear: 2022,
    periodStart: '2022-01-01',
    periodEnd: '2022-12-31',
    periodType: 'calendar_year',
    optInPublicComparison: true,
    createdAt: '2022-01-01T00:00:00Z',
    updatedAt: '2025-09-02T10:00:00Z'
  });

  const [ulabPopulation, setUlabPopulation] = useState<PopulationRecord>({
    id: 'POP-ULAB-2022',
    institutionId: 'INST-ULAB',
    year: 2022,
    studentHeadcount: 4860,
    facultyHeadcount: 240,
    staffHeadcount: 250,
    totalHeadcount: 5350,
    campusOperatingDaysPerYear: 294,
    sourceCitation: 'ULAB Registrar 2022'
  });

  const [ulabBoundary, setUlabBoundary] = useState<CampusBoundary>({
    id: 'CAMPUS-ULAB-PERMANENT',
    institutionId: 'INST-ULAB',
    name: 'Permanent Campus',
    isMainCampus: true,
    centerCoordinates: [23.7547, 90.3582],
    grossFloorAreaM2: 24500,
    landAreaAcres: 5.5,
    numberOfBuildings: 3,
    geometrySource: 'drawn',
    confirmedByInstitution: true
  });

  const [ulabRun, setUlabRun] = useState<InventoryCalculationResult | undefined>(undefined);
  const [ulabActions, setUlabActions] = useState<SustainabilityAction[]>([]);

  // Independent Institution Assessment State (Blank / User Assessment)
  const [userInstitution, setUserInstitution] = useState<Institution>({
    id: 'INST-NEW',
    name: 'My University Assessment',
    nameBn: 'আমার বিশ্ববিদ্যালয় মূল্যায়ন',
    type: 'private',
    division: 'Dhaka',
    district: 'Dhaka',
    address: '',
    consolidationMethod: 'operational_control',
    reportingYear: new Date().getFullYear() - 1,
    periodStart: `${new Date().getFullYear() - 1}-01-01`,
    periodEnd: `${new Date().getFullYear() - 1}-12-31`,
    periodType: 'calendar_year',
    optInPublicComparison: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [userPopulation, setUserPopulation] = useState<PopulationRecord>({
    id: 'POP-NEW',
    institutionId: 'INST-NEW',
    year: new Date().getFullYear() - 1,
    studentHeadcount: 0,
    facultyHeadcount: 0,
    staffHeadcount: 0,
    totalHeadcount: 0,
    campusOperatingDaysPerYear: 0,
    sourceCitation: ''
  });

  const [userBoundary, setUserBoundary] = useState<CampusBoundary>({
    id: 'CAMPUS-NEW',
    institutionId: 'INST-NEW',
    name: 'Main Campus',
    isMainCampus: true,
    centerCoordinates: [23.7547, 90.3582],
    grossFloorAreaM2: 0,
    landAreaAcres: 0,
    numberOfBuildings: 1,
    geometrySource: 'drawn',
    confirmedByInstitution: false
  });

  const [userRun, setUserRun] = useState<InventoryCalculationResult | undefined>(undefined);
  const [userActions, setUserActions] = useState<SustainabilityAction[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('demo')) {
        setCurrentView('demo');
        const parts = hash.split('/');
        if (parts[1]) setWorkspaceTab(parts[1]);
      } else if (hash.startsWith('workspace')) {
        setCurrentView('workspace');
        const parts = hash.split('/');
        if (parts[1]) setWorkspaceTab(parts[1]);
      } else if (hash.startsWith('resources')) {
        setCurrentView('resources');
        const parts = hash.split('/');
        if (parts[1] === 'factors' || parts[1] === 'methodology' || parts[1] === 'help') {
          setResourcesSub(parts[1]);
        }
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

  // Update URL hash whenever view changes
  const navigateTo = (view: 'home' | 'demo' | 'workspace' | 'resources', tab?: string) => {
    setCurrentView(view);
    if (tab) setWorkspaceTab(tab);
    if (view === 'home') {
      window.location.hash = 'home';
    } else if (view === 'demo') {
      window.location.hash = `demo/${tab || workspaceTab}`;
    } else if (view === 'workspace') {
      window.location.hash = `workspace/${tab || workspaceTab}`;
    } else if (view === 'resources') {
      window.location.hash = `resources/${resourcesSub}`;
    }
  };

  // Initial Data Fetch for Demo Fixture
  const loadUlabDemoData = async (activeTier: CalculationMethodTier = tier) => {
    try {
      const resInst = await fetch('/api/institutions/INST-ULAB');
      if (resInst.ok) {
        const data = await resInst.json();
        if (data.institution) setUlabInstitution(data.institution);
        if (data.population) setUlabPopulation(data.population);
        if (data.boundaries && data.boundaries.length > 0) setUlabBoundary(data.boundaries[0]);
      }

      const resActions = await fetch('/api/actions/INST-ULAB');
      if (resActions.ok) {
        const acts = await resActions.json();
        setUlabActions(acts);
      }

      const resCalc = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionId: 'INST-ULAB', tier: activeTier })
      });
      if (resCalc.ok) {
        const calcData = await resCalc.json();
        setUlabRun(calcData);
      }
    } catch (err) {
      console.warn('API fetch warning for demo data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUlabDemoData(tier);
  }, [tier]);

  const handleStartAssessment = () => {
    setTier('current_inventory_method');
    navigateTo('workspace', 'setup');
  };

  const handleExploreDemo = () => {
    setTier('legacy_study_reproduction');
    navigateTo('demo', 'results');
  };

  // Handlers for user assessment
  const handleSaveInstitution = async (inst: Partial<Institution>) => {
    if (currentView === 'demo') {
      alert('The ULAB 2022 demo is a read-only historical fixture. Changes cannot alter the research study. Create your own institution assessment to save custom details.');
      return;
    }
    setUserInstitution(prev => ({ ...prev, ...inst }));
  };

  const handleSavePopulation = async (pop: Partial<PopulationRecord>) => {
    if (currentView === 'demo') return;
    setUserPopulation(prev => ({ ...prev, ...pop }));
  };

  const handleSaveBoundary = async (bnd: Partial<CampusBoundary>) => {
    if (currentView === 'demo') return;
    setUserBoundary(prev => ({ ...prev, ...bnd }));
  };

  const handleAddActivity = async (act: any) => {
    if (currentView === 'demo') return;
    console.log('Added activity for user assessment:', act);
  };

  const handleImportCommuters = async (rows: any[]) => {
    if (currentView === 'demo') return;
    console.log('Imported commuters for user assessment:', rows.length);
  };

  const handleAddAction = async (action: any) => {
    if (currentView === 'demo') {
      // In demo mode, keep session-local
      const demoAct = {
        id: `DEMO-ACT-${Date.now()}`,
        institutionId: 'INST-ULAB',
        ...action,
        status: action.status || 'proposed',
        feedback: []
      };
      setUlabActions(prev => [demoAct, ...prev]);
      return;
    }
    const userAct = {
      id: `USER-ACT-${Date.now()}`,
      institutionId: userInstitution.id,
      ...action,
      feedback: []
    };
    setUserActions(prev => [userAct, ...prev]);
  };

  const handleAddFeedback = async (actionId: string, feedback: any) => {
    if (currentView === 'demo') {
      setUlabActions(prev => prev.map(a => {
        if (a.id === actionId) {
          const newFb = {
            id: `FB-${Date.now()}`,
            actionId,
            author: feedback.author,
            text: feedback.text,
            createdAt: new Date().toISOString()
          };
          return {
            ...a,
            status: feedback.status || a.status,
            feedback: [...(a.feedback || []), newFb]
          };
        }
        return a;
      }));
      return;
    }
    setUserActions(prev => prev.map(a => {
      if (a.id === actionId) {
        const newFb = {
          id: `FB-${Date.now()}`,
          actionId,
          author: feedback.author,
          text: feedback.text,
          createdAt: new Date().toISOString()
        };
        return {
          ...a,
          status: feedback.status || a.status,
          feedback: [...(a.feedback || []), newFb]
        };
      }
      return a;
    }));
  };

  const isDemo = currentView === 'demo';
  const activeInstitution = isDemo ? ulabInstitution : userInstitution;
  const activePopulation = isDemo ? ulabPopulation : userPopulation;
  const activeBoundary = isDemo ? ulabBoundary : userBoundary;
  const activeRun = isDemo ? ulabRun : (userRun || ulabRun);
  const activeActions = isDemo ? ulabActions : userActions;

  // Workspace Sub Navigation Items
  const assessmentNavItems = [
    ...(!isDemo ? [{ id: 'setup', label: isLangBn() ? 'ক্যাম্পাস রূপরেখা' : 'Campus setup', icon: Building2 }] : []),
    ...(!isDemo ? [
      { id: 'collect', label: isLangBn() ? 'টেমপ্লেটে তথ্য সংগ্রহ' : 'Collect data with templates', icon: FileSpreadsheet },
      { id: 'enter', label: isLangBn() ? 'বিদ্যমান তথ্য প্রবেশ' : 'Enter existing data', icon: Layers }
    ] : []),
    { id: 'results', label: isLangBn() ? 'ইনভেনটরি ফলাফল' : 'Inventory Results', icon: BarChart3 },
    { id: 'map', label: isLangBn() ? 'ক্যাম্পাস মানচিত্র' : 'Campus Map', icon: MapPin },
    { id: 'compare', label: isLangBn() ? 'বিশ্ববিদ্যালয়সমূহের তুলনা' : 'Compare universities', icon: GitCompare },
    { id: 'policy', label: isLangBn() ? 'নীতি ও কর্মপরিকল্পনা' : 'Policy & action plan', icon: Lightbulb },
    { id: 'reports', label: isLangBn() ? 'প্রতিবেদন ও রপ্তানি' : 'Reports & Export', icon: FileText }
  ];

  function isLangBn() {
    return lang === 'bn';
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col selection:bg-cobalt-100 selection:text-navy-950">
      <Navbar
        currentView={currentView}
        setCurrentView={(v) => navigateTo(v)}
        workspaceTab={workspaceTab}
        setWorkspaceTab={(tab) => navigateTo(currentView, tab)}
        resourcesSub={resourcesSub}
        setResourcesSub={(sub) => {
          setResourcesSub(sub);
          navigateTo('resources');
        }}
        isDemo={isDemo}
        institutionName={lang === 'bn' && activeInstitution.nameBn ? activeInstitution.nameBn : activeInstitution.name}
        lang={lang}
        setLang={setLang}
        tier={tier}
        setTier={setTier}
        onStartAssessment={handleStartAssessment}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: Public Homepage */}
        {currentView === 'home' && (
          <Homepage
            onStartAssessment={handleStartAssessment}
            onExploreDemo={handleExploreDemo}
            lang={lang}
          />
        )}

        {/* VIEW 2 & 3: ULAB Demo OR Institutional Assessment Workspace */}
        {(currentView === 'demo' || currentView === 'workspace') && (
          <div className="space-y-6">
            {/* Workspace / Assessment Sub-Navigation Bar */}
            <div className="bg-white rounded-2xl border border-navy-100 p-1.5 shadow-2xs overflow-x-auto flex space-x-1">
              {assessmentNavItems.map(item => {
                const Icon = item.icon;
                const isActive = workspaceTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(currentView, item.id)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-cobalt text-white shadow-2xs'
                        : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-navy-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Assessment Subviews */}
            {workspaceTab === 'setup' && (
              <SetupWizard
                institution={activeInstitution}
                population={activePopulation}
                boundary={activeBoundary}
                onSaveInstitution={handleSaveInstitution}
                onSavePopulation={handleSavePopulation}
                onSaveBoundary={handleSaveBoundary}
                lang={lang}
              />
            )}

            {workspaceTab === 'collect' && (
              <RouteACollectKit
                institutionId={activeInstitution.id}
                onImportCommuters={handleImportCommuters}
                lang={lang}
              />
            )}

            {workspaceTab === 'enter' && (
              <RouteBGuidedEntry
                institutionId={activeInstitution.id}
                onAddActivity={handleAddActivity}
                lang={lang}
              />
            )}

            {workspaceTab === 'results' && activeRun && (
              <Dashboard
                result={activeRun}
                tier={tier}
                setTier={setTier}
                onRecalculate={() => loadUlabDemoData(tier)}
                lang={lang}
              />
            )}

            {workspaceTab === 'map' && (
              <CampusMap
                boundary={activeBoundary}
                institutionName={activeInstitution.name}
                lang={lang}
              />
            )}

            {workspaceTab === 'compare' && (
              <FairComparison
                currentInstitutionName={activeInstitution.name}
                currentPerCapita={activeRun?.perCapitaTotal || 0.4671}
                lang={lang}
              />
            )}

            {workspaceTab === 'policy' && activeRun && (
              <PolicyActionPlan
                institutionId={activeInstitution.id}
                isDemo={isDemo}
                baseline={activeRun}
                actions={activeActions}
                onAddAction={handleAddAction}
                onAddFeedback={handleAddFeedback}
                lang={lang}
              />
            )}

            {workspaceTab === 'reports' && (
              <ReportExporter
                institution={activeInstitution}
                population={activePopulation}
                result={activeRun}
                lang={lang}
              />
            )}
          </div>
        )}

        {/* VIEW 4: Resources Hub */}
        {currentView === 'resources' && (
          <div className="space-y-6">
            <div className="flex space-x-2 border-b border-navy-200 pb-2">
              <button
                onClick={() => setResourcesSub('methodology')}
                className={`pb-2 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                  resourcesSub === 'methodology' ? 'border-cobalt text-cobalt' : 'border-transparent text-navy-500 hover:text-navy-800'
                }`}
              >
                Methodology & References
              </button>
              <button
                onClick={() => setResourcesSub('factors')}
                className={`pb-2 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                  resourcesSub === 'factors' ? 'border-cobalt text-cobalt' : 'border-transparent text-navy-500 hover:text-navy-800'
                }`}
              >
                Emission Factors Database
              </button>
              <button
                onClick={() => setResourcesSub('help')}
                className={`pb-2 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                  resourcesSub === 'help' ? 'border-cobalt text-cobalt' : 'border-transparent text-navy-500 hover:text-navy-800'
                }`}
              >
                System Integration Status
              </button>
            </div>

            {resourcesSub === 'methodology' && <MethodologyReferences lang={lang} />}
            {resourcesSub === 'factors' && <FactorRegistryBrowser lang={lang} />}
            {resourcesSub === 'help' && <IntegrationHelp lang={lang} />}
          </div>
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="bg-white border-t border-navy-100 py-6 text-xs text-navy-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-navy-800">Campus Carbon Bangladesh</strong> • Higher Education Carbon Accounting & Decarbonization Platform
          </div>
          <div className="flex items-center gap-4 text-navy-400">
            <span>GHG Protocol Corporate Standard</span>
            <span>•</span>
            <span>IPCC AR6 100-Year GWP</span>
            <span>•</span>
            <span>OpenStreetMap</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
