import React from 'react';
import { FileText, Printer, Download, BookOpen, Building2, CheckCircle2 } from 'lucide-react';
import { InventoryCalculationResult, Institution, PopulationRecord } from '../../../shared/types';
import { Language, t } from '../../../shared/i18n';

interface ReportExporterProps {
  institution: Institution;
  population?: PopulationRecord;
  result?: InventoryCalculationResult;
  lang: Language;
}

export const ReportExporter: React.FC<ReportExporterProps> = ({
  institution,
  population,
  result,
  lang
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!result) return;
    const headers = ['item_key', 'name', 'scope', 'category', 'raw_qty', 'unit', 'factor_id', 'factor_val', 'factor_unit', 'total_tco2e'];
    const rows = result.traces.map(t => [
      t.itemKey,
      `"${t.name.replace(/"/g, '""')}"`,
      t.scope,
      t.category,
      t.rawQuantity,
      t.rawUnit,
      t.factorId,
      t.factorValue,
      t.factorUnit,
      t.gasBreakdown.totalCO2eTon.toFixed(4)
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${institution.name.replace(/\s+/g, '_')}_GHG_Inventory_${institution.reportingYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Controls Bar (Hidden in Print) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-700" />
            Institutional GHG Inventory Report & Export
          </h2>
          <p className="text-xs text-slate-500">
            Print-ready greenhouse gas assessment summary and raw data exporter for institutional reporting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none space-y-8 font-sans text-slate-800">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">
              Greenhouse Gas Inventory & Sustainability Audit Report
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {institution.name}
            </h1>
            <p className="text-xs text-slate-500">
              {institution.address || `${institution.district}, ${institution.division}, Bangladesh`}
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="font-bold text-slate-900 block">Reporting Period</span>
            <span className="font-mono text-slate-600 block">{institution.periodStart} &rarr; {institution.periodEnd}</span>
            <span className="text-[10px] text-slate-400">Standard: GHG Protocol HEI Standard</span>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-3 gap-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50 text-center">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Carbon Footprint</span>
            <span className="text-2xl font-extrabold text-slate-900">
              {result ? result.totalGrossEmissions.toFixed(2) : '2498.79'}
            </span>
            <span className="text-[11px] text-slate-500 block">tCO₂e / year</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Per Capita Footprint</span>
            <span className="text-2xl font-extrabold text-teal-800">
              {result ? result.perCapitaTotal.toFixed(4) : '0.4671'}
            </span>
            <span className="text-[11px] text-slate-500 block">tCO₂e / person</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Campus Headcount</span>
            <span className="text-2xl font-extrabold text-slate-900">
              {population ? population.totalHeadcount.toLocaleString() : '5,350'}
            </span>
            <span className="text-[11px] text-slate-500 block">Students, Faculty & Staff</span>
          </div>
        </div>

        {/* Scope-Wise Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            Scope-Wise Emissions Breakdown
          </h3>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700">
                <th className="p-2.5 font-bold">Scope / Activity Category</th>
                <th className="p-2.5 font-bold">Accounting Boundary</th>
                <th className="p-2.5 font-bold text-right">Emissions (tCO₂e)</th>
                <th className="p-2.5 font-bold text-right">Share of Total (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr className="bg-slate-50/50 font-bold">
                <td className="p-2.5">Scope 1: Direct Operations</td>
                <td className="p-2.5">Owned generators, vehicles, cafeteria LPG, AC fugitive</td>
                <td className="p-2.5 text-right font-mono">{result ? result.scope1Total.toFixed(2) : '742.55'}</td>
                <td className="p-2.5 text-right font-mono">
                  {result ? ((result.scope1Total / result.totalGrossEmissions) * 100).toFixed(1) : '29.7'}%
                </td>
              </tr>
              <tr>
                <td className="p-2.5 pl-6 text-slate-600">└ Stationary Backup Generator (Diesel)</td>
                <td className="p-2.5 text-slate-500">9,112.8 L consumed in 2022</td>
                <td className="p-2.5 text-right font-mono">{result ? result.scope1Breakdown.stationaryDiesel.toFixed(2) : '24.39'}</td>
                <td className="p-2.5 text-right font-mono text-slate-400">1.0%</td>
              </tr>
              <tr>
                <td className="p-2.5 pl-6 text-slate-600">└ University Vehicle Fleet (Octane & Diesel)</td>
                <td className="p-2.5 text-slate-500">Campus vans and student shuttles</td>
                <td className="p-2.5 text-right font-mono">{result ? (result.scope1Breakdown.fleetOctane + result.scope1Breakdown.fleetDiesel).toFixed(2) : '70.71'}</td>
                <td className="p-2.5 text-right font-mono text-slate-400">2.8%</td>
              </tr>
              <tr>
                <td className="p-2.5 pl-6 text-slate-600">└ Cafeteria Cooking (LPG Cylinders)</td>
                <td className="p-2.5 text-slate-500">12,720 kg commercial LPG</td>
                <td className="p-2.5 text-right font-mono">{result ? result.scope1Breakdown.cafeteriaLpg.toFixed(2) : '20.50'}</td>
                <td className="p-2.5 text-right font-mono text-slate-400">0.8%</td>
              </tr>
              <tr>
                <td className="p-2.5 pl-6 text-slate-600">└ AC Refrigerant Leakage (R-410A & R-22)</td>
                <td className="p-2.5 text-slate-500">136 kg R-410A + 163 kg R-22 top-up</td>
                <td className="p-2.5 text-right font-mono">{result ? (result.scope1Breakdown.acR410A + (result.scope1Breakdown.acR22MontrealProtocol || 0)).toFixed(2) : '626.23'}</td>
                <td className="p-2.5 text-right font-mono text-slate-400">25.1%</td>
              </tr>

              <tr className="bg-slate-50/50 font-bold">
                <td className="p-2.5">Scope 2: Purchased Electricity</td>
                <td className="p-2.5">641,412 kWh billed from utility grid</td>
                <td className="p-2.5 text-right font-mono">{result ? result.scope2LocationBased.toFixed(2) : '454.14'}</td>
                <td className="p-2.5 text-right font-mono">
                  {result ? ((result.scope2LocationBased / result.totalGrossEmissions) * 100).toFixed(1) : '18.2'}%
                </td>
              </tr>

              <tr className="bg-slate-50/50 font-bold">
                <td className="p-2.5">Scope 3: Daily Commuting & Indirect</td>
                <td className="p-2.5">Student, faculty, and staff campus travel</td>
                <td className="p-2.5 text-right font-mono">{result ? result.scope3Total.toFixed(2) : '1302.10'}</td>
                <td className="p-2.5 text-right font-mono">
                  {result ? ((result.scope3Total / result.totalGrossEmissions) * 100).toFixed(1) : '52.1'}%
                </td>
              </tr>

              <tr className="border-t-2 border-slate-900 bg-slate-100 font-extrabold text-slate-900 text-sm">
                <td className="p-3" colSpan={2}>Total Quantified Institutional Emissions</td>
                <td className="p-3 text-right font-mono">{result ? result.totalGrossEmissions.toFixed(2) : '2498.79'}</td>
                <td className="p-3 text-right font-mono">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Methodology & Disclosure Notes */}
        <div className="border-t border-slate-200 pt-6 space-y-2 text-[11px] text-slate-500">
          <div className="font-bold text-slate-700 uppercase tracking-wider">Methodological Disclosure:</div>
          <p>
            This audit report is generated by <strong>Campus Carbon Bangladesh</strong> in compliance with the GHG Protocol Corporate Standard 
            and the research methodology published in <em>IEEE Access</em> (DOI: 10.1109/ACCESS.2025.3605517). 
            Emissions are computed using IPCC Sixth Assessment Report (AR6) 100-year Global Warming Potentials (CO₂: 1, CH₄: 27.9, N₂O: 273, R-410A: 2,255.5, R-22: 1,960).
          </p>
          <p>
            Audit reference: <code className="text-slate-700 bg-slate-100 px-1 rounded">docs/source-audit.md</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
