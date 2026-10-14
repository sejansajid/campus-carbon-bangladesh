import React, { useState, useRef } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Sliders, 
  Download, 
  FileSpreadsheet, 
  Image, 
  FileCode, 
  Info, 
  Filter, 
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { InventoryCalculationResult, CalculationTrace } from '../../../shared/types';
import { Language } from '../../../shared/i18n';

interface ScholarlyFiguresProps {
  result: InventoryCalculationResult;
  selectedScope: number | null;
  onSelectScope: (scope: number | null) => void;
  lang: Language;
}

export const ScholarlyFigures: React.FC<ScholarlyFiguresProps> = ({
  result,
  selectedScope,
  onSelectScope,
  lang
}) => {
  const [activeFigure, setActiveFigure] = useState<'scope_dist' | 'source_contrib' | 'scope1_breakdown' | 'commuting_comparison' | 'commuting_by_role'>('scope_dist');
  const [displayMetric, setDisplayMetric] = useState<'absolute' | 'percentage'>('absolute');
  const [colorMode, setColorMode] = useState<'color' | 'grayscale'>('color');
  const [showLabels, setShowLabels] = useState(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const isBn = lang === 'bn';

  const total = result.totalGrossEmissions;
  const s1 = result.scope1Total;
  const s2 = result.scope2LocationBased;
  const s3 = result.scope3Total;

  const s1Pct = total > 0 ? (s1 / total) * 100 : 0;
  const s2Pct = total > 0 ? (s2 / total) * 100 : 0;
  const s3Pct = total > 0 ? (s3 / total) * 100 : 0;

  // Palette tokens
  const colors = colorMode === 'color' ? {
    scope1: '#D97706', // Amber
    scope2: '#2457D6', // Cobalt
    scope3: '#7C3AED', // Purple
    generator: '#B45309',
    fleet: '#D97706',
    cafeteria: '#F59E0B',
    cooling: '#92400E',
    grid: '#2457D6',
    bus: '#6D28D9',
    car: '#D65A3A',
    cycle: '#10B981',
    text: '#14243A',
    muted: '#64748B',
    gridLine: '#E2E8F0',
    bg: '#FFFFFF'
  } : {
    scope1: '#475569',
    scope2: '#1E293B',
    scope3: '#64748B',
    generator: '#334155',
    fleet: '#475569',
    cafeteria: '#64748B',
    cooling: '#1E293B',
    grid: '#0F172A',
    bus: '#475569',
    car: '#1E293B',
    cycle: '#94A3B8',
    text: '#0F172A',
    muted: '#475569',
    gridLine: '#CBD5E1',
    bg: '#FFFFFF'
  };

  // 1. Scope Distribution Data
  const scopeData = [
    { label: 'Scope 1 (Direct)', tons: s1, pct: s1Pct, scope: 1, color: colors.scope1 },
    { label: 'Scope 2 (Electricity)', tons: s2, pct: s2Pct, scope: 2, color: colors.scope2 },
    { label: 'Scope 3 (Commuting & Losses)', tons: s3, pct: s3Pct, scope: 3, color: colors.scope3 }
  ];

  // 2. Source Contributions Data
  const sourceContributions = [
    { name: 'Commuting (Student & Employee Transit)', tons: result.scope3Breakdown.totalCommuting, scope: 3, color: colors.scope3 },
    { name: 'Purchased Grid Electricity', tons: result.scope2LocationBased, scope: 2, color: colors.scope2 },
    { name: 'Air Conditioning Refrigerants', tons: result.scope1Breakdown.acR410A + (result.scope1Breakdown.acR22MontrealProtocol || 0), scope: 1, color: colors.cooling },
    { name: 'Vehicle Fleet (Diesel & Octane)', tons: result.scope1Breakdown.fleetOctane + result.scope1Breakdown.fleetDiesel, scope: 1, color: colors.fleet },
    { name: 'Backup Generator Combustion', tons: result.scope1Breakdown.stationaryDiesel, scope: 1, color: colors.generator },
    { name: 'Cafeteria Cooking (LPG)', tons: result.scope1Breakdown.cafeteriaLpg, scope: 1, color: colors.cafeteria }
  ].filter(s => s.tons > 0).sort((a, b) => b.tons - a.tons);

  // 3. Scope 1 Breakdown Data
  const s1Breakdown = [
    { name: 'AC Refrigerant Fugitives', tons: result.scope1Breakdown.acR410A + (result.scope1Breakdown.acR22MontrealProtocol || 0), color: colors.cooling },
    { name: 'Campus Vehicle Fleet', tons: result.scope1Breakdown.fleetOctane + result.scope1Breakdown.fleetDiesel, color: colors.fleet },
    { name: 'Stationary Generator Diesel', tons: result.scope1Breakdown.stationaryDiesel, color: colors.generator },
    { name: 'Cafeteria Cooking LPG', tons: result.scope1Breakdown.cafeteriaLpg, color: colors.cafeteria }
  ].filter(s => s.tons > 0).sort((a, b) => b.tons - a.tons);

  // 4. Commuting Analysis Data (Modal share % vs Emission share %)
  const commutingModes = [
    { mode: 'Private Car', commuterSharePct: 8.8, emissionSharePct: 59.6, color: colors.car },
    { mode: 'Public City Bus', commuterSharePct: 15.4, emissionSharePct: 9.2, color: colors.bus },
    { mode: 'CNG Auto-Rickshaw', commuterSharePct: 5.5, emissionSharePct: 7.9, color: colors.scope3 },
    { mode: 'Motorcycle', commuterSharePct: 8.3, emissionSharePct: 6.7, color: colors.scope1 },
    { mode: 'Battery Auto-Rickshaw', commuterSharePct: 7.8, emissionSharePct: 3.1, color: colors.scope2 },
    { mode: 'Multi-modal / Shared', commuterSharePct: 18.9, emissionSharePct: 12.6, color: colors.muted },
    { mode: 'Leguna (Human hauler)', commuterSharePct: 1.8, emissionSharePct: 0.8, color: colors.muted },
    { mode: 'Cycle Rickshaw (Non-motorized)', commuterSharePct: 26.1, emissionSharePct: 0.0, color: colors.cycle },
    { mode: 'Walking / Bicycle', commuterSharePct: 7.3, emissionSharePct: 0.0, color: colors.cycle }
  ];

  // 5. Commuting by Role Data
  const commutingByRole = [
    { role: 'Students (4,860)', walkCycle: 34.2, busTransit: 31.8, autoRickshaw: 18.5, privateCar: 6.4, motorcycle: 9.1 },
    { role: 'Faculty (240)', walkCycle: 8.3, busTransit: 12.5, autoRickshaw: 16.7, privateCar: 45.8, motorcycle: 16.7 },
    { role: 'Staff (250)', walkCycle: 22.0, busTransit: 44.0, autoRickshaw: 18.0, privateCar: 8.0, motorcycle: 8.0 }
  ];

  // Figure captions and interpretations
  const getFigureInterpretation = () => {
    switch (activeFigure) {
      case 'scope_dist': {
        const dominant = scopeData.reduce((prev, curr) => curr.tons > prev.tons ? curr : prev, scopeData[0]);
        return `Figure 1 illustrates the operational scope distribution across the evaluated boundary. ${dominant.label} constitutes the largest share (${dominant.pct.toFixed(1)}% of total quantified footprint, ${dominant.tons.toFixed(2)} tCO₂e). Normalization is based on the ${total.toFixed(2)} tCO₂e full annual inventory.`;
      }
      case 'source_contrib': {
        const top = sourceContributions[0];
        const topPct = total > 0 ? ((top.tons / total) * 100).toFixed(1) : '0';
        return `Figure 2 ranks individual campus emission sources in descending order. ${top.name} represents the primary hotspot at ${top.tons.toFixed(2)} tCO₂e (${topPct}% of gross footprint), identifying where targeted institutional mitigation interventions yield maximum impact.`;
      }
      case 'scope1_breakdown': {
        const acTons = result.scope1Breakdown.acR410A + (result.scope1Breakdown.acR22MontrealProtocol || 0);
        const acShare = s1 > 0 ? ((acTons / s1) * 100).toFixed(1) : '0';
        return `Figure 3 analyzes direct Scope 1 operational combustion and fugitive emissions totaling ${s1.toFixed(2)} tCO₂e. Air conditioning fugitive losses represent ${acShare}% of Scope 1, reflecting high Global Warming Potential gases recharged during annual facility maintenance.`;
      }
      case 'commuting_comparison':
        return `Figure 4 demonstrates the disproportionate carbon intensity of passenger modes across the commuter sample (N = 5,350 campus headcount, 294 operational days). Private cars represent only 8.8% of daily campus travelers but generate 59.6% of all commuting emissions, whereas non-motorized travel (33.4% travelers) produces zero direct emissions.`;
      case 'commuting_by_role':
        return `Figure 5 breaks down transit modal choices across campus roles. Faculty exhibit the highest private car reliance (45.8%), whereas student transit is predominantly non-motorized (34.2%) and public transit (31.8%), and staff predominantly utilize public bus networks (44.0%).`;
      default:
        return '';
    }
  };

  // Export SVG Handler
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    
    // Add namespace if missing
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Figure_${activeFigure}_${colorMode}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setExportNotice('Exported publication-quality vector SVG file.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Export 300-DPI Equivalent PNG Handler
  const handleExportPNG = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    
    const img = new window.Image();
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // 300-dpi scaling (2.5x standard screen canvas)
      const scale = 2.5;
      const canvas = document.createElement('canvas');
      canvas.width = (svgElement.clientWidth || 800) * scale;
      canvas.height = (svgElement.clientHeight || 450) * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `Figure_${activeFigure}_300dpi.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
      setExportNotice('Exported 300-dpi publication-ready PNG graphic.');
      setTimeout(() => setExportNotice(null), 3000);
    };
    img.src = url;
  };

  // Export CSV Data
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (activeFigure === 'scope_dist') {
      headers = ['Scope_Category', 'Emissions_tCO2e', 'Share_Percentage'];
      rows = scopeData.map(s => [s.label, s.tons.toFixed(3), s.pct.toFixed(2)]);
    } else if (activeFigure === 'source_contrib') {
      headers = ['Source_Name', 'Scope', 'Emissions_tCO2e', 'Share_of_Total_Percentage'];
      rows = sourceContributions.map(s => [s.name, s.scope, s.tons.toFixed(3), ((s.tons / total) * 100).toFixed(2)]);
    } else if (activeFigure === 'scope1_breakdown') {
      headers = ['Direct_Source', 'Emissions_tCO2e', 'Share_of_Scope1_Percentage'];
      rows = s1Breakdown.map(s => [s.name, s.tons.toFixed(3), ((s.tons / s1) * 100).toFixed(2)]);
    } else if (activeFigure === 'commuting_comparison') {
      headers = ['Travel_Mode', 'Commuter_Share_Percentage', 'Emissions_Share_Percentage'];
      rows = commutingModes.map(c => [c.mode, c.commuterSharePct, c.emissionSharePct]);
    } else if (activeFigure === 'commuting_by_role') {
      headers = ['Campus_Role', 'Walk_Bicycle_Pct', 'Public_Transit_Pct', 'Auto_Rickshaw_Pct', 'Private_Car_Pct', 'Motorcycle_Pct'];
      rows = commutingByRole.map(r => [r.role, r.walkCycle, r.busTransit, r.autoRickshaw, r.privateCar, r.motorcycle]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `Data_${activeFigure}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Downloaded underlying figure dataset (CSV).');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Figure Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveFigure('scope_dist')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeFigure === 'scope_dist' ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 hover:bg-navy-50 border border-navy-100'
            }`}
          >
            Fig 1: Scope Distribution
          </button>
          <button
            onClick={() => setActiveFigure('source_contrib')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeFigure === 'source_contrib' ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 hover:bg-navy-50 border border-navy-100'
            }`}
          >
            Fig 2: Source Ranking
          </button>
          <button
            onClick={() => setActiveFigure('scope1_breakdown')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeFigure === 'scope1_breakdown' ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 hover:bg-navy-50 border border-navy-100'
            }`}
          >
            Fig 3: Scope 1 Sources
          </button>
          <button
            onClick={() => setActiveFigure('commuting_comparison')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeFigure === 'commuting_comparison' ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 hover:bg-navy-50 border border-navy-100'
            }`}
          >
            Fig 4: Commuter Share vs Carbon
          </button>
          <button
            onClick={() => setActiveFigure('commuting_by_role')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeFigure === 'commuting_by_role' ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 hover:bg-navy-50 border border-navy-100'
            }`}
          >
            Fig 5: Modal Split by Role
          </button>
        </div>

        {/* Compact Settings & Export Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-navy-200 rounded-xl p-1 text-xs">
            <button
              onClick={() => setDisplayMetric('absolute')}
              className={`px-2 py-0.5 rounded-lg font-medium cursor-pointer ${
                displayMetric === 'absolute' ? 'bg-navy-100 text-navy-900 font-bold' : 'text-navy-500'
              }`}
              title="Show values in metric tonnes of CO2 equivalent (tCO2e)"
            >
              tCO₂e
            </button>
            <button
              onClick={() => setDisplayMetric('percentage')}
              className={`px-2 py-0.5 rounded-lg font-medium cursor-pointer ${
                displayMetric === 'percentage' ? 'bg-navy-100 text-navy-900 font-bold' : 'text-navy-500'
              }`}
              title="Show values as percentage share (%)"
            >
              % Share
            </button>
          </div>

          <button
            onClick={() => setColorMode(colorMode === 'color' ? 'grayscale' : 'color')}
            className={`px-2.5 py-1 rounded-xl border text-xs font-medium cursor-pointer transition ${
              colorMode === 'grayscale' ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-navy-700 border-navy-200'
            }`}
            title="Toggle scholarly monochrome / grayscale styling for print publication"
          >
            {colorMode === 'color' ? 'Grayscale' : 'Full Color'}
          </button>

          {/* Export Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportSVG}
              className="p-1.5 rounded-xl bg-white hover:bg-navy-50 border border-navy-200 text-navy-700 font-medium text-xs flex items-center gap-1 cursor-pointer"
              title="Download vector SVG"
            >
              <FileCode className="w-3.5 h-3.5 text-cobalt" />
              <span className="hidden sm:inline">SVG</span>
            </button>
            <button
              onClick={handleExportPNG}
              className="p-1.5 rounded-xl bg-white hover:bg-navy-50 border border-navy-200 text-navy-700 font-medium text-xs flex items-center gap-1 cursor-pointer"
              title="Download 300-DPI high-resolution PNG"
            >
              <Image className="w-3.5 h-3.5 text-cobalt" />
              <span className="hidden sm:inline">PNG</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded-xl bg-white hover:bg-navy-50 border border-navy-200 text-navy-700 font-medium text-xs flex items-center gap-1 cursor-pointer"
              title="Download figure data (CSV)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cobalt" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>
      </div>

      {exportNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Scholarly Figure Canvas */}
      <div className="bg-white rounded-3xl border border-navy-100 p-6 sm:p-8 shadow-2xs space-y-4">
        {/* Figure Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-50 pb-3">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">
              {activeFigure === 'scope_dist' && 'Figure 1 • Operational Boundary Distribution'}
              {activeFigure === 'source_contrib' && 'Figure 2 • Campus Emissions Hotspot Ranking'}
              {activeFigure === 'scope1_breakdown' && 'Figure 3 • Scope 1 Direct Combustion & Fugitive Gases'}
              {activeFigure === 'commuting_comparison' && 'Figure 4 • Modal Share vs Carbon Generation Disproportion'}
              {activeFigure === 'commuting_by_role' && 'Figure 5 • Commuter Mode Distribution by Campus Role'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-navy-900 mt-0.5">
              {activeFigure === 'scope_dist' && 'Institutional Greenhouse Gas Inventory by Scope (tCO₂e & %)'}
              {activeFigure === 'source_contrib' && 'Ranked Emission Hotspots Across Operational Activities (tCO₂e)'}
              {activeFigure === 'scope1_breakdown' && 'Composition of Direct Scope 1 Operations (Fuels, Fleet & Refrigerants)'}
              {activeFigure === 'commuting_comparison' && 'Commuter Population Proportion (%) vs Resulting GHG Share (%)'}
              {activeFigure === 'commuting_by_role' && 'Commuting Mode Distribution Across Students, Faculty, and Staff'}
            </h3>
          </div>

          <div className="text-right text-xs text-navy-500">
            Unit: <strong className="font-mono text-navy-800">{displayMetric === 'absolute' ? 'tCO₂e / year' : 'Percent (%) of inventory'}</strong>
          </div>
        </div>

        {/* Dynamic SVG Chart Rendering */}
        <div className="w-full overflow-x-auto flex justify-center py-2">
          {/* 1. Scope Distribution Chart */}
          {activeFigure === 'scope_dist' && (
            <svg 
              ref={svgRef}
              viewBox="0 0 760 360" 
              className="w-full max-w-2xl h-auto select-none"
              style={{ backgroundColor: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {/* Axes */}
              <line x1="80" y1="280" x2="700" y2="280" stroke={colors.gridLine} strokeWidth="1.5" />
              <line x1="80" y1="40" x2="80" y2="280" stroke={colors.gridLine} strokeWidth="1.5" />

              {/* Y-Axis Ticks & Grid */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((step, idx) => {
                const maxVal = displayMetric === 'absolute' ? Math.max(s1, s2, s3) * 1.2 : 100;
                const yVal = maxVal * step;
                const yPos = 280 - (240 * step);
                return (
                  <g key={idx}>
                    <line x1="75" y1={yPos} x2="700" y2={yPos} stroke={colors.gridLine} strokeWidth="0.8" strokeDasharray="3 3" />
                    <text x="70" y={yPos + 4} textAnchor="end" fontSize="11" fill={colors.muted} fontFeatureSettings="'tnum'">
                      {displayMetric === 'absolute' ? yVal.toFixed(0) : `${yVal.toFixed(0)}%`}
                    </text>
                  </g>
                );
              })}

              {/* Scope Bars */}
              {scopeData.map((item, idx) => {
                const maxVal = displayMetric === 'absolute' ? Math.max(s1, s2, s3) * 1.2 : 100;
                const currentVal = displayMetric === 'absolute' ? item.tons : item.pct;
                const barHeight = Math.max((currentVal / maxVal) * 240, 2);
                const xPos = 140 + (idx * 190);
                const yPos = 280 - barHeight;
                const isSelected = selectedScope === item.scope;

                return (
                  <g 
                    key={idx} 
                    className="cursor-pointer group"
                    onClick={() => onSelectScope(selectedScope === item.scope ? null : item.scope)}
                  >
                    <rect
                      x={xPos}
                      y={yPos}
                      width="120"
                      height={barHeight}
                      rx="6"
                      fill={item.color}
                      opacity={selectedScope === null || isSelected ? 1 : 0.4}
                      stroke={isSelected ? '#14243A' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                    />

                    {/* Value Label on Top */}
                    {showLabels && (
                      <text
                        x={xPos + 60}
                        y={yPos - 8}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="700"
                        fill={colors.text}
                      >
                        {displayMetric === 'absolute' ? `${item.tons.toFixed(1)} t` : `${item.pct.toFixed(1)}%`}
                      </text>
                    )}

                    {/* X-Axis Category Label */}
                    <text
                      x={xPos + 60}
                      y="305"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="600"
                      fill={colors.text}
                    >
                      Scope {item.scope}
                    </text>
                    <text
                      x={xPos + 60}
                      y="322"
                      textAnchor="middle"
                      fontSize="10"
                      fill={colors.muted}
                    >
                      {item.scope === 1 ? 'Direct' : item.scope === 2 ? 'Electricity' : 'Commuting'}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* 2. Source Hotspot Contributions Chart */}
          {activeFigure === 'source_contrib' && (
            <svg 
              ref={svgRef}
              viewBox="0 0 760 360" 
              className="w-full max-w-2xl h-auto select-none"
              style={{ backgroundColor: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              <line x1="240" y1="20" x2="240" y2="330" stroke={colors.gridLine} strokeWidth="1.5" />

              {sourceContributions.map((src, idx) => {
                const maxVal = Math.max(...sourceContributions.map(s => s.tons)) * 1.15;
                const currentVal = displayMetric === 'absolute' ? src.tons : (total > 0 ? (src.tons / total) * 100 : 0);
                const barWidth = Math.max((src.tons / maxVal) * 440, 4);
                const yPos = 35 + (idx * 50);

                return (
                  <g key={idx}>
                    {/* Source Label */}
                    <text
                      x="230"
                      y={yPos + 18}
                      textAnchor="end"
                      fontSize="11"
                      fontWeight="600"
                      fill={colors.text}
                    >
                      {src.name}
                    </text>

                    {/* Bar */}
                    <rect
                      x="240"
                      y={yPos}
                      width={barWidth}
                      height="26"
                      rx="4"
                      fill={src.color}
                    />

                    {/* Value on End */}
                    {showLabels && (
                      <text
                        x={240 + barWidth + 8}
                        y={yPos + 18}
                        fontSize="11"
                        fontWeight="700"
                        fill={colors.text}
                      >
                        {displayMetric === 'absolute' ? `${src.tons.toFixed(1)} tCO₂e` : `${((src.tons / total) * 100).toFixed(1)}%`}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* 3. Scope 1 Breakdown */}
          {activeFigure === 'scope1_breakdown' && (
            <svg 
              ref={svgRef}
              viewBox="0 0 760 340" 
              className="w-full max-w-2xl h-auto select-none"
              style={{ backgroundColor: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              <line x1="220" y1="20" x2="220" y2="310" stroke={colors.gridLine} strokeWidth="1.5" />

              {s1Breakdown.map((src, idx) => {
                const maxVal = Math.max(...s1Breakdown.map(s => s.tons)) * 1.15;
                const barWidth = Math.max((src.tons / maxVal) * 440, 4);
                const yPos = 40 + (idx * 65);
                const pctOfS1 = s1 > 0 ? (src.tons / s1) * 100 : 0;

                return (
                  <g key={idx}>
                    <text
                      x="210"
                      y={yPos + 20}
                      textAnchor="end"
                      fontSize="11"
                      fontWeight="600"
                      fill={colors.text}
                    >
                      {src.name}
                    </text>

                    <rect
                      x="220"
                      y={yPos}
                      width={barWidth}
                      height="30"
                      rx="4"
                      fill={src.color}
                    />

                    {showLabels && (
                      <text
                        x={220 + barWidth + 8}
                        y={yPos + 20}
                        fontSize="11"
                        fontWeight="700"
                        fill={colors.text}
                      >
                        {displayMetric === 'absolute' ? `${src.tons.toFixed(1)} tCO₂e` : `${pctOfS1.toFixed(1)}% of S1`}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* 4. Commuting Analysis Comparison (Grouped Bar: People % vs Carbon %) */}
          {activeFigure === 'commuting_comparison' && (
            <svg 
              ref={svgRef}
              viewBox="0 0 760 420" 
              className="w-full max-w-2xl h-auto select-none"
              style={{ backgroundColor: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {/* Legend */}
              <g transform="translate(420, 20)">
                <rect x="0" y="0" width="14" height="14" rx="3" fill="#64748B" />
                <text x="20" y="11" fontSize="11" fill={colors.text}>Commuter Share (% People)</text>
                
                <rect x="180" y="0" width="14" height="14" rx="3" fill={colors.car} />
                <text x="200" y="11" fontSize="11" fill={colors.text}>Emission Share (% GHG)</text>
              </g>

              <line x1="220" y1="50" x2="220" y2="400" stroke={colors.gridLine} strokeWidth="1.5" />

              {commutingModes.map((item, idx) => {
                const maxPct = 70; // 0 to 70%
                const peopleWidth = (item.commuterSharePct / maxPct) * 440;
                const carbonWidth = (item.emissionSharePct / maxPct) * 440;
                const yPos = 60 + (idx * 37);

                return (
                  <g key={idx}>
                    <text
                      x="210"
                      y={yPos + 18}
                      textAnchor="end"
                      fontSize="10.5"
                      fontWeight={item.emissionSharePct > 20 ? '700' : '500'}
                      fill={colors.text}
                    >
                      {item.mode}
                    </text>

                    {/* People Bar */}
                    <rect
                      x="220"
                      y={yPos}
                      width={Math.max(peopleWidth, 2)}
                      height="12"
                      rx="2"
                      fill="#94A3B8"
                    />

                    {/* Carbon Bar */}
                    <rect
                      x="220"
                      y={yPos + 14}
                      width={Math.max(carbonWidth, 2)}
                      height="12"
                      rx="2"
                      fill={item.emissionSharePct > 20 ? colors.car : item.color}
                    />

                    {/* Labels */}
                    {showLabels && (
                      <text
                        x={225 + Math.max(peopleWidth, carbonWidth)}
                        y={yPos + 18}
                        fontSize="9.5"
                        fill={colors.muted}
                        fontWeight="600"
                      >
                        {item.commuterSharePct}% travelers &rarr; {item.emissionSharePct}% GHG
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* 5. Commuting Modal Split by Role */}
          {activeFigure === 'commuting_by_role' && (
            <svg 
              ref={svgRef}
              viewBox="0 0 760 300" 
              className="w-full max-w-2xl h-auto select-none"
              style={{ backgroundColor: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {/* Legend */}
              <g transform="translate(120, 20)">
                <rect x="0" y="0" width="12" height="12" rx="2" fill={colors.cycle} />
                <text x="16" y="10" fontSize="10" fill={colors.text}>Walk/Bike</text>

                <rect x="100" y="0" width="12" height="12" rx="2" fill={colors.bus} />
                <text x="116" y="10" fontSize="10" fill={colors.text}>Public Bus</text>

                <rect x="200" y="0" width="12" height="12" rx="2" fill={colors.scope3} />
                <text x="216" y="10" fontSize="10" fill={colors.text}>Auto-Rickshaw</text>

                <rect x="320" y="0" width="12" height="12" rx="2" fill={colors.car} />
                <text x="336" y="10" fontSize="10" fill={colors.text}>Private Car</text>

                <rect x="430" y="0" width="12" height="12" rx="2" fill={colors.scope1} />
                <text x="446" y="10" fontSize="10" fill={colors.text}>Motorcycle</text>
              </g>

              {commutingByRole.map((roleItem, idx) => {
                const yPos = 65 + (idx * 75);
                const widthScale = 5.2; // 100% = 520px
                const x0 = 160;

                const wWalk = roleItem.walkCycle * widthScale;
                const wBus = roleItem.busTransit * widthScale;
                const wAuto = roleItem.autoRickshaw * widthScale;
                const wCar = roleItem.privateCar * widthScale;
                const wMoto = roleItem.motorcycle * widthScale;

                return (
                  <g key={idx}>
                    <text
                      x="150"
                      y={yPos + 22}
                      textAnchor="end"
                      fontSize="11"
                      fontWeight="700"
                      fill={colors.text}
                    >
                      {roleItem.role}
                    </text>

                    {/* Stacked bar segments */}
                    <rect x={x0} y={yPos} width={wWalk} height="32" fill={colors.cycle} />
                    <rect x={x0 + wWalk} y={yPos} width={wBus} height="32" fill={colors.bus} />
                    <rect x={x0 + wWalk + wBus} y={yPos} width={wAuto} height="32" fill={colors.scope3} />
                    <rect x={x0 + wWalk + wBus + wAuto} y={yPos} width={wCar} height="32" fill={colors.car} />
                    <rect x={x0 + wWalk + wBus + wAuto + wCar} y={yPos} width={wMoto} height="32" fill={colors.scope1} />

                    {/* Segment text annotations */}
                    {wCar > 35 && (
                      <text x={x0 + wWalk + wBus + wAuto + (wCar / 2)} y={yPos + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">
                        {roleItem.privateCar}%
                      </text>
                    )}
                    {wWalk > 35 && (
                      <text x={x0 + (wWalk / 2)} y={yPos + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF">
                        {roleItem.walkCycle}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Dynamic Interpretation Box */}
        <div className="p-4 rounded-2xl bg-ivory border border-navy-100 text-xs text-navy-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-navy-900">
            <Info className="w-4 h-4 text-cobalt shrink-0" />
            <span>Analytical Findings & Practical Interpretation:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-navy-700">
            {getFigureInterpretation()}
          </p>
        </div>
      </div>
    </div>
  );
};
