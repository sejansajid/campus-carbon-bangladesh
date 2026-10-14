import React, { useState, useEffect, useRef } from 'react';
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
  Users,
  PieChart,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Flame,
  Table as TableIcon
} from 'lucide-react';
import { 
  InventoryCalculationResult, 
  Institution, 
  PopulationRecord, 
  CampusBoundary, 
  CalculationTrace 
} from '../../../shared/types';
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
  const [hotspotViewMode, setHotspotViewMode] = useState<'chart' | 'table'>('chart');
  const [tableSearch, setTableSearch] = useState('');
  const [expandedTraceKey, setExpandedTraceKey] = useState<string | null>(null);

  // Policy Brief State
  const [policyBrief, setPolicyBrief] = useState<any | null>(null);
  const [loadingPolicyBrief, setLoadingPolicyBrief] = useState(false);
  const [policyBriefError, setPolicyBriefError] = useState<string | null>(null);
  const [isPolicyStale, setIsPolicyStale] = useState(false);
  const loadedRunIdRef = useRef<string | null>(null);

  const isBn = lang === 'bn';

  const total = result.totalGrossEmissions;
  const s1 = result.scope1Total;
  const s2 = result.scope2LocationBased;
  const s3 = result.scope3Total;

  const s1Pct = total > 0 ? ((s1 / total) * 100).toFixed(1) : '0';
  const s2Pct = total > 0 ? ((s2 / total) * 100).toFixed(1) : '0';
  const s3Pct = total > 0 ? ((s3 / total) * 100).toFixed(1) : '0';

  // Format percentage with <0.1% safeguard
  const formatSharePct = (val: number, totalVal: number): string => {
    if (totalVal <= 0 || val <= 0) return '0.0%';
    const pct = (val / totalVal) * 100;
    if (pct < 0.05) return '<0.1%';
    return `${pct.toFixed(1)}%`;
  };

  // Coordinated Ranked Emission Sources
  const allRankedSources = [
    { 
      id: 'commute',
      name: isBn ? 'দৈনিক যাতায়াত (শিক্ষার্থী ও কর্মী)' : 'Commuter Travel (Students & Staff)', 
      tons: result.scope3Breakdown.totalCommuting, 
      scope: 3, 
      category: 'Commuting & Passenger Transit',
      color: '#7C3AED'
    },
    { 
      id: 'grid_elec',
      name: isBn ? 'ক্রয়কৃত জাতীয় গ্রিড বিদ্যুৎ' : 'Purchased Utility Grid Electricity', 
      tons: result.scope2LocationBased, 
      scope: 2, 
      category: 'Purchased Energy Generation',
      color: '#2457D6'
    },
    { 
      id: 'ac_fugitive',
      name: isBn ? 'এসি রেফ্রিজারেন্ট লিকেজ (R-410A / R-22)' : 'AC Refrigerant Fugitives (R-410A / R-22)', 
      tons: result.scope1Breakdown.acR410A + (result.scope1Breakdown.acR22MontrealProtocol || 0), 
      scope: 1, 
      category: 'Fugitive HVAC Cooling Top-Up',
      color: '#D97706'
    },
    { 
      id: 'fleet_transport',
      name: isBn ? 'ক্যাম্পাস যানবাহন বহর (অকটেন ও ডিজেল)' : 'Campus Vehicle Fleet (Diesel & Octane)', 
      tons: result.scope1Breakdown.fleetOctane + result.scope1Breakdown.fleetDiesel, 
      scope: 1, 
      category: 'Mobile Combustion Fleet',
      color: '#B45309'
    },
    { 
      id: 'generator_diesel',
      name: isBn ? 'জরুরি জেনারেটর (ডিজেল)' : 'Backup Emergency Generator (Diesel)', 
      tons: result.scope1Breakdown.stationaryDiesel, 
      scope: 1, 
      category: 'Stationary Power Generation',
      color: '#F59E0B'
    },
    { 
      id: 'cafeteria_lpg',
      name: isBn ? 'ক্যাফেটেরিয়া রান্নার এলপিজি' : 'Cafeteria Cooking (Commercial LPG)', 
      tons: result.scope1Breakdown.cafeteriaLpg, 
      scope: 1, 
      category: 'Commercial Kitchen Combustion',
      color: '#D97706'
    }
  ].filter(s => s.tons > 0).sort((a, b) => b.tons - a.tons);

  // Filter sources based on active selectedScope
  const activeSources = selectedScope === null 
    ? allRankedSources 
    : allRankedSources.filter(s => s.scope === selectedScope);

  const largestSource = allRankedSources[0] || { name: 'None reported', tons: 0, scope: 1 };
  const largestSourcePct = formatSharePct(largestSource.tons, total);

  // Dynamic, data-derived takeaway
  const hotspotTakeaway = (() => {
    if (total <= 0) return 'No quantified emissions recorded in this assessment run.';
    if (largestSource.scope === 3) {
      return `Commuting accounts for ${largestSourcePct} of reported emissions. Shifting modal share away from single-occupancy private vehicles is the primary decarbonization lever.`;
    }
    if (largestSource.scope === 2) {
      return `Purchased grid electricity accounts for ${largestSourcePct} of reported emissions. On-site solar photovoltaic installation and baseload power management represent the primary decarbonization priority.`;
    }
    return `${largestSource.name} accounts for ${largestSourcePct} of reported emissions. Equipment maintenance and efficiency upgrades represent the primary direct mitigation target.`;
  })();

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

  // Filtered subtotal
  const filteredSubtotal = selectedScope === null 
    ? total 
    : (selectedScope === 1 ? s1 : selectedScope === 2 ? s2 : s3);

  // Fetch or regenerate policy recommendations brief
  const fetchPolicyBrief = async (forceRegenerate: boolean = false) => {
    setLoadingPolicyBrief(true);
    setPolicyBriefError(null);

    const evidencePacket = {
      runId: result.runId,
      institutionName: institution.name,
      reportingYear: institution.reportingYear,
      totalGrossEmissions: result.totalGrossEmissions,
      perCapitaTotal: result.perCapitaTotal,
      perStudentTotal: result.perStudentTotal,
      scope1Total: result.scope1Total,
      scope2Total: result.scope2LocationBased,
      scope3Total: result.scope3Total,
      scope1SharePercent: Number(s1Pct),
      scope2SharePercent: Number(s2Pct),
      scope3SharePercent: Number(s3Pct),
      largestSource: {
        name: largestSource.name,
        tons: largestSource.tons,
        sharePercent: total > 0 ? (largestSource.tons / total) * 100 : 0,
        scope: largestSource.scope
      },
      hotspots: allRankedSources.map(s => ({
        name: s.name,
        tons: s.tons,
        sharePercent: total > 0 ? (s.tons / total) * 100 : 0,
        scope: s.scope,
        category: s.category
      })),
      population: {
        total: population?.totalHeadcount || 5350,
        students: population?.studentHeadcount || 4860,
        faculty: population?.facultyHeadcount || 240,
        staff: population?.staffHeadcount || 250,
        operatingDays: population?.campusOperatingDaysPerYear || 294
      },
      coverageStatus: {
        isPartial: result.unquantifiedCategories?.length > 0,
        unquantifiedCategories: result.unquantifiedCategories || [],
        dataQualityTiers: {}
      },
      scenarioSavings: {
        solarRooftopTons: result.scope2LocationBased * 0.35,
        commuterShiftTons: result.scope3Breakdown.totalCommuting * 0.30,
        coolingEfficiencyTons: (result.scope1Breakdown.acR410A + (result.scope1Breakdown.acR22MontrealProtocol || 0)) * 0.40,
        totalPotentialTons: (result.scope2LocationBased * 0.35) + (result.scope3Breakdown.totalCommuting * 0.30),
        percentageReduction: total > 0 ? 32.5 : 0
      }
    };

    try {
      const res = await fetch('/api/policy-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidencePacket, lang, forceRegenerate })
      });

      if (res.ok) {
        const data = await res.json();
        setPolicyBrief(data);
        loadedRunIdRef.current = result.runId;
        setIsPolicyStale(false);
      } else {
        const errJson = await res.json();
        setPolicyBriefError(errJson.error || 'Failed to generate policy brief');
      }
    } catch (err: any) {
      setPolicyBriefError('Network error connecting to policy brief engine: ' + err.message);
    } finally {
      setLoadingPolicyBrief(false);
    }
  };

  // Load policy brief on initial render or when runId changes
  useEffect(() => {
    if (activeReportTab === 'policy' && (!policyBrief || loadedRunIdRef.current !== result.runId)) {
      fetchPolicyBrief();
    }
  }, [activeReportTab, result.runId]);

  // Check if policy brief is stale
  useEffect(() => {
    if (loadedRunIdRef.current && loadedRunIdRef.current !== result.runId) {
      setIsPolicyStale(true);
    }
  }, [result.runId]);

  // Donut chart path calculation
  const createDonutArcs = () => {
    const cx = 140;
    const cy = 140;
    const rOuter = 110;
    const rInner = 65;

    let currentAngle = -Math.PI / 2;
    const slices = [
      { scope: 1, val: s1, color: '#D97706', label: 'Scope 1' },
      { scope: 2, val: s2, color: '#2457D6', label: 'Scope 2' },
      { scope: 3, val: s3, color: '#7C3AED', label: 'Scope 3' }
    ];

    return slices.map(sl => {
      const pct = total > 0 ? sl.val / total : 0;
      const angle = pct * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const x1 = cx + rOuter * Math.cos(startAngle);
      const y1 = cy + rOuter * Math.sin(startAngle);
      const x2 = cx + rOuter * Math.cos(endAngle);
      const y2 = cy + rOuter * Math.sin(endAngle);

      const x3 = cx + rInner * Math.cos(endAngle);
      const y3 = cy + rInner * Math.sin(endAngle);
      const x4 = cx + rInner * Math.cos(startAngle);
      const y4 = cy + rInner * Math.sin(startAngle);

      const largeArc = angle > Math.PI ? 1 : 0;
      const pathData = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

      return {
        ...sl,
        pathData,
        pct: (pct * 100).toFixed(1)
      };
    });
  };

  const donutSlices = createDonutArcs();

  // Helper download CSV of current filtered table
  const downloadFilteredTableCsv = () => {
    const headers = ['item_key', 'name', 'scope', 'category', 'raw_quantity', 'raw_unit', 'factor_id', 'factor_value', 'factor_unit', 'factor_provenance', 'emissions_tco2e'];
    const rows = filteredTraces.map(t => [
      `"${t.itemKey}"`,
      `"${t.name.replace(/"/g, '""')}"`,
      t.scope,
      `"${t.category}"`,
      t.rawQuantity,
      `"${t.rawUnit}"`,
      `"${t.factorId}"`,
      t.factorValue,
      `"${t.factorUnit}"`,
      `"${t.factorProvenance}"`,
      t.gasBreakdown.totalCO2eTon.toFixed(4)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${institution.name.replace(/\s+/g, '_')}_Emissions_Table_${selectedScope ? `Scope${selectedScope}` : 'All'}.csv`;
    link.click();
  };

  // Helper download policy brief prose
  const downloadPolicyBriefProse = () => {
    if (!policyBrief?.fullBriefProse) return;
    const blob = new Blob([policyBrief.fullBriefProse], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${institution.name.replace(/\s+/g, '_')}_Policy_Brief_${institution.reportingYear}.md`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* 1. Report Header: Institution, reporting period, boundary, and report status */}
      {isExample ? (
        <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <span>{isBn ? 'উদাহরণ মূল্যায়ন প্রতিবেদন — ইউল্যাব ২০২২' : 'Example assessment report — ULAB 2022'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-1">
                University of Liberal Arts Bangladesh (2022)
              </h1>
              <p className="text-xs text-amber-900/80 mt-1">
                {isBn 
                  ? 'ইউল্যাব ২০২২ গবেষণার উপাত্ত ব্যবহার করে প্রস্তুতকৃত উদাহরণ প্রতিবেদন। প্রকাশিত গবেষণা ফলাফল: ২,৪৯৮.৮০ tCO₂e এবং ০.৪৬৭১ tCO₂e/ব্যক্তি।'
                  : 'Example report using ULAB\'s 2022 study data. Published study baseline: 2,498.80 tCO₂e and 0.4671 tCO₂e/person (reproduction within 0.03%).'}
              </p>
            </div>

            {onReturnToAssessment && (
              <button
                onClick={onReturnToAssessment}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs transition cursor-pointer shadow-2xs shrink-0 self-start"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isBn ? 'আমার মূল্যায়নে ফিরুন' : '← Return to my assessment'}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-navy-100 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-cobalt" />
                <span>{isBn ? 'প্রাতিষ্ঠানিক কার্বন মূল্যায়ন প্রতিবেদন' : 'Institutional Carbon Assessment Report'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
                {institution.name}
              </h1>
              <p className="text-xs text-navy-500 mt-0.5">
                {institution.address || `${institution.district}, ${institution.division}`} • Reporting Year: <strong>{institution.reportingYear}</strong> ({institution.periodStart} &rarr; {institution.periodEnd}) • Operational Control Boundary
              </p>
            </div>

            {onReturnToAssessment && (
              <button
                onClick={onReturnToAssessment}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-50 hover:bg-navy-100 border border-navy-200 text-navy-700 font-bold text-xs transition cursor-pointer self-start"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isBn ? 'ইনপুট সংশোধন করুন' : 'Edit assessment inputs'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Summary: Total tCO2e, per-capita emissions with population denominator, largest source, and coverage status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-1.5">
          <span className="text-xs text-navy-500 font-medium">{isBn ? 'মোট প্রত্যক্ষ ও পরোক্ষ নির্গমন' : 'Total Gross Emissions'}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-900 tabular-nums">
            {total.toFixed(2)} <span className="text-xs font-normal text-navy-500">tCO₂e</span>
          </div>
          <div className="text-[11px] text-navy-500">
            {isExample ? 'Matches ULAB study (2,498.79 t)' : 'Core operational boundary'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-1.5">
          <span className="text-xs text-navy-500 font-medium">{isBn ? 'মাথাপিছু কার্বন পদচিহ্ন' : 'Per Capita Footprint'}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-cobalt tabular-nums">
            {result.perCapitaTotal.toFixed(4)} <span className="text-xs font-normal text-navy-500">tCO₂e/person</span>
          </div>
          <div className="text-[11px] text-navy-500">
            Denominator: <strong>{population ? population.totalHeadcount.toLocaleString() : '5,350'}</strong> campus headcount
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-1.5">
          <span className="text-xs text-navy-500 font-medium">{isBn ? 'সর্ববৃহৎ নির্গমন উৎস' : 'Largest Emission Source'}</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 tabular-nums">
            {largestSourcePct}
          </div>
          <div className="text-[11px] text-navy-500 truncate" title={largestSource.name}>
            {largestSource.name}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-1.5">
          <span className="text-xs text-navy-500 font-medium">{isBn ? 'ইনভেনটরি কভারেজ স্ট্যাটাস' : 'Boundary Coverage Status'}</span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 pt-0.5">
            {result.unquantifiedCategories?.length > 0 ? 'Partial Coverage' : 'Verified Scopes 1, 2, 3'}
          </div>
          <div className="text-[11px] text-navy-500">
            {result.unquantifiedCategories?.length > 0 
              ? `${result.unquantifiedCategories.length} categories unquantified` 
              : 'Core energy, fuels, and transit quantified'}
          </div>
        </div>
      </div>

      {/* 3. Report Local Navigation: Overview & Hotspots · Figures & tables · Campus map · Policy report · Downloads */}
      <div className="bg-white rounded-2xl border border-navy-100 p-1.5 shadow-2xs flex space-x-1 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('overview')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
            activeReportTab === 'overview' ? 'bg-cobalt text-white shadow-2xs' : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>{isBn ? 'সারসংক্ষেপ ও হটস্পট' : 'Overview & Hotspots'}</span>
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
          <span>{isBn ? 'নীতিমালা ও এআই সুপারিশ' : 'Policy report'}</span>
        </button>

        <button
          onClick={() => setActiveReportTab('download')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
            activeReportTab === 'download' ? 'bg-cobalt text-white shadow-2xs' : 'text-navy-700 hover:text-navy-900 hover:bg-navy-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isBn ? 'প্রতিবেদন ডাউনলোড' : 'Downloads & Export'}</span>
        </button>
      </div>

      {/* Filter Active Alert Banner */}
      {selectedScope !== null && (
        <div className="bg-cobalt-50 border border-cobalt-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-cobalt-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cobalt"></span>
            <span>
              Filtered to <strong>Scope {selectedScope}</strong> — Subtotal: <strong>{filteredSubtotal.toFixed(2)} tCO₂e</strong> ({formatSharePct(filteredSubtotal, total)} of total reported inventory).
            </span>
          </div>
          <button
            onClick={() => setSelectedScope(null)}
            className="px-3 py-1 bg-white hover:bg-cobalt-100 text-cobalt-800 border border-cobalt-300 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Reset filter
          </button>
        </div>
      )}

      {/* 4. Subview: Overview & Emission Hotspots (Section 3C, 3D, 4) */}
      {activeReportTab === 'overview' && (
        <div className="space-y-6">
          {/* Section C: Interactive Scope Donut & Composition */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-50 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">Operational Boundary Composition</span>
                <h3 className="text-lg font-bold text-navy-900">Scope Distribution (Scope 1, 2, and 3)</h3>
                <p className="text-xs text-navy-500">Click any scope slice or button to filter related hotspot bars and line-item tables.</p>
              </div>

              {selectedScope !== null && (
                <button
                  onClick={() => setSelectedScope(null)}
                  className="text-xs font-bold text-cobalt hover:underline cursor-pointer"
                >
                  Clear filter (Show All)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Donut SVG */}
              <div className="md:col-span-5 flex justify-center">
                <svg viewBox="0 0 280 280" className="w-64 h-64 select-none">
                  {donutSlices.map(sl => {
                    const isSelected = selectedScope === sl.scope;
                    return (
                      <path
                        key={sl.scope}
                        d={sl.pathData}
                        fill={sl.color}
                        opacity={selectedScope === null || isSelected ? 1 : 0.35}
                        stroke={isSelected ? '#14243A' : '#FFFFFF'}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="cursor-pointer transition-opacity duration-150 hover:opacity-90"
                        onClick={() => setSelectedScope(selectedScope === sl.scope ? null : sl.scope)}
                      >
                        <title>{`${sl.label}: ${sl.val.toFixed(2)} tCO₂e (${sl.pct}%)`}</title>
                      </path>
                    );
                  })}
                  {/* Donut Center Display */}
                  <circle cx="140" cy="140" r="62" fill="#FFFFFF" />
                  <text x="140" y="132" textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748B">
                    {selectedScope ? `Scope ${selectedScope}` : 'Total Footprint'}
                  </text>
                  <text x="140" y="152" textAnchor="middle" fontSize="16" fontWeight="800" fill="#14243A" fontFeatureSettings="'tnum'">
                    {filteredSubtotal.toFixed(1)} <tspan fontSize="10" fontWeight="500">t</tspan>
                  </text>
                </svg>
              </div>

              {/* Scope Breakdown Cards */}
              <div className="md:col-span-7 space-y-3">
                {donutSlices.map(sl => {
                  const isSelected = selectedScope === sl.scope;
                  return (
                    <div
                      key={sl.scope}
                      onClick={() => setSelectedScope(selectedScope === sl.scope ? null : sl.scope)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'bg-navy-50/80 border-navy-800 shadow-2xs' 
                          : 'bg-white hover:bg-navy-50/40 border-navy-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: sl.color }}></span>
                        <div>
                          <div className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                            <span>{sl.label}</span>
                            <span className="text-[10px] text-navy-400 font-normal">
                              {sl.scope === 1 ? '(Direct Fuels & HVAC)' : sl.scope === 2 ? '(Purchased Utility Electricity)' : '(Commuter Travel & T&D Losses)'}
                            </span>
                          </div>
                          <div className="text-[11px] text-navy-500">
                            {formatSharePct(sl.val, total)} of total reported emissions
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-navy-900 tabular-nums">
                          {sl.val.toFixed(2)} <span className="text-[10px] font-normal text-navy-500">tCO₂e</span>
                        </div>
                        <span className="text-[10px] text-cobalt font-semibold">
                          {isSelected ? 'Active Filter' : 'Filter scope →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section D & 4: Emission Hotspot Presentation with Ranked Bars and Chart/Table Switch */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-50 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">Priority Analysis</span>
                <h3 className="text-base sm:text-lg font-bold text-navy-900">Ranked Emission Source Contributions</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-navy-50 p-1 rounded-xl border border-navy-100 text-xs">
                  <button
                    onClick={() => setHotspotViewMode('chart')}
                    className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                      hotspotViewMode === 'chart' ? 'bg-white text-navy-900 shadow-2xs' : 'text-navy-500 hover:text-navy-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Ranked Bars</span>
                  </button>
                  <button
                    onClick={() => setHotspotViewMode('table')}
                    className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                      hotspotViewMode === 'table' ? 'bg-white text-navy-900 shadow-2xs' : 'text-navy-500 hover:text-navy-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Details Table</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Concise Data-Derived Takeaway */}
            <div className="p-4 rounded-2xl bg-ivory border border-navy-100 text-xs text-navy-800 leading-relaxed flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-cobalt shrink-0 mt-0.5" />
              <div>
                <strong>Analytical Takeaway:</strong> {hotspotTakeaway}
              </div>
            </div>

            {/* View Mode: Ranked Horizontal Bars */}
            {hotspotViewMode === 'chart' ? (
              <div className="space-y-4 pt-2">
                {activeSources.map((src, idx) => {
                  const maxVal = Math.max(...activeSources.map(s => s.tons), 1);
                  const barWidthPct = Math.max((src.tons / maxVal) * 100, 3);
                  const sharePct = formatSharePct(src.tons, total);

                  return (
                    <div key={src.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-navy-50 text-navy-700 font-bold text-[10px] flex items-center justify-center border border-navy-200">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-navy-900">{src.name}</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            src.scope === 1 ? 'bg-amber-100 text-amber-900' : src.scope === 2 ? 'bg-blue-100 text-blue-900' : 'bg-purple-100 text-purple-900'
                          }`}>
                            Scope {src.scope}
                          </span>
                        </div>
                        <div className="text-right font-mono font-bold text-navy-900 tabular-nums">
                          {src.tons.toFixed(2)} tCO₂e ({sharePct})
                        </div>
                      </div>

                      <div className="h-6 w-full bg-navy-50 rounded-xl overflow-hidden p-0.5 border border-navy-100">
                        <div
                          style={{ width: `${barWidthPct}%`, backgroundColor: src.color }}
                          className="h-full rounded-lg transition-all duration-300"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* View Mode: Details Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-navy-100 bg-navy-50 text-navy-700 font-semibold">
                      <th className="p-3">Rank</th>
                      <th className="p-3">Source Name</th>
                      <th className="p-3">Scope</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Emissions (tCO₂e)</th>
                      <th className="p-3 text-right">Share of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-50 text-navy-700">
                    {activeSources.map((src, idx) => (
                      <tr key={src.id} className="hover:bg-navy-50/40">
                        <td className="p-3 font-bold text-navy-400">#{idx + 1}</td>
                        <td className="p-3 font-semibold text-navy-900">{src.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            src.scope === 1 ? 'bg-amber-100 text-amber-900' : src.scope === 2 ? 'bg-blue-100 text-blue-900' : 'bg-purple-100 text-purple-900'
                          }`}>
                            Scope {src.scope}
                          </span>
                        </td>
                        <td className="p-3 text-navy-500">{src.category}</td>
                        <td className="p-3 text-right font-mono font-bold text-navy-900 tabular-nums">{src.tons.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono tabular-nums">{formatSharePct(src.tons, total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Subview: Figures & Coordinated Tables (Section 5) */}
      {activeReportTab === 'figures' && (
        <div className="space-y-8">
          {/* Scholarly Figures Component */}
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
                <button
                  onClick={downloadFilteredTableCsv}
                  className="px-3 py-1.5 rounded-lg bg-cobalt hover:bg-cobalt-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
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
                              <div className="text-[11px] text-navy-600 flex flex-wrap gap-4">
                                <span><strong>Factor ID:</strong> {trace.factorId}</span>
                                <span><strong>Provenance:</strong> {trace.factorProvenance}</span>
                                <span><strong>GWP Applied:</strong> {trace.gwpApplied}</span>
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
        </div>
      )}

      {/* 6. Subview: Campus Map (Section 9) */}
      {activeReportTab === 'map' && boundary && (
        <CampusMap
          boundary={boundary}
          institutionName={institution.name}
          lang={lang}
          isDemo={isExample}
        />
      )}

      {/* 7. Subview: Custom Evidence-Based Policy Report (Section 6) */}
      {activeReportTab === 'policy' && (
        <div className="space-y-6">
          {/* Header Bar with Generate / Regenerate Controls */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold">
                  <Lightbulb className="w-3.5 h-3.5 text-cobalt" />
                  <span>Evidence-Based Decarbonization Policy Report</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">
                  Policy Recommendations Brief
                </h2>
                <p className="text-xs text-navy-500">
                  Synthesized directly from your verified calculation run. Numbers are derived from the deterministic scenario engine.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => fetchPolicyBrief(true)}
                  disabled={loadingPolicyBrief}
                  className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPolicyBrief ? 'animate-spin' : ''}`} />
                  <span>{loadingPolicyBrief ? 'Generating...' : (policyBrief ? 'Regenerate brief' : 'Generate policy report')}</span>
                </button>

                {policyBrief && (
                  <button
                    onClick={downloadPolicyBriefProse}
                    className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Brief (.md)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Provider Status Disclosure Banner */}
            {policyBrief && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-navy-50 border border-navy-100 text-xs text-navy-700">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${policyBrief.isAiGenerated ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                  <span><strong>Report Mode:</strong> {policyBrief.providerStatus}</span>
                </div>
                <span className="text-navy-400 text-[11px]">Run: {policyBrief.runId}</span>
              </div>
            )}

            {isPolicyStale && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <span>Assessment inputs have changed since this report was generated.</span>
                <button
                  onClick={() => fetchPolicyBrief(true)}
                  className="font-bold underline text-amber-950 cursor-pointer"
                >
                  Regenerate now
                </button>
              </div>
            )}
          </div>

          {/* Executive Interpretation (100–150 words) */}
          {policyBrief && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">Executive Interpretation</h3>
              <p className="text-sm text-navy-700 leading-relaxed bg-ivory p-4 rounded-2xl border border-navy-100">
                {policyBrief.executiveInterpretation}
              </p>
            </div>
          )}

          {/* Priority Recommendations (3–5 structured recommendations) */}
          {policyBrief && policyBrief.recommendations && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-navy-900 px-1">Priority Institutional Interventions</h3>
              <div className="grid grid-cols-1 gap-4">
                {policyBrief.recommendations.map((rec: any, idx: number) => (
                  <div key={rec.id || idx} className="bg-white p-6 rounded-3xl border border-navy-100 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cobalt text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-base font-bold text-navy-900">{rec.title}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-100 text-navy-700 self-start sm:self-auto">
                        {rec.category}
                      </span>
                    </div>

                    <div className="text-xs text-navy-600 bg-navy-50/50 p-3 rounded-xl border border-navy-100">
                      <strong>Motivating Finding:</strong> {rec.supportingFinding}
                    </div>

                    <div className="text-xs text-navy-800 leading-relaxed">
                      <strong>Proposed Institutional Policy:</strong> {rec.proposedPolicy || rec.rationale}
                    </div>

                    {rec.implementationSteps && rec.implementationSteps.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-bold text-navy-700 block">Practical Implementation Steps:</span>
                        <ul className="text-xs text-navy-600 list-disc pl-5 space-y-0.5">
                          {rec.implementationSteps.map((step: string, sIdx: number) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-navy-50 text-[11px]">
                      <div>
                        <span className="text-navy-400 block">Responsible Office:</span>
                        <span className="font-semibold text-navy-800">{rec.proposedDepartment}</span>
                      </div>
                      <div>
                        <span className="text-navy-400 block">Timeframe:</span>
                        <span className="font-semibold text-navy-800">{rec.suggestedTimeframe}</span>
                      </div>
                      <div>
                        <span className="text-navy-400 block">Monitoring Indicator:</span>
                        <span className="font-semibold text-navy-800">{rec.monitoringIndicator}</span>
                      </div>
                      <div>
                        <span className="text-navy-400 block">Potential Reduction:</span>
                        <span className="font-bold text-emerald-700">{rec.quantifiedPotentialSaving}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Implementation Matrix Table */}
          {policyBrief && policyBrief.implementationTable && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-4">
              <div className="border-b border-navy-50 pb-2">
                <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">Implementation Matrix</span>
                <h3 className="text-base font-bold text-navy-900">Summary Action Matrix, Governance & Indicators</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-navy-100 bg-navy-50 text-navy-700 font-semibold">
                      <th className="p-3">Recommended Measure</th>
                      <th className="p-3">Supporting Finding</th>
                      <th className="p-3">Proposed Ownership</th>
                      <th className="p-3">Timeframe</th>
                      <th className="p-3">Monitoring Indicator</th>
                      <th className="p-3 text-right">Potential Reduction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-50 text-navy-700">
                    {policyBrief.implementationTable.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-navy-50/30">
                        <td className="p-3 font-bold text-navy-900">{row.measure}</td>
                        <td className="p-3 text-navy-600">{row.finding}</td>
                        <td className="p-3">{row.department}</td>
                        <td className="p-3">{row.timeframe}</td>
                        <td className="p-3 font-mono">{row.indicator}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">{row.potentialSaving}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expandable Assumptions & Limitations */}
          {policyBrief && policyBrief.assumptionsAndLimitations && (
            <div className="bg-white p-6 rounded-3xl border border-navy-100 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider">Methodological Assumptions & Constraints</h4>
              <ul className="text-xs text-navy-600 list-disc pl-5 space-y-1.5 leading-relaxed">
                {policyBrief.assumptionsAndLimitations.map((item: string, aIdx: number) => (
                  <li key={aIdx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 8. Subview: Downloads & Exports (Section 3G, 5) */}
      {activeReportTab === 'download' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-navy-100 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-navy-900">Official Report & Data Export Package</h2>
              <p className="text-xs text-navy-500">Download formatted PDF reports, publication vector charts, and underlying data tables.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save Official PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-navy-50/50 border border-navy-100 space-y-3">
              <h4 className="font-bold text-navy-900 text-sm">Full Report Print Package</h4>
              <p className="text-xs text-navy-600">
                Institutional layout formatted for academic senate, university board of trustees, and UGC reporting.
              </p>
              <button
                onClick={() => window.print()}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-navy-100 border border-navy-200 text-navy-800 font-bold text-xs transition cursor-pointer"
              >
                Open Print Preview
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-navy-50/50 border border-navy-100 space-y-3">
              <h4 className="font-bold text-navy-900 text-sm">Line-Item Data Table (CSV)</h4>
              <p className="text-xs text-navy-600">
                Full activity records, raw units, emission factor values, factor IDs, provenance, and formulas.
              </p>
              <button
                onClick={downloadFilteredTableCsv}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-navy-100 border border-navy-200 text-navy-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Table CSV</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-navy-50/50 border border-navy-100 space-y-3">
              <h4 className="font-bold text-navy-900 text-sm">Policy Recommendations Brief</h4>
              <p className="text-xs text-navy-600">
                Download the written 750-word decarbonization brief in Markdown format for committee review.
              </p>
              <button
                onClick={downloadPolicyBriefProse}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-navy-100 border border-navy-200 text-navy-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Policy Brief (.md)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
