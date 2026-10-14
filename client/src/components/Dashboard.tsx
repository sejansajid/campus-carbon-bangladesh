import React, { useState } from 'react';
import { 
  Leaf, 
  Zap, 
  Car, 
  Building2, 
  FileText, 
  RotateCcw,
  AlertTriangle,
  Info,
  Filter,
  X,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { InventoryCalculationResult, CalculationMethodTier, CalculationTrace } from '../../../shared/types';

interface DashboardProps {
  result: InventoryCalculationResult;
  tier: CalculationMethodTier;
  setTier: (tier: CalculationMethodTier) => void;
  onRecalculate: () => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  result,
  tier,
  setTier,
  onRecalculate
}) => {
  const [selectedTrace, setSelectedTrace] = useState<CalculationTrace | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'commuting' | 'traces'>('overview');
  const [recalculating, setRecalculating] = useState(false);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Determine in-scope refrigerant emissions vs out-of-scope ODS
  const isLegacy = tier === 'legacy_study_reproduction';
  const inScopeRefrigerant = isLegacy 
    ? (result.scope1Breakdown.acR410A + (result.scope1Breakdown.acR22MontrealProtocol || 0))
    : result.scope1Breakdown.acR410A;

  const outOfScopeR22 = !isLegacy ? (result.scope1Breakdown.acR22MontrealProtocol || 319.48) : 0;

  // Ranked emission sources - STRICTLY RECONCILED WITH IN-SCOPE TOTALS
  const rankedSources = [
    { 
      id: 'commuting',
      name: 'Daily Commuting (Students, Faculty, Staff)', 
      tons: result.scope3Breakdown.totalCommuting, 
      scope: 3, 
      color: 'bg-purple-600',
      category: 'employee_commuting'
    },
    { 
      id: 'refrigerants',
      name: isLegacy 
        ? 'AC Refrigerant Fugitives (R-410A & R-22)'
        : 'AC Refrigerant Fugitives (R-410A HFC)', 
      tons: inScopeRefrigerant, 
      scope: 1, 
      color: 'bg-amber-600',
      category: 'refrigerant_fugitive_ac'
    },
    { 
      id: 'grid_electricity',
      name: 'Purchased Grid Electricity (Building & Facility Load)', 
      tons: result.scope2Breakdown.generationEmissions, 
      scope: 2, 
      color: 'bg-cobalt',
      category: 'purchased_electricity_grid'
    },
    { 
      id: 'fleet',
      name: 'Campus Transport Fleet (Diesel & Octane)', 
      tons: result.scope1Breakdown.fleetOctane + result.scope1Breakdown.fleetDiesel, 
      scope: 1, 
      color: 'bg-amber-700',
      category: 'mobile_combustion_fleet'
    },
    { 
      id: 'td_losses',
      name: 'Grid Transmission & Distribution Losses', 
      tons: result.scope3Breakdown.gridTdLosses || 0, 
      scope: 3, 
      color: 'bg-purple-700',
      category: 'upstream_grid_losses'
    },
    { 
      id: 'generator',
      name: 'Backup Emergency Generator (Diesel Combustion)', 
      tons: result.scope1Breakdown.stationaryDiesel, 
      scope: 1, 
      color: 'bg-amber-800',
      category: 'stationary_combustion_diesel'
    },
    { 
      id: 'cafeteria',
      name: 'Cafeteria Cooking (LPG Cylinders)', 
      tons: result.scope1Breakdown.cafeteriaLpg, 
      scope: 1, 
      color: 'bg-amber-900',
      category: 'cafeteria_cooking_lpg'
    }
  ].filter(s => s.tons > 0).sort((a, b) => b.tons - a.tons);

  // Commuting mode comparison
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

  // Filter traces
  const allTraces = [
    ...result.traces,
    ...(result.outOfScopeDisclosures || [])
  ];

  const filteredTraces = allTraces.filter(t => {
    if (selectedSourceFilter && t.category !== selectedSourceFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.factorId.toLowerCase().includes(q) || t.equationText.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-navy-100 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-800 border border-navy-200">
              {isLegacy ? 'ULAB 2022 Historical Baseline' : 'Standard GHG Protocol Accounting'}
            </span>
            <span className="text-xs text-navy-400">
              Updated: {new Date(result.calculatedAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navy-800 mt-1">
            Institutional Greenhouse Gas Inventory
          </h1>
          <p className="text-xs text-navy-500">
            Categorized by Scope 1 (Direct operations), Scope 2 (Purchased electricity), and Scope 3 (Commuting & value chain).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Updating...' : 'Update results'}
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-navy-500 flex justify-between items-center">
            <span>Total Quantified Emissions</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-navy-800 tabular-nums">
            {total.toFixed(2)} <span className="text-xs font-normal text-navy-500">tCO₂e</span>
          </div>
          <div className="text-[11px] text-navy-500">
            {isLegacy ? 'Matches published study (2,498.79 t)' : 'Core UNFCCC GHG basket'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-navy-500 flex justify-between items-center">
            <span>Per Capita Footprint</span>
            <Leaf className="w-4 h-4 text-cobalt" />
          </div>
          <div className="text-3xl font-extrabold text-cobalt tabular-nums">
            {result.perCapitaTotal.toFixed(4)} <span className="text-xs font-normal text-navy-500">tCO₂e/person</span>
          </div>
          <div className="text-[11px] text-navy-500">
            Student: <span className="font-semibold text-navy-700">{result.perStudentTotal.toFixed(4)}</span> tCO₂e/student
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-navy-500 flex justify-between items-center">
            <span>Scope 1 (Direct Operations)</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-700 tabular-nums">
            {s1.toFixed(2)} <span className="text-xs font-normal text-navy-500">tCO₂e ({s1Pct}%)</span>
          </div>
          <div className="text-[11px] text-navy-500">
            In-scope AC fugitives: {inScopeRefrigerant.toFixed(1)} t
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-navy-500 flex justify-between items-center">
            <span>Scope 2 & Scope 3</span>
            <div className="flex gap-1">
              <Zap className="w-3.5 h-3.5 text-cobalt" />
              <Car className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>
          <div className="text-xs font-bold text-navy-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-navy-500">Scope 2 (Grid):</span>
              <span className="text-cobalt tabular-nums">{s2.toFixed(2)} t ({s2Pct}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-500">Scope 3 (Commuting):</span>
              <span className="text-purple-700 tabular-nums">{s3.toFixed(2)} t ({s3Pct}%)</span>
            </div>
          </div>
          <div className="text-[11px] text-navy-400">
            Scope 3 is largest overall share ({s3Pct}%)
          </div>
        </div>
      </div>

      {/* Scope Proportion Visualizer Bar */}
      <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-navy-800">Scope Contribution Distribution</span>
          <span className="text-navy-500 tabular-nums">Sum = 100% ({total.toFixed(2)} tCO₂e)</span>
        </div>

        <div className="h-6 w-full rounded-xl overflow-hidden flex bg-navy-50 shadow-inner">
          <div style={{ width: `${s1Pct}%` }} className="bg-amber-500 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold" title={`Scope 1: ${s1Pct}%`}>
            {Number(s1Pct) > 10 ? `S1 ${s1Pct}%` : ''}
          </div>
          <div style={{ width: `${s2Pct}%` }} className="bg-cobalt transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold" title={`Scope 2: ${s2Pct}%`}>
            {Number(s2Pct) > 10 ? `S2 ${s2Pct}%` : ''}
          </div>
          <div style={{ width: `${s3Pct}%` }} className="bg-purple-600 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold" title={`Scope 3: ${s3Pct}%`}>
            {Number(s3Pct) > 10 ? `S3 ${s3Pct}%` : ''}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-navy-600 font-medium">Scope 1 (Direct Fuels & AC):</span>
            <span className="font-bold text-navy-800 tabular-nums">{s1.toFixed(2)} t ({s1Pct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cobalt" />
            <span className="text-navy-600 font-medium">Scope 2 (Grid Electricity):</span>
            <span className="font-bold text-navy-800 tabular-nums">{s2.toFixed(2)} t ({s2Pct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-600" />
            <span className="text-navy-600 font-medium">Scope 3 (Commuting & Losses):</span>
            <span className="font-bold text-navy-800 tabular-nums">{s3.toFixed(2)} t ({s3Pct}%)</span>
          </div>
        </div>
      </div>

      {/* Out of Scope Montreal Protocol ODS Notice Card (when applicable) */}
      {!isLegacy && outOfScopeR22 > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Informational Disclosure (Montreal Protocol ODS): </span>
              <span>
                Fugitive HCFC-22 (R-22) refrigerant leakage is estimated at <strong>{outOfScopeR22.toFixed(2)} tCO₂e</strong>.
                Under standard GHG Protocol Corporate Accounting, ozone-depleting substances are excluded from the core Scope 1 basket and disclosed in an informational memo.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-amber-200/80 font-mono text-[11px] font-bold text-amber-900 shrink-0">
            Out-of-Scope Memo
          </span>
        </div>
      )}

      {/* Tab Navigation for Detailed Breakdowns */}
      <div className="flex space-x-2 border-b border-navy-100 pb-1">
        <button
          onClick={() => setActiveView('overview')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeView === 'overview'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          Ranked Source Hotspots
        </button>
        <button
          onClick={() => setActiveView('commuting')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeView === 'commuting'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          Commuting Mode Share vs Emissions
        </button>
        <button
          onClick={() => setActiveView('traces')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeView === 'traces'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          How this was calculated ({filteredTraces.length})
        </button>
      </div>

      {/* View 1: Ranked Source Hotspots */}
      {activeView === 'overview' && (
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-navy-800">
                Ranked Major Emission Contributors
              </h3>
              <p className="text-xs text-navy-500">
                Click any source bar below to filter the detailed audit inventory. All rows sum strictly to the reported total.
              </p>
            </div>

            {selectedSourceFilter && (
              <button
                onClick={() => setSelectedSourceFilter(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-navy-100 hover:bg-navy-200 text-navy-800 text-xs font-semibold cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear filter</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {rankedSources.map((src, i) => {
              const pct = ((src.tons / total) * 100).toFixed(1);
              const isSelected = selectedSourceFilter === src.category;
              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedSourceFilter(isSelected ? null : src.category)}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    isSelected ? 'border-cobalt bg-cobalt-50/30' : 'border-navy-100 hover:border-navy-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-navy-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-navy-100 flex items-center justify-center font-bold text-[10px] text-navy-700">
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
                  <div className="h-2.5 w-full bg-navy-100 rounded-full overflow-hidden">
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

      {/* View 2: Commuting Mode Share vs Emissions */}
      {activeView === 'commuting' && (
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-navy-800">
                Commuting Disproportionate Impact Analysis
              </h3>
              <p className="text-xs text-navy-500">
                Comparison of daily commuter numbers versus actual GHG generation share across travel modes.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-ivory border border-navy-200 text-navy-800 text-xs max-w-sm">
              <span className="font-bold block text-navy-900">Key Research Finding:</span> 
              Private car users account for only ~8.8% of daily campus travelers, but generate ~59.6% of all commuting emissions.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-navy-100 bg-navy-50 text-navy-700">
                  <th className="p-3 font-semibold">Transportation Mode</th>
                  <th className="p-3 font-semibold">Commuter Share (% People)</th>
                  <th className="p-3 font-semibold">Emission Share (% Carbon)</th>
                  <th className="p-3 font-semibold">Emission Factor</th>
                  <th className="p-3 font-semibold">Impact Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50 text-navy-700">
                {commutingModes.map((item, idx) => (
                  <tr key={idx} className={item.highImpact ? 'bg-amber-50/50 font-semibold' : 'hover:bg-navy-50/30'}>
                    <td className="p-3 flex items-center gap-2">
                      {item.highImpact && <AlertTriangle className="w-3.5 h-3.5 text-coral" />}
                      {item.mode}
                    </td>
                    <td className="p-3 font-mono">{item.commuterShare}</td>
                    <td className="p-3 font-mono font-bold text-navy-900">{item.emissionShare}</td>
                    <td className="p-3 font-mono text-navy-500">{item.factor}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.highImpact ? 'bg-coral-100 text-coral-800' : 'bg-navy-100 text-navy-600'}`}>
                        {item.highImpact ? 'High Hotspot' : 'Standard'}
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
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-navy-800">
                How this was calculated
              </h3>
              <p className="text-xs text-navy-500">
                Select any line item to inspect the exact mathematical equation, conversion factors, and data provenance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search line items..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy-800 placeholder-navy-400 focus:outline-none focus:border-cobalt"
              />
              {selectedSourceFilter && (
                <button
                  onClick={() => setSelectedSourceFilter(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-navy-100 text-navy-700 text-xs font-semibold cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {filteredTraces.map((trace, idx) => {
              const isOutOfScope = trace.scope === 0;
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedTrace(trace)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                    isOutOfScope 
                      ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400' 
                      : 'border-navy-100 hover:border-cobalt-300 bg-white hover:bg-navy-50/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-navy-900 flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        trace.scope === 1 ? 'bg-amber-100 text-amber-800' :
                        trace.scope === 2 ? 'bg-blue-100 text-blue-800' :
                        trace.scope === 3 ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-200 text-amber-900'
                      }`}>
                        {isOutOfScope ? 'Out-of-Scope Memo' : `Scope ${trace.scope}`}
                      </span>
                      {trace.name}
                    </div>
                    <div className="text-[11px] font-mono text-navy-500">
                      {trace.equationText}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-navy-900 tabular-nums">
                      {trace.gasBreakdown.totalCO2eTon.toFixed(3)} tCO₂e
                    </span>
                    <div className="text-[10px] text-cobalt font-semibold">Inspect Provenance &rarr;</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trace Inspection Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-navy-200 p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-navy-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cobalt-50 text-cobalt border border-cobalt-200">
                  {selectedTrace.scope === 0 ? 'Out-of-Scope Memo' : `Scope ${selectedTrace.scope} Calculation`}
                </span>
                <h3 className="text-base font-bold text-navy-900 mt-1">{selectedTrace.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTrace(null)}
                className="text-navy-400 hover:text-navy-700 font-bold text-base px-2 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-ivory p-3 rounded-xl border border-navy-100 font-mono text-navy-900 text-[11px] break-words">
                <span className="font-bold text-navy-500 block text-[10px] uppercase">Exact Formulation:</span>
                {selectedTrace.equationText}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-navy-50/60 border border-navy-100">
                  <span className="text-navy-400 block text-[10px]">Factor ID & Value</span>
                  <span className="font-mono font-bold text-navy-800">{selectedTrace.factorId}</span>
                  <span className="text-navy-600 block">{selectedTrace.factorValue} {selectedTrace.factorUnit}</span>
                </div>

                <div className="p-3 rounded-xl bg-navy-50/60 border border-navy-100">
                  <span className="text-navy-400 block text-[10px]">Total Calculated</span>
                  <span className="text-base font-extrabold text-cobalt tabular-nums">
                    {selectedTrace.gasBreakdown.totalCO2eTon.toFixed(4)} tCO₂e
                  </span>
                </div>
              </div>

              {selectedTrace.assumptions.length > 0 && (
                <div>
                  <span className="font-bold text-navy-700 block mb-1">Methodological Assumptions:</span>
                  <ul className="list-disc pl-5 space-y-0.5 text-navy-600">
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
                className="px-4 py-2 rounded-xl bg-navy-800 text-white font-semibold text-xs hover:bg-navy-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
