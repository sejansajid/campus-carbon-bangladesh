import React from 'react';
import { ArrowRight, Flame, Zap, Car, Eye, ChevronRight, BookOpen, ExternalLink } from 'lucide-react';
import { CampusIllustration } from './CampusIllustration';

interface HomepageProps {
  onStartAssessment: () => void;
  onViewExample?: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({
  onStartAssessment,
  onViewExample
}) => {
  return (
    <div className="space-y-12 pb-12 max-w-6xl mx-auto">
      {/* 1. Purpose-Led Hero */}
      <section className="pt-4 sm:pt-8 text-center space-y-5 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 border border-navy-200 text-xs font-semibold text-navy-800">
          <span className="w-2 h-2 rounded-full bg-cobalt"></span>
          Institutional Carbon Assessment for Higher Education
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-800 tracking-tight leading-[1.15]">
          Measure your university’s carbon footprint. <br className="hidden sm:inline" />
          Understand its sources. Plan practical reductions.
        </h1>

        <p className="text-lg sm:text-xl text-navy-600 max-w-2xl mx-auto leading-relaxed">
          Turn campus energy, transport and activity records into a clear emissions inventory and practical action plan.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStartAssessment}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-base shadow-sm hover:shadow transition inline-flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Start assessment</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <a
            href="https://doi.org/10.1109/ACCESS.2025.3605517"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 font-bold text-base shadow-2xs transition inline-flex items-center justify-center gap-2 cursor-pointer group"
          >
            <BookOpen className="w-4 h-4 text-cobalt group-hover:scale-110 transition-transform" />
            <span>Learn the methodology</span>
            <ExternalLink className="w-3.5 h-3.5 text-navy-400 group-hover:text-cobalt transition-colors" />
          </a>

          {onViewExample && (
            <button
              onClick={onViewExample}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200 font-bold text-base shadow-2xs transition inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-cobalt" />
              <span>See what your report will look like</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Visual 4-Step Assessment Walkthrough */}
      <section className="bg-white p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-navy-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-800">
              How It Works: From Data Collection to Institutional Action
            </h2>
            <p className="text-xs sm:text-sm text-navy-600">
              Four transparent steps to compute your campus greenhouse gas inventory and institutional brief.
            </p>
          </div>
          <span className="text-xs font-bold text-cobalt bg-cobalt-50 px-3 py-1 rounded-full">
            GHG Protocol Corporate Standard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-navy-50/40 border border-navy-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-cobalt text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500">Step 1</span>
            </div>
            <h3 className="font-bold text-navy-900 text-sm">
              Setup & Boundary
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Specify institution name, calendar reporting year, physical campus boundaries, and census population denominator.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-navy-50/40 border border-navy-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-cobalt text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500">Step 2</span>
            </div>
            <h3 className="font-bold text-navy-900 text-sm">
              Collect & Upload
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Use downloadable Google Forms blueprints & CSV templates across departments, or enter monthly utility bills and vehicle logs directly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-navy-50/40 border border-navy-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-cobalt text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500">Step 3</span>
            </div>
            <h3 className="font-bold text-navy-900 text-sm">
              Calculate Emissions
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Deterministic GHG Protocol & IPCC AR6 formulas compute exact Scope 1, 2, and 3 tCO₂e without silent zero-conversions.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-navy-50/40 border border-navy-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-cobalt text-white flex items-center justify-center font-bold text-xs">
                4
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500">Step 4</span>
            </div>
            <h3 className="font-bold text-navy-900 text-sm">
              Report & Decarbonize
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Explore interactive hotspot rankings, generate evidence-backed policy briefs, and export high-res figures and reports for leadership.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Compact Reporting Interface Preview (ULAB 2022 Benchmark) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-navy-50 text-[11px] font-semibold text-navy-700 mb-1">
              <span>Peer-Reviewed Institutional Benchmark</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-navy-900">
              University of Liberal Arts Bangladesh (ULAB) — 2022
            </h2>
            <p className="text-xs text-navy-500">
              Permanent Campus, Mohammadpur, Dhaka • Calendar Year 2022 • GHG Protocol Operational Control (5,350 Headcount)
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://doi.org/10.1109/ACCESS.2025.3605517"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white hover:bg-navy-50 text-navy-700 border border-navy-200 font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cobalt" />
              <span>Learn the methodology</span>
              <ExternalLink className="w-3 h-3 text-navy-400" />
            </a>
            {onViewExample && (
              <button
                onClick={onViewExample}
                className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Explore full interactive report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-navy-50/60 border border-navy-100">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-navy-500 block">Total Footprint</span>
            <span className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">2,498.80</span>
            <span className="text-[11px] text-navy-600 block">tCO₂e / year</span>
          </div>
          <div className="p-4 rounded-2xl bg-navy-50/60 border border-navy-100">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-navy-500 block">Per Capita</span>
            <span className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">0.4671</span>
            <span className="text-[11px] text-navy-600 block">tCO₂e / person (5,350 headcount)</span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-800 block">Dominant Hotspot</span>
            <span className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight">Commuting</span>
            <span className="text-[11px] text-amber-700 block">1,302.10 tCO₂e (52.1%)</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800 block">Direct Operations</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight">742.55</span>
            <span className="text-[11px] text-emerald-700 block">tCO₂e Scope 1 (29.7%)</span>
          </div>
        </div>

        {/* Mini Scope Donut & Ranked Hotspots Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
          {/* Donut graphic */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-navy-50/30 rounded-2xl border border-navy-100">
            <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-2xs">
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="#E2E8F0" strokeWidth="24" />
              {/* Scope 1: 29.7% -> 131 of 440 */}
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="#F59E0B" strokeWidth="24" strokeDasharray="131 440" strokeDashoffset="0" />
              {/* Scope 2: 18.2% -> 80 of 440 */}
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="#2563EB" strokeWidth="24" strokeDasharray="80 440" strokeDashoffset="-131" />
              {/* Scope 3: 52.1% -> 229 of 440 */}
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="#7C3AED" strokeWidth="24" strokeDasharray="229 440" strokeDashoffset="-211" />
              <text x="100" y="93" textAnchor="middle" className="text-[11px] font-bold fill-navy-500 uppercase tracking-wider">Total</text>
              <text x="100" y="113" textAnchor="middle" className="text-base font-black fill-navy-900">2,498.8</text>
              <text x="100" y="127" textAnchor="middle" className="text-[10px] font-bold fill-navy-400">tCO₂e</text>
            </svg>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Scope 1 (29.7%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cobalt"></span>Scope 2 (18.2%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>Scope 3 (52.1%)</span>
            </div>
          </div>

          {/* Source Breakdown bars */}
          <div className="md:col-span-7 space-y-3">
            <div className="text-xs font-bold text-navy-800 flex items-center justify-between">
              <span>Top Emission Contributors</span>
              <span className="text-navy-400 font-normal">Ranked by tCO₂e (Paper Baseline)</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-navy-800">1. Student & Staff Commuting (Scope 3)</span>
                  <span className="font-bold text-purple-700">1,302.10 tCO₂e (52.1%)</span>
                </div>
                <div className="w-full bg-navy-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '52.1%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-navy-800">2. AC Fugitive Refrigerant Top-Ups (Scope 1)</span>
                  <span className="font-bold text-amber-700">626.23 tCO₂e (25.1%)</span>
                </div>
                <div className="w-full bg-navy-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '25.1%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-navy-800">3. Purchased Electricity / Grid (Scope 2)</span>
                  <span className="font-bold text-cobalt">454.14 tCO₂e (18.2%)</span>
                </div>
                <div className="w-full bg-navy-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-cobalt h-2.5 rounded-full" style={{ width: '18.2%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-navy-500 border-t border-navy-100">
              <span className="truncate">
                Peer-reviewed in <strong>IEEE Access (2025)</strong>: Hasan et al.
              </span>
              <a
                href="https://doi.org/10.1109/ACCESS.2025.3605517"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-cobalt hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Learn the methodology</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Scope Boundary Explorer */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-navy-100 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-800">
              Campus Emission Boundaries
            </h2>
            <p className="text-xs sm:text-sm text-navy-600">
              Select any source on campus to see how university activities map to international accounting scopes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span>Scope 1</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cobalt"></span>Scope 2</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-600"></span>Scope 3</span>
          </div>
        </div>

        <CampusIllustration />
      </section>

      {/* 5. Concise Overview of Scopes and Data Needed */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <Flame className="w-4 h-4" />
            <span>Scope 1: Direct Operations</span>
          </div>
          <p className="text-xs text-navy-600 leading-relaxed">
            Fuel used by university-controlled generators, official vehicle fleets, cafeteria cooking gas, and eligible AC refrigerant leakage.
          </p>
          <div className="text-[11px] text-navy-400 pt-1 border-t border-navy-50">
            <strong>Data needed:</strong> Fuel purchase invoices, vehicle logbooks, and HVAC maintenance records.
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-cobalt font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>Scope 2: Purchased Electricity</span>
          </div>
          <p className="text-xs text-navy-600 leading-relaxed">
            Emissions associated with utility electricity consumed by academic buildings, computer labs, and campus facilities.
          </p>
          <div className="text-[11px] text-navy-400 pt-1 border-t border-navy-50">
            <strong>Data needed:</strong> 12 monthly utility billing statements showing total kilowatt-hours (kWh).
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <Car className="w-4 h-4" />
            <span>Scope 3: Commuting & Value Chain</span>
          </div>
          <p className="text-xs text-navy-600 leading-relaxed">
            Daily passenger travel by students, faculty, and administrative staff, along with upstream electrical transmission losses.
          </p>
          <div className="text-[11px] text-navy-400 pt-1 border-t border-navy-50">
            <strong>Data needed:</strong> Sample commuter travel survey (modes, distances, and weekly campus attendance).
          </div>
        </div>
      </section>
    </div>
  );
};
