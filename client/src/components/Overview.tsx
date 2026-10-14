import React from 'react';
import { 
  BarChart3, 
  Users, 
  Leaf, 
  Zap, 
  Car, 
  Building2, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Download,
  Calendar
} from 'lucide-react';
import { InventoryCalculationResult, PopulationRecord, Institution, CalculationMethodTier } from '../../../shared/types';
import { Language, t } from '../../../shared/i18n';

interface OverviewProps {
  institution: Institution;
  population?: PopulationRecord;
  latestRun?: InventoryCalculationResult;
  tier: CalculationMethodTier;
  setTier: (tier: CalculationMethodTier) => void;
  onNavigate: (tab: string) => void;
  lang: Language;
}

export const Overview: React.FC<OverviewProps> = ({
  institution,
  population,
  latestRun,
  tier,
  setTier,
  onNavigate,
  lang
}) => {
  const totalEmissions = latestRun ? latestRun.totalGrossEmissions.toFixed(2) : '2,498.79';
  const perCapita = latestRun ? latestRun.perCapitaTotal.toFixed(4) : '0.4671';
  const scope1 = latestRun ? latestRun.scope1Total.toFixed(2) : '742.55';
  const scope2 = latestRun ? latestRun.scope2LocationBased.toFixed(2) : '454.14';
  const scope3 = latestRun ? latestRun.scope3Total.toFixed(2) : '1,302.10';
  const headcount = population ? population.totalHeadcount : 5350;
  const days = population ? population.campusOperatingDaysPerYear : 294;

  return (
    <div className="space-y-6">
      {/* Research Paper Attribution & Disclaimer Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-forest-900 text-white rounded-2xl p-6 shadow-md border border-teal-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-800/80 text-teal-200 border border-teal-700">
              <BookOpen className="w-3.5 h-3.5" />
              IEEE Access Research Implementation (DOI: 10.1109/ACCESS.2025.3605517)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {institution.name}
            </h1>
            <p className="text-teal-100 text-sm max-w-3xl leading-relaxed">
              Based on the published study <em>"Assessment of Greenhouse Gas Emissions and Mitigation Strategies for a University in Bangladesh"</em>. 
              This platform enables every Bangladeshi HEI to collect activity data, run deterministic Scope 1/2/3 calculations, map campus travel, and track mitigation scenarios.
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigate('results')}
              className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Explore Full Results
            </button>
            <button
              onClick={() => onNavigate('collect')}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-xs transition border border-white/20"
            >
              <Download className="w-4 h-4" />
              Data Collection Kit
            </button>
          </div>
        </div>
      </div>

      {/* Methodological Tier Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${tier === 'legacy_study_reproduction' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">
              Active Calculation Tier: {tier === 'legacy_study_reproduction' ? 'Legacy Study Reproduction' : 'Current Inventory Method'}
            </div>
            <div className="text-slate-500 text-xs">
              {tier === 'legacy_study_reproduction' 
                ? 'Exact replication of spreadsheet formulas (2,498.79 tCO₂e total, R-22 inside Scope 1, T&D losses inside Scope 2).'
                : 'Reviewed standard GHG Protocol method: R-22 disclosed as Montreal Protocol ODS, T&D losses placed in Scope 3, stratified commuting.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <span className="text-slate-500 text-xs font-medium">Switch view:</span>
          <button
            onClick={() => setTier('current_inventory_method')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              tier === 'current_inventory_method'
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Current Method (Standard)
          </button>
          <button
            onClick={() => setTier('legacy_study_reproduction')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              tier === 'legacy_study_reproduction'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Legacy Reproduction (2,498.79 t)
          </button>
        </div>
      </div>

      {/* Key Metric Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Emissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-teal-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('totalEmissions', lang)}</span>
            <Leaf className="w-4 h-4 text-forest-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalEmissions} <span className="text-xs font-normal text-slate-500">tCO₂e/yr</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-slate-700">Reporting Year:</span> {institution.reportingYear}
          </div>
        </div>

        {/* Per Capita Footprint */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-teal-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('perCapitaFootprint', lang)}</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-teal-700 tracking-tight">
            {perCapita} <span className="text-xs font-normal text-slate-500">tCO₂e / person</span>
          </div>
          <div className="text-xs text-slate-500">
            Denominator: <span className="font-semibold text-slate-700">{headcount.toLocaleString()}</span> students, faculty, and staff
          </div>
        </div>

        {/* Scope 1 Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-teal-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Scope 1: Direct Combustion & AC</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-700 tracking-tight">
            {scope1} <span className="text-xs font-normal text-slate-500">tCO₂e</span>
          </div>
          <div className="text-xs text-slate-500">
            Vehicles, Generators, Cafeteria LPG, AC Leakage
          </div>
        </div>

        {/* Scope 2 & Scope 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-teal-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Scope 2 / Scope 3</span>
            <div className="flex gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <Car className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Scope 2 (Electricity):</span>
              <span className="font-bold text-blue-700">{scope2} t</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scope 3 (Commuting):</span>
              <span className="font-bold text-purple-700">{scope3} t</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Largest contributor: Commuting & AC Cooling
          </div>
        </div>
      </div>

      {/* Guided 4-Step Institutional Workflow */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">How to Benchmark Your University Campus</h2>
          <p className="text-xs text-slate-500">Follow this structured four-stage workflow to audit, calculate, and mitigate emissions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('boundaries')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 transition cursor-pointer space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs group-hover:bg-teal-600 group-hover:text-white transition">
              1
            </div>
            <div className="font-bold text-slate-900 text-sm">Define Campus & Boundaries</div>
            <p className="text-xs text-slate-500">Configure institution type, student/faculty headcount, operating days, and campus footprint.</p>
            <div className="text-xs text-teal-700 font-medium flex items-center gap-1 pt-1">
              Configure Profile <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('collect')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 transition cursor-pointer space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs group-hover:bg-teal-600 group-hover:text-white transition">
              2
            </div>
            <div className="font-bold text-slate-900 text-sm">Collect Activity Data</div>
            <p className="text-xs text-slate-500">Download CSV/XLSX templates or launch an anonymous Google Forms commuter travel survey.</p>
            <div className="text-xs text-teal-700 font-medium flex items-center gap-1 pt-1">
              Data Collection Kit <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('results')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 transition cursor-pointer space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs group-hover:bg-teal-600 group-hover:text-white transition">
              3
            </div>
            <div className="font-bold text-slate-900 text-sm">Calculate & Explore Map</div>
            <p className="text-xs text-slate-500">Deterministic calculation engine with transparent formula traces, mode share charts, and GIS map.</p>
            <div className="text-xs text-teal-700 font-medium flex items-center gap-1 pt-1">
              View Analytics <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('mitigation')}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 transition cursor-pointer space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs group-hover:bg-teal-600 group-hover:text-white transition">
              4
            </div>
            <div className="font-bold text-slate-900 text-sm">Simulate Mitigation</div>
            <p className="text-xs text-slate-500">Model solar PV, AC coolant retrofits, and shared transit with interaction checks and action tracking.</p>
            <div className="text-xs text-teal-700 font-medium flex items-center gap-1 pt-1">
              Scenario Simulator <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
