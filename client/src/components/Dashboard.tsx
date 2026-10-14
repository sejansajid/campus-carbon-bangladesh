import React, { useState } from 'react';
import { 
  BarChart3, 
  Leaf, 
  Zap, 
  Car, 
  Building2, 
  FileText, 
  Layers, 
  HelpCircle, 
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { InventoryCalculationResult, CalculationMethodTier, CalculationTrace } from '../../../shared/types';
import { Language, t } from '../../../shared/i18n';

interface DashboardProps {
  result: InventoryCalculationResult;
  tier: CalculationMethodTier;
  setTier: (tier: CalculationMethodTier) => void;
  onRecalculate: () => Promise<void>;
  lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({
  result,
  tier,
  setTier,
  onRecalculate,
  lang
}) => {
  const [selectedTrace, setSelectedTrace] = useState<CalculationTrace | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'sources' | 'commuting' | 'traces'>('overview');
  const [recalculating, setRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await onRecalculate();
    } finally {
      setRecalculating(false);
    }
  };

  const total = result.totalGrossEmissions;
  const s1 = result.scope1Total;
  const s2 = result.scope2LocationBased;
  const s3 = result.scope3Total;

  const s1Pct = total > 0 ? ((s1 / total) * 100).toFixed(1) : '0';
  const s2Pct = total > 0 ? ((s2 / total) * 100).toFixed(1) : '0';
  const s3Pct = total > 0 ? ((s3 / total) * 100).toFixed(1) : '0';

  // Ranked emission sources
  const rankedSources = [
    { name: 'Commuting (Student, Faculty, Staff Cars & Transit)', tons: result.scope3Breakdown.totalCommuting, scope: 3, color: 'bg-purple-600' },
    { name: 'AC Refrigerant Fugitive Emissions (R-410A & R-22)', tons: result.scope1Breakdown.acR410A + (result.scope1Breakdown.acR22MontrealProtocol || 0), scope: 1, color: 'bg-amber-600' },
    { name: 'Purchased Grid Electricity (Generation)', tons: result.scope2Breakdown.generationEmissions, scope: 2, color: 'bg-blue-600' },
    { name: 'Campus Vehicle Fleet (Diesel & Octane)', tons: result.scope1Breakdown.fleetOctane + result.scope1Breakdown.fleetDiesel, scope: 1, color: 'bg-emerald-600' },
    { name: 'Grid Transmission & Distribution Losses', tons: result.scope3Breakdown.gridTdLosses || 0, scope: 3, color: 'bg-indigo-600' },
    { name: 'Backup Generator (Diesel Combustion)', tons: result.scope1Breakdown.stationaryDiesel, scope: 1, color: 'bg-orange-600' },
    { name: 'Cafeteria Cooking (LPG Cylinders)', tons: result.scope1Breakdown.cafeteriaLpg, scope: 1, color: 'bg-yellow-600' }
  ].filter(s => s.tons > 0).sort((a, b) => b.tons - a.tons);

  // Commuting mode comparison table data (from research study)
  const commutingModes = [
    { mode: 'Private Car (Faculty / Students)', commuterShare: '8.8%', emissionShare: '59.6%', factor: '280.9 g/km', highImpact: true },
    { mode: 'Motorcycle', commuterShare: '8.3%', emissionShare: '6.7%', factor: '40.0 g/km', highImpact: false },
    { mode: 'Public City Bus', commuterShare: '15.4%', emissionShare: '9.2%', factor: '17.1 g/p-km', highImpact: false },
    { mode: 'CNG Auto-Rickshaw', commuterShare: '5.5%', emissionShare: '7.9%', factor: '75.0 g/km', highImpact: false },
    { mode: 'Battery Auto-Rickshaw / Easybike', commuterShare: '7.8%', emissionShare: '3.1%', factor: '50.8 g/km', highImpact: false },
    { mode: 'Leguna (Human hauler)', commuterShare: '1.8%', emissionShare: '0.8%', factor: '27.7 g/p-km', highImpact: false },
    { mode: 'Rickshaw (Cycle)', commuterShare: '26.1%', emissionShare: '0.0%', factor: '0.0 g/km', highImpact: false },
    { mode: 'Walking / Bicycle', commuterShare: '7.3%', emissionShare: '0.0%', factor: '0.0 g/km', highImpact: false },
    { mode: 'Multiple / Multi-modal', commuterShare: '18.9%', emissionShare: '12.6%', factor: '30.6 g/km', highImpact: false }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Run ID: {result.runId}
            </span>
            <span className="text-xs text-slate-400">
              Calculated: {new Date(result.calculatedAt).toLocaleString()}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            Institutional Greenhouse Gas Inventory
          </h2>
          <p className="text-xs text-slate-500">
            Categorized by Scope 1 (Direct), Scope 2 (Electricity), and Scope 3 (Commuting & Value Chain).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Re-run Engine'}
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-slate-500 flex justify-between items-center">
            <span>Total Gross Emissions</span>
            <Leaf className="w-4 h-4 text-forest-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {total.toFixed(2)} <span className="text-xs font-normal text-slate-500">tCO₂e</span>
          </div>
          <div className="text-xs text-slate-500">
            {tier === 'legacy_study_reproduction' ? 'Matches ULAB workbook (2,498.79 t)' : 'Core UNFCCC GHG Basket'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-slate-500 flex justify-between items-center">
            <span>Per Capita Footprint</span>
            <Leaf className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-teal-700">
            {result.perCapitaTotal.toFixed(4)} <span className="text-xs font-normal text-slate-500">tCO₂e/person</span>
          </div>
          <div className="text-xs text-slate-500">
            Student: <span className="font-semibold text-slate-700">{result.perStudentTotal.toFixed(4)}</span> tCO₂e/student
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-slate-500 flex justify-between items-center">
            <span>Scope 1 (Direct)</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-700">
            {s1.toFixed(2)} <span className="text-xs font-normal text-slate-500">tCO₂e ({s1Pct}%)</span>
          </div>
          <div className="text-xs text-slate-500">
            AC Fugitives: {(result.scope1Breakdown.acR410A + (result.scope1Breakdown.acR22MontrealProtocol || 0)).toFixed(1)} t
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-slate-500 flex justify-between items-center">
            <span>Scope 2 & Scope 3</span>
            <div className="flex gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <Car className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>
          <div className="text-xs font-bold text-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Scope 2 (Grid):</span>
              <span className="text-blue-700">{s2.toFixed(2)} t ({s2Pct}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scope 3 (Commuting):</span>
              <span className="text-purple-700">{s3.toFixed(2)} t ({s3Pct}%)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Scope 3 is largest overall share
          </div>
        </div>
      </div>

      {/* Scope Proportion Visualizer Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">Scope Contribution Distribution</span>
          <span className="text-slate-500">Sum = 100% ({total.toFixed(2)} tCO₂e)</span>
        </div>

        <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-100 shadow-inner">
          <div style={{ width: `${s1Pct}%` }} className="bg-amber-500 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold" title={`Scope 1: ${s1Pct}%`}>
            {Number(s1Pct) > 10 ? `S1 ${s1Pct}%` : ''}
          </div>
          <div style={{ width: `${s2Pct}%` }} className="bg-blue-600 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold" title={`Scope 2: ${s2Pct}%`}>
            {Number(s2Pct) > 10 ? `S2 ${s2Pct}%` : ''}
          </div>
          <div style={{ width: `${s3Pct}%` }} className="bg-purple-600 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold" title={`Scope 3: ${s3Pct}%`}>
            {Number(s3Pct) > 10 ? `S3 ${s3Pct}%` : ''}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-700 font-medium">Scope 1 (Direct Fuels & AC):</span>
            <span className="font-bold text-slate-900">{s1.toFixed(2)} t ({s1Pct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-slate-700 font-medium">Scope 2 (Grid Electricity):</span>
            <span className="font-bold text-slate-900">{s2.toFixed(2)} t ({s2Pct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-600" />
            <span className="text-slate-700 font-medium">Scope 3 (Commuting & Losses):</span>
            <span className="font-bold text-slate-900">{s3.toFixed(2)} t ({s3Pct}%)</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation for Detailed Breakdowns */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveView('overview')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 ${
            activeView === 'overview'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Ranked Source Hotspots
        </button>
        <button
          onClick={() => setActiveView('commuting')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 ${
            activeView === 'commuting'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Commuting Mode Share vs Emissions
        </button>
        <button
          onClick={() => setActiveView('traces')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 ${
            activeView === 'traces'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Calculation Audit Traces ({result.traces.length})
        </button>
      </div>

      {/* View 1: Ranked Source Hotspots */}
      {activeView === 'overview' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ranked Major Emission Contributors</h3>
            <p className="text-xs text-slate-500">Hotspot prioritization reveals where institutional mitigation investments yield maximum carbon reduction.</p>
          </div>

          <div className="space-y-3">
            {rankedSources.map((src, i) => {
              const pct = ((src.tons / total) * 100).toFixed(1);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">
                        {i + 1}
                      </span>
                      {src.name}
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${src.scope === 1 ? 'bg-amber-100 text-amber-800' : src.scope === 2 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        Scope {src.scope}
                      </span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {src.tons.toFixed(2)} tCO₂e ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${src.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: Commuting Mode Share vs Emissions (Key Finding of Research) */}
      {activeView === 'commuting' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Commuting Disproportionate Impact Analysis</h3>
              <p className="text-xs text-slate-500">
                Comparison of daily commuter numbers versus actual GHG generation share.
              </p>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs max-w-xs">
              <span className="font-bold">Key Research Finding:</span> Private car users account for only ~8.8% of daily campus travelers, but generate ~59.6% of all commuting emissions!
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="p-3 font-semibold">Transportation Mode</th>
                  <th className="p-3 font-semibold">Commuter Share (% People)</th>
                  <th className="p-3 font-semibold">Emission Share (% Carbon)</th>
                  <th className="p-3 font-semibold">Emission Factor</th>
                  <th className="p-3 font-semibold">Carbon Intensity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {commutingModes.map((item, idx) => (
                  <tr key={idx} className={item.highImpact ? 'bg-amber-50/60 font-semibold' : 'hover:bg-slate-50'}>
                    <td className="p-3 flex items-center gap-2">
                      {item.highImpact && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                      {item.mode}
                    </td>
                    <td className="p-3 font-mono">{item.commuterShare}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{item.emissionShare}</td>
                    <td className="p-3 font-mono text-slate-500">{item.factor}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.highImpact ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>
                        {item.highImpact ? 'Extreme Hotspot' : 'Standard'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Calculation Audit Traces */}
      {activeView === 'traces' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Deterministic Calculation Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Click any line item to inspect the exact mathematical equation, conversion factors, and data provenance.
            </p>
          </div>

          <div className="space-y-2">
            {result.traces.map((trace, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedTrace(trace)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 hover:bg-teal-50/30 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trace.scope === 1 ? 'bg-amber-100 text-amber-800' : trace.scope === 2 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      Scope {trace.scope}
                    </span>
                    {trace.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {trace.equationText}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-900">
                    {trace.gasBreakdown.totalCO2eTon.toFixed(3)} tCO₂e
                  </span>
                  <div className="text-[10px] text-teal-700 font-semibold">Inspect Provenance &rarr;</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trace Inspection Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  Audit Trace & Equation
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedTrace.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTrace(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base px-2"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-slate-800 text-[11px] break-words">
                <span className="font-bold text-slate-500 block text-[10px] uppercase">Exact Formulation:</span>
                {selectedTrace.equationText}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Factor ID & Value</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTrace.factorId}</span>
                  <span className="text-slate-600 block">{selectedTrace.factorValue} {selectedTrace.factorUnit}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Total Calculated</span>
                  <span className="text-base font-extrabold text-teal-800">
                    {selectedTrace.gasBreakdown.totalCO2eTon.toFixed(4)} tCO₂e
                  </span>
                </div>
              </div>

              {selectedTrace.assumptions.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Methodological Assumptions:</span>
                  <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                    {selectedTrace.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTrace.disclosures.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold block text-[11px]">Audit Disclosure Note:</span>
                  {selectedTrace.disclosures.join('; ')}
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedTrace(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900"
              >
                Close Audit Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
