import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Overview } from './components/Overview';
import { SetupWizard } from './components/SetupWizard';
import { RouteACollectKit } from './components/RouteACollectKit';
import { RouteBGuidedEntry } from './components/RouteBGuidedEntry';
import { Dashboard } from './components/Dashboard';
import { CampusMap } from './components/CampusMap';
import { FairComparison } from './components/FairComparison';
import { MitigationPlanner } from './components/MitigationPlanner';
import { FactorRegistryBrowser } from './components/FactorRegistryBrowser';
import { ReportExporter } from './components/ReportExporter';

import { 
  Institution, 
  PopulationRecord, 
  CampusBoundary, 
  InventoryCalculationResult, 
  SustainabilityAction, 
  CalculationMethodTier 
} from '../../shared/types';
import { Language } from '../../shared/i18n';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [lang, setLang] = useState<Language>('en');
  const [tier, setTier] = useState<CalculationMethodTier>('current_inventory_method');

  // Application Data States
  const [institution, setInstitution] = useState<Institution>({
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

  const [population, setPopulation] = useState<PopulationRecord>({
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

  const [boundary, setBoundary] = useState<CampusBoundary>({
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

  const [latestRun, setLatestRun] = useState<InventoryCalculationResult | undefined>(undefined);
  const [actions, setActions] = useState<SustainabilityAction[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  const loadData = async (activeTier: CalculationMethodTier = tier) => {
    try {
      // 1. Fetch institution
      const resInst = await fetch('/api/institutions/INST-ULAB');
      if (resInst.ok) {
        const data = await resInst.json();
        if (data.institution) setInstitution(data.institution);
        if (data.population) setPopulation(data.population);
        if (data.boundaries && data.boundaries.length > 0) setBoundary(data.boundaries[0]);
      }

      // 2. Fetch actions
      const resActions = await fetch('/api/actions/INST-ULAB');
      if (resActions.ok) {
        const acts = await resActions.json();
        setActions(acts);
      }

      // 3. Run calculation with active tier
      const resCalc = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionId: 'INST-ULAB', tier: activeTier })
      });
      if (resCalc.ok) {
        const calcData = await resCalc.json();
        setLatestRun(calcData);
      }
    } catch (err) {
      console.warn('API fetch warning, using seeded defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(tier);
  }, [tier]);

  // Handlers
  const handleSaveInstitution = async (inst: Partial<Institution>) => {
    const res = await fetch('/api/institutions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inst)
    });
    if (res.ok) {
      const updated = await res.json();
      setInstitution(updated);
    }
  };

  const handleSavePopulation = async (pop: Partial<PopulationRecord>) => {
    const res = await fetch('/api/population', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pop)
    });
    if (res.ok) {
      const updated = await res.json();
      setPopulation(updated);
      await loadData(tier);
    }
  };

  const handleSaveBoundary = async (bnd: Partial<CampusBoundary>) => {
    const res = await fetch('/api/boundaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bnd)
    });
    if (res.ok) {
      const updated = await res.json();
      setBoundary(updated);
    }
  };

  const handleAddActivity = async (act: any) => {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(act)
    });
    if (res.ok) {
      await loadData(tier);
    }
  };

  const handleImportCommuters = async (rows: any[]) => {
    const res = await fetch('/api/commuters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows)
    });
    if (res.ok) {
      await loadData(tier);
    }
  };

  const handleAddAction = async (action: any) => {
    const res = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });
    if (res.ok) {
      const saved = await res.json();
      setActions(prev => [saved, ...prev]);
    }
  };

  const handleAddFeedback = async (actionId: string, feedback: any) => {
    const res = await fetch(`/api/actions/${actionId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback)
    });
    if (res.ok) {
      const updated = await res.json();
      setActions(prev => prev.map(a => a.id === actionId ? updated : a));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        tier={tier}
        setTier={setTier}
        institutionName={lang === 'bn' && institution.nameBn ? institution.nameBn : institution.name}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'overview' && (
          <Overview
            institution={institution}
            population={population}
            latestRun={latestRun}
            tier={tier}
            setTier={setTier}
            onNavigate={setCurrentTab}
            lang={lang}
          />
        )}

        {currentTab === 'boundaries' && (
          <SetupWizard
            institution={institution}
            population={population}
            boundary={boundary}
            onSaveInstitution={handleSaveInstitution}
            onSavePopulation={handleSavePopulation}
            onSaveBoundary={handleSaveBoundary}
            lang={lang}
          />
        )}

        {currentTab === 'collect' && (
          <RouteACollectKit
            institutionId={institution.id}
            onImportCommuters={handleImportCommuters}
            lang={lang}
          />
        )}

        {currentTab === 'enter' && (
          <RouteBGuidedEntry
            institutionId={institution.id}
            onAddActivity={handleAddActivity}
            lang={lang}
          />
        )}

        {currentTab === 'results' && latestRun && (
          <Dashboard
            result={latestRun}
            tier={tier}
            setTier={setTier}
            onRecalculate={() => loadData(tier)}
            lang={lang}
          />
        )}

        {currentTab === 'map' && (
          <CampusMap
            boundary={boundary}
            institutionName={institution.name}
            lang={lang}
          />
        )}

        {currentTab === 'compare' && (
          <FairComparison
            currentInstitutionName={institution.name}
            currentPerCapita={latestRun?.perCapitaTotal || 0.4671}
            lang={lang}
          />
        )}

        {currentTab === 'mitigation' && latestRun && (
          <MitigationPlanner
            institutionId={institution.id}
            baseline={latestRun}
            actions={actions}
            onAddAction={handleAddAction}
            onAddFeedback={handleAddFeedback}
            lang={lang}
          />
        )}

        {currentTab === 'factors' && (
          <FactorRegistryBrowser lang={lang} />
        )}

        {currentTab === 'reports' && (
          <ReportExporter
            institution={institution}
            population={population}
            result={latestRun}
            lang={lang}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>Campus Carbon Bangladesh</strong> • Built according to IEEE Access (DOI: 10.1109/ACCESS.2025.3605517)
          </div>
          <div className="flex items-center gap-4 text-slate-400">
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
