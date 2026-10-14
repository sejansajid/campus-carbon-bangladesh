import React, { useState } from 'react';
import { 
  Building2, 
  Leaf, 
  Zap, 
  Car, 
  BarChart3, 
  MapPin, 
  Lightbulb, 
  FileText, 
  Download, 
  Printer, 
  ArrowLeft, 
  Info, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ShieldCheck,
  Calendar,
  Users
} from 'lucide-react';
import { InventoryCalculationResult, Institution, PopulationRecord, CampusBoundary, CalculationTrace } from '../../../shared/types';
import { ScholarlyFigures } from './ScholarlyFigures';
import { CampusMap } from './CampusMap';
import { Language, t } from '../../../shared/i18n';

interface AssessmentReportProps {
  institution: Institution;
  population?: PopulationRecord;
  boundary?: CampusBoundary;
  result: InventoryCalculationResult;
  isExample?: boolean;
  onReturnToAssessment?: () => void;
  lang: Language;
}

export const AssessmentReport: React.FC<AssessmentReportProps> = ({
  institution,
  population,
  boundary,
  result,
  isExample = false,
  onReturnToAssessment,
  lang
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'figures' | 'map' | 'policy' | 'download'>('overview');
  const [selectedScope, setSelectedScope] = useState<number | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [expandedTraceKey, setExpandedTraceKey] = useState<string | null>(null);

  const isBn = lang === 'bn';

  const total = result.totalGrossEmissions;
  const s1 = result.scope1Total;
  const s2 = result.scope2LocationBased;
  const s3 = result.scope3Total;

  const s1Pct = total > 0 ? ((s1 / total) * 100).toFixed(1) : '0';
  const s2Pct = total > 0 ? ((s2 / total) * 100).toFixed(1) : '0';
  const s3Pct = total > 0 ? ((s3 / total) * 100).toFixed(1) : '0';

  // Largest source calculation
  const rankedSources = [
    { name: isBn ? 'দৈনিক যাতায়াত' : 'Commuting (Student & Employee Transit)', tons: result.scope3Breakdown.totalCommuting, scope: 3 },
    { name: isBn ? 'ক্রয়কৃত জাতীয় গ্রিড বিদ্যুৎ' : 'Purchased Grid Electricity', tons: result.scope2LocationBased, scope: 2 },
    { name: isBn ? 'এসি রেফ্রিজারেন্ট লিকেজ' : 'AC Refrigerant Fugitives', tons: result.scope1Breakdown.acR410A + (result.scope1Breakdown.acR22MontrealProtocol || 0), scope: 1 },
    { name: isBn ? 'ক্যাম্পাস যানবাহন বহর' : 'Campus Vehicle Fleet (Diesel & Octane)', tons: result.scope1Breakdown.fleetOctane + result.scope1Breakdown.fleetDiesel, scope: 1 },
    { name: isBn ? 'জরুরি জেনারেটর' : 'Backup Emergency Generator', tons: result.scope1Breakdown.stationaryDiesel, scope: 1 },
    { name: isBn ? 'ক্যাফেটেরিয়া রান্নার এলপিজি' : 'Cafeteria Cooking (LPG)', tons: result.scope1Breakdown.cafeteriaLpg, scope: 1 }
  ].filter(s => s.tons > 0).sort((a, b) => b.tons - a.tons);

  const largestSource = rankedSources[0] || { name: 'Unknown', tons: 0, scope: 1 };
  const largestSourcePct = total > 0 ? ((largestSource.tons / total) * 100).toFixed(1) : '0';

  // Commuting Table Data
  const commutingModes = [
    { mode: 'Private Car (Faculty / Students)', commuterShare: '8.8%', emissionShare: '59.6%', factor: '280.9 g/km', highImpact: true },
    { mode: 'Public City Bus', commuterShare: '15.4%', emissionShare: '9.2%', factor: '17.1 g/p-km', highImpact: false },
    { mode: 'CNG Auto-Rickshaw', commuterShare: '5.5%', emissionShare: '7.9%', factor: '75.0 g/km', highImpact: false },
    { mode: 'Motorcycle', commuterShare: '8.3%', emissionShare: '6.7%', factor: '40.0 g/km', highImpact: false },
    { mode: 'Battery Auto-Rickshaw / Easybike', commuterShare: '7.8%', emissionShare: '3.1%', factor: '50.8 g/km', highImpact: false },
    { mode: 'Multiple / Multi-modal', commuterShare: '18.9%', emissionShare: '12.6%', factor: '30.6 g/km', highImpact: false },
    { mode: 'Leguna (Human hauler)', commuterShare: '1.8%', emissionShare: '0.8%', factor: '27.7 g/p-km', highImpact: false },
    { mode: 'Rickshaw (Cycle)', commuterShare: '26.1%', emissionShare: '0.0%', factor: '0.0 g/km', highImpact: false },
    { mode: 'Walking / Bicycle', commuterShare: '7.3%', emissionShare: '0.0%', factor: '0.0 g/km', highImpact: false }
  ];

  // Filtered Traces for Source Details Table
  const allTraces = [
    ...result.traces,
    ...(result.outOfScopeDisclosures || [])
  ];

  const filteredTraces = allTraces.filter(t => {
    if (selectedScope !== null && t.scope !== selectedScope) return false;
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.factorId.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. Example Header Banner OR Real Assessment Header */}
      {isExample ? (
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <span>{isBn ? 'উদাহরণ মূল্যায়ন প্রতিবেদন' : 'Example assessment report — ULAB 2022'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-1">
                University of Liberal Arts Bangladesh (2022)
              </h1>
              <p className="text-xs text-amber-900/80 mt-1">
                {isBn 
                  ? 'ইউল্যাব ২০২২ গবেষণার উপাত্ত ব্যবহার করে প্রস্তুতকৃত উদাহরণ প্রতিবেদন। প্রকাশিত গবেষণা ফলাফল: ২,৪৯৮.৮০ tCO₂e এবং ০.৪৬৭১ tCO₂e/ব্যক্তি।'
                  : 'Example report using ULAB\'s 2022 study data. Published study baseline: 2,498.80 tCO₂e and 0.4671 tCO₂e/person.'}
              </p>
            </div>

            {onReturnToAssessment && (
              <button
                onClick={onReturnToAssessment}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs transition cursor-pointer shadow-2xs shrink-0 self-start"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isBn ? 'আমার মূল্যায়নে ফিরুন' : 'Return to my assessment'}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-navy-100 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-cobalt" />
            <span>{isBn ? 'সম্পূর্ণ প্রাতিষ্ঠানিক মূল্যায়ন প্রতিবেদন' : 'Institutional Carbon Assessment Report'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800">
            {institution.name}
          </h1>
          <p className="text-xs text-navy-500">
            {institution.address || `${institution.district}, ${institution.division}`} • Reporting Year: {institution.reportingYear} • Operational Control Boundary
          </p>
        </div>
      )}

      {/* 2. Key Analytical Headline Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-1.5">
          <span className="text-xs text-navy-500 font-medium">{isBn ? 'মোট প্রত্যক্ষ ও পরোক্ষ নির্গমন' : 'Total Gross Emissions'}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-800 tabular-nums">
            {total.toFixed(2)} <span className="text-xs font-normal text-navy-500">tCO₂e</span>
          </div>
          <div className="text-[11px] text-navy-500">
            {isExample ? 'Matches ULAB workbook (2,498.79 t)' : 'Core operational boundary'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-1.5">
          <span className="text-xs text-navy-500 font-medium">{isBn ? 'মাথাপিছু কার্বন পদচিহ্ন' : 'Per Capita Footprint'}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-cobalt tabular-nums">
            {result.perCapitaTotal.toFixed(4)} <span className="text-xs font-normal text-navy-500">tCO₂e/person</span>
          </div>
          <div className="text-[11px] text-navy-500">
            {population ? `${population.totalHeadcount.toLocaleString()} campus headcount` : 'Campus community'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-1.5">
          <span className="text-xs text-navy-500 font-medium">{isBn ? 'সর্ববৃহৎ নির্গমন উৎস' : 'Largest Emission Source'}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 tabular-nums">
            {largestSourcePct}%
          </div>
          <div className="text-[11px] text-navy-500 truncate" title={largestSource.name}>
            {largestSource.name}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-1.5">
          <span className="text-xs text-navy-500 font-medium">{isBn ? 'স্কোপ ১ ও ২ অনুপাত' : 'Scope 1 & 2 Proportion'}</span>
          <div className="text-xl sm:text-2xl font-extrabold text-navy-800 tabular-nums pt-0.5">
            {s1Pct}% / {s2Pct}%
          </div>
          <div className="text-[11px] text-navy-500">
            Scope 3 (Commuting): <strong className="text-purple-700">{s3Pct}%</strong>
          </div>
        </div>
      </div>

      {/* 3. Report Local Navigation: Overview · Figures & tables · Campus map · Policy recommendations · Download report */}
      <div className="bg-white rounded-2xl border border-navy-100 p-1.5 shadow-2xs flex space-x-1 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('overview')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
            activeReportTab === 'overview' ? 'bg-cobalt text-white shadow-2xs' : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>{isBn ? 'সারসংক্ষেপ' : 'Overview'}</span>
        </button>

        <button
          onClick={() => setActiveReportTab('figures')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
            activeReportTab === 'figures' ? 'bg-cobalt text-white shadow-2xs' : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{isBn ? 'চিত্র ও সারণীসমূহ' : 'Figures & tables'}</span>
        </button>

        <button
          onClick={() => setActiveReportTab('map')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
            activeReportTab === 'map' ? 'bg-cobalt text-white shadow-2xs' : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{isBn ? 'ক্যাম্পাস মানচিত্র' : 'Campus map'}</span>
        </button>

        <button
          onClick={() => setActiveReportTab('policy')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
            activeReportTab === 'policy' ? 'bg-cobalt text-white shadow-2xs' : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{isBn ? 'নীতিমালা ও সুপারিশ' : 'Policy recommendations'}</span>
        </button>

        <button
          onClick={() => setActiveReportTab('download')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
            activeReportTab === 'download' ? 'bg-cobalt text-white shadow-2xs' : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isBn ? 'প্রতিবেদন ডাউনলোড' : 'Download report'}</span>
        </button>
      </div>

      {/* 4. Subview: Overview */}
      {activeReportTab === 'overview' && (
        <div className="space-y-6">
          {/* Scope Composition Strip */}
          <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-navy-800">{isBn ? 'স্কোপ অনুপাত বিভাজন' : 'Operational Scope Distribution'}</span>
              <span className="text-navy-500 tabular-nums">Total = {total.toFixed(2)} tCO₂e</span>
            </div>

            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-navy-50 shadow-inner">
              <div style={{ width: `${s1Pct}%` }} className="bg-amber-500 flex items-center justify-center text-[10px] text-white font-bold" title={`Scope 1: ${s1Pct}%`}>
                {Number(s1Pct) > 10 ? `S1 ${s1Pct}%` : ''}
              </div>
              <div style={{ width: `${s2Pct}%` }} className="bg-cobalt flex items-center justify-center text-[10px] text-white font-bold" title={`Scope 2: ${s2Pct}%`}>
                {Number(s2Pct) > 10 ? `S2 ${s2Pct}%` : ''}
              </div>
              <div style={{ width: `${s3Pct}%` }} className="bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold" title={`Scope 3: ${s3Pct}%`}>
                {Number(s3Pct) > 10 ? `S3 ${s3Pct}%` : ''}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-navy-600 font-medium">Scope 1 (Direct Operations):</span>
                <span className="font-bold text-navy-800 tabular-nums">{s1.toFixed(2)} t ({s1Pct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cobalt" />
                <span className="text-navy-600 font-medium">Scope 2 (Purchased Electricity):</span>
                <span className="font-bold text-navy-800 tabular-nums">{s2.toFixed(2)} t ({s2Pct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-600" />
                <span className="text-navy-600 font-medium">Scope 3 (Commuting & Losses):</span>
                <span className="font-bold text-navy-800 tabular-nums">{s3.toFixed(2)} t ({s3Pct}%)</span>
              </div>
            </div>
          </div>

          {/* Ranked Hotspots Preview */}
          <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-navy-800">
              {isBn ? 'প্রধান নির্গমন হটস্পটসমূহ' : 'Prioritized Emission Hotspots'}
            </h3>
            <div className="space-y-2.5">
              {rankedSources.map((src, i) => {
                const pct = ((src.tons / total) * 100).toFixed(1);
                return (
                  <div key={i} className="flex justify-between items-center text-xs p-3 rounded-xl bg-navy-50/50 border border-navy-100">
                    <span className="font-semibold text-navy-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-[10px] text-navy-700 border border-navy-200">
                        {i + 1}
                      </span>
                      {src.name}
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${src.scope === 1 ? 'bg-amber-100 text-amber-800' : src.scope === 2 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        Scope {src.scope}
                      </span>
                    </span>
                    <span className="font-bold text-navy-900 tabular-nums">
                      {src.tons.toFixed(2)} tCO₂e ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. Subview: Figures & Tables */}
      {activeReportTab === 'figures' && (
        <div className="space-y-8">
          {/* Scholarly Figures */}
          <ScholarlyFigures
            result={result}
            selectedScope={selectedScope}
            onSelectScope={setSelectedScope}
            lang={lang}
          />

          {/* Table 1: Inventory Summary by Scope & Category */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-navy-50 pb-2">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">Table 1 • Boundary Summary</span>
                <h3 className="text-base font-bold text-navy-900">Emissions Summary by Scope and Operational Category</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50 text-navy-700 font-semibold">
                    <th className="p-3">Scope / Operational Category</th>
                    <th className="p-3">Accounting Treatment</th>
                    <th className="p-3 text-right">Emissions (tCO₂e)</th>
                    <th className="p-3 text-right">Share of Total (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 text-navy-700">
                  <tr className="bg-amber-50/30 font-bold">
                    <td className="p-3">Scope 1: Direct Operations</td>
                    <td className="p-3 text-navy-500 font-normal">Owned combustion & fugitive AC refrigerants</td>
                    <td className="p-3 text-right font-mono tabular-nums">{s1.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{s1Pct}%</td>
                  </tr>
                  <tr className="bg-blue-50/30 font-bold">
                    <td className="p-3">Scope 2: Purchased Electricity</td>
                    <td className="p-3 text-navy-500 font-normal">Utility grid generation imports</td>
                    <td className="p-3 text-right font-mono tabular-nums">{s2.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{s2Pct}%</td>
                  </tr>
                  <tr className="bg-purple-50/30 font-bold">
                    <td className="p-3">Scope 3: Indirect & Commuting</td>
                    <td className="p-3 text-navy-500 font-normal">Student, faculty, staff travel & upstream losses</td>
                    <td className="p-3 text-right font-mono tabular-nums">{s3.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{s3Pct}%</td>
                  </tr>
                  <tr className="border-t-2 border-navy-900 font-extrabold text-navy-900 bg-navy-50/50">
                    <td className="p-3" colSpan={2}>Total Quantified Institutional Emissions</td>
                    <td className="p-3 text-right font-mono tabular-nums">{total.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono tabular-nums">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Source Details with Calculation Drawers */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-50 pb-2">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">Table 2 • Source Details</span>
                <h3 className="text-base font-bold text-navy-900">Line-Item Activity, Factor Values & Provenance</h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter sources..."
                  value={tableSearch}
                  onChange={e => setTableSearch(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy-800 placeholder-navy-400 focus:outline-none focus:border-cobalt"
                />
                {selectedScope !== null && (
                  <button
                    onClick={() => setSelectedScope(null)}
                    className="px-2.5 py-1.5 rounded-lg bg-navy-100 text-navy-700 text-xs font-semibold cursor-pointer"
                  >
                    Clear Scope {selectedScope}
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50 text-navy-700 font-semibold">
                    <th className="p-3">Source Name</th>
                    <th className="p-3">Scope</th>
                    <th className="p-3">Activity Quantity</th>
                    <th className="p-3">Emission Factor</th>
                    <th className="p-3 text-right">Calculated (tCO₂e)</th>
                    <th className="p-3 text-center">Formula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 text-navy-700">
                  {filteredTraces.map((trace, idx) => {
                    const isExpanded = expandedTraceKey === trace.itemKey;
                    return (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-navy-50/30 transition">
                          <td className="p-3 font-semibold text-navy-900">{trace.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              trace.scope === 1 ? 'bg-amber-100 text-amber-900' :
                              trace.scope === 2 ? 'bg-blue-100 text-blue-900' :
                              trace.scope === 3 ? 'bg-purple-100 text-purple-900' :
                              'bg-amber-200 text-amber-950'
                            }`}>
                              {trace.scope === 0 ? 'Out-of-Scope' : `Scope ${trace.scope}`}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{trace.rawQuantity.toLocaleString()} {trace.rawUnit}</td>
                          <td className="p-3 font-mono text-[11px] text-navy-600">{trace.factorValue} {trace.factorUnit}</td>
                          <td className="p-3 text-right font-mono font-bold text-navy-900 tabular-nums">
                            {trace.gasBreakdown.totalCO2eTon.toFixed(3)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setExpandedTraceKey(isExpanded ? null : trace.itemKey)}
                              className="text-cobalt hover:underline text-xs font-semibold cursor-pointer"
                            >
                              {isExpanded ? 'Hide' : 'Inspect'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-ivory">
                            <td colSpan={6} className="p-4 space-y-2 text-xs">
                              <div className="font-mono bg-white p-2.5 rounded-lg border border-navy-100 text-[11px] text-navy-800">
                                <strong>Formulation:</strong> {trace.equationText}
                              </div>
                              <div className="text-[11px] text-navy-600 flex gap-4">
                                <span><strong>Factor ID:</strong> {trace.factorId}</span>
                                <span><strong>Provenance:</strong> {trace.factorProvenance}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 3: Commuting Summary Table */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-4">
            <div className="border-b border-navy-50 pb-2">
              <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">Table 3 • Commuting Analysis</span>
              <h3 className="text-base font-bold text-navy-900">Commuting Modal Shares and Comparative Carbon Intensities</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50 text-navy-700 font-semibold">
                    <th className="p-3">Transportation Mode</th>
                    <th className="p-3">Commuter Share (% People)</th>
                    <th className="p-3">Emission Share (% Carbon)</th>
                    <th className="p-3">Emission Factor</th>
                    <th className="p-3">Carbon Impact Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 text-navy-700">
                  {commutingModes.map((item, idx) => (
                    <tr key={idx} className={item.highImpact ? 'bg-amber-50/50 font-semibold' : 'hover:bg-navy-50/30'}>
                      <td className="p-3">{item.mode}</td>
                      <td className="p-3 font-mono">{item.commuterShare}</td>
                      <td className="p-3 font-mono font-bold text-navy-900">{item.emissionShare}</td>
                      <td className="p-3 font-mono text-navy-500">{item.factor}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.highImpact ? 'bg-coral-100 text-coral-800' : 'bg-navy-100 text-navy-600'}`}>
                          {item.highImpact ? 'Disproportionate Hotspot' : 'Standard Baseline'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Subview: Campus Map */}
      {activeReportTab === 'map' && boundary && (
        <CampusMap
          boundary={boundary}
          institutionName={institution.name}
          lang={lang}
        />
      )}

      {/* 7. Subview: Written Policy Recommendations Brief (Section 6) */}
      {activeReportTab === 'policy' && (
        <div className="space-y-6">
          {/* Executive Interpretation Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold">
              <Lightbulb className="w-3.5 h-3.5 text-cobalt" />
              <span>{isBn ? 'নীতিমালা ও বাস্তবায়ন সুপারিশ' : 'Institutional Policy Recommendations Brief'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
              Evidence-Based Decarbonization Priorities
            </h2>
            <p className="text-xs sm:text-sm text-navy-700 leading-relaxed bg-ivory p-4 rounded-2xl border border-navy-100">
              {isBn 
                ? `${institution.name}-এর ${institution.reportingYear} শিক্ষাবর্ষের মোট কার্বন ফুটপ্রিন্ট ${total.toFixed(2)} tCO₂e (মাথাপিছু ${result.perCapitaTotal.toFixed(4)} tCO₂e)। নির্গমনের সর্ববৃহৎ অংশ (${largestSourcePct}%) এসেছে ${largestSource.name} থেকে। প্রাতিষ্ঠানিক কার্বন হ্রাসে ব্যক্তিগত গাড়ির বিকল্প পরিবহন ও এসি রেফ্রিজারেন্ট লিকেজ রোধে তাৎক্ষণিক কার্যকর উদ্যোগ গ্রহণ করা সমীচীন।`
                : `The ${institution.reportingYear} greenhouse gas inventory for ${institution.name} quantifies total operational emissions at ${total.toFixed(2)} tCO₂e, corresponding to an intensity of ${result.perCapitaTotal.toFixed(4)} tCO₂e per campus person. The largest single operational hotspot is ${largestSource.name}, generating ${largestSourcePct}% of the entire campus footprint. Meaningful institutional decarbonization requires prioritizing commuter modal shifting and cooling maintenance before capital-intensive energy retrofits.`}
            </p>
          </div>

          {/* Implementation Matrix Table */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-4">
            <div className="border-b border-navy-50 pb-2">
              <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">Implementation Matrix</span>
              <h3 className="text-base font-bold text-navy-900">Prioritized Interventions, Ownership & Measurable Indicators</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50 text-navy-700 font-semibold">
                    <th className="p-3">Recommended Policy Measure</th>
                    <th className="p-3">Supporting Inventory Finding</th>
                    <th className="p-3">Proposed Ownership</th>
                    <th className="p-3">Suggested Timeframe</th>
                    <th className="p-3">Monitoring Indicator</th>
                    <th className="p-3 text-right">Potential Reduction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 text-navy-700">
                  <tr>
                    <td className="p-3 font-bold text-navy-900">Campus Express Shuttles & Solo Car Shift</td>
                    <td className="p-3 text-navy-600">Private cars generate 59.6% of commuting footprint from 8.8% travelers</td>
                    <td className="p-3">Transport Management & Student Affairs</td>
                    <td className="p-3">6–12 months</td>
                    <td className="p-3 font-mono">Solo vehicle share; shuttle log</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">-150 to -350 tCO₂e/yr</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-navy-900">Refrigerant Leak Prevention & Valve Sealing</td>
                    <td className="p-3 text-navy-600">Air conditioning fugitive gas replenishment forms primary Scope 1 load</td>
                    <td className="p-3">Facilities Management & HVAC Cell</td>
                    <td className="p-3">1–3 months (audit)</td>
                    <td className="p-3 font-mono">Refrigerant kg purchased/yr</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">-100 to -250 tCO₂e/yr</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-navy-900">Rooftop Solar PV Installation</td>
                    <td className="p-3 text-navy-600">Grid electricity import accounts for {s2.toFixed(1)} tCO₂e Scope 2 load</td>
                    <td className="p-3">Campus Planning & Electrical Eng</td>
                    <td className="p-3">12–18 months</td>
                    <td className="p-3 font-mono">MWh solar generated/yr</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">-50 to -150 tCO₂e/yr</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-navy-900">Smart LED Retrofits & Power Baseload</td>
                    <td className="p-3 text-navy-600">Continuous lighting and computer lab baseload power consumption</td>
                    <td className="p-3">Electrical Maintenance</td>
                    <td className="p-3">3–6 months</td>
                    <td className="p-3 font-mono">kWh / m² building intensity</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">5–10% grid load cut</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-navy-900">Solid Waste Weighing & Governance Protocol</td>
                    <td className="p-3 text-navy-600">Cafeteria food waste and campus disposal currently unquantified</td>
                    <td className="p-3">Registrar Office & Green Committee</td>
                    <td className="p-3">Per semester</td>
                    <td className="p-3 font-mono">kg organic composted/day</td>
                    <td className="p-3 text-right font-mono text-navy-500 font-normal">Data infrastructure</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-[11px] text-navy-500 space-y-1">
              <div><strong>Methodological Note:</strong> Potential reductions are derived from the deterministic scenario engine using reviewed baseline parameters. They do not constitute approved institutional expenditures.</div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Subview: Download Report */}
      {activeReportTab === 'download' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-navy-100 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-navy-900">Print or Export Assessment Report</h2>
              <p className="text-xs text-navy-500">Save as official print PDF document or export underlying CSV spreadsheets.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-ivory border border-navy-100 space-y-3 text-xs text-navy-800">
            <h4 className="font-bold text-navy-900">Executive Summary for Institutional Record</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
              <div>
                <span className="text-navy-500 block">Institution:</span>
                <span className="font-bold text-navy-900">{institution.name}</span>
              </div>
              <div>
                <span className="text-navy-500 block">Reporting Period:</span>
                <span className="font-bold text-navy-900">{institution.periodStart} &rarr; {institution.periodEnd}</span>
              </div>
              <div>
                <span className="text-navy-500 block">Gross Footprint:</span>
                <span className="font-bold font-mono text-navy-900">{total.toFixed(2)} tCO₂e</span>
              </div>
              <div>
                <span className="text-navy-500 block">Per Capita:</span>
                <span className="font-bold font-mono text-cobalt">{result.perCapitaTotal.toFixed(4)} t/person</span>
              </div>
            </div>
            <p className="text-[11px] text-navy-600 leading-relaxed pt-2 border-t border-navy-200">
              Generated according to the GHG Protocol Corporate Standard (Operational Control) and peer-reviewed empirical research methodology (IEEE Access, DOI: 10.1109/ACCESS.2025.3605517).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
