import React, { useState } from 'react';
import { GitCompare, AlertTriangle, CheckCircle2, BookOpen, ShieldAlert, Users, ExternalLink, Info } from 'lucide-react';
interface FairComparisonProps {
  currentInstitutionName: string;
  currentPerCapita: number;
}

export const FairComparison: React.FC<FairComparisonProps> = ({
  currentInstitutionName,
  currentPerCapita
}) => {
  const [activeTab, setActiveTab] = useState<'literature' | 'guidelines'>('literature');
  const [sortBy, setSortBy] = useState<'perCapita' | 'name' | 'publishingYear'>('perCapita');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);

  const literatureStudies = [
    {
      name: 'The American University of Sharjah',
      location: 'Sharjah, UAE',
      studyYear: '2018-2019',
      publishingYear: 2022,
      perCapita: 15.70,
      scopeCoverage: 'Scopes 1, 2, 3 (Full Campus)',
      reference: 'DOI: 10.1016/j.jclepro.2021.130283',
      compatibilityStatus: 'incompatible',
      badgeLabel: 'Different climate & energy profile',
      compatibilityReason: 'Desert climate requiring continuous high-capacity chiller cooling, on-site energy cogeneration, and energy-intensive desalinated water infrastructure.'
    },
    {
      name: 'University of Oulu',
      location: 'Oulu, Finland',
      studyYear: '2019',
      publishingYear: 2023,
      perCapita: 1.129,
      scopeCoverage: 'Comprehensive Scope 1, 2, 3 (Goods & Services)',
      reference: 'DOI: 10.1016/j.jclepro.2023.136224',
      compatibilityStatus: 'partially_compatible',
      badgeLabel: 'Different emission coverage',
      compatibilityReason: 'Sub-arctic district heating systems and comprehensive supply chain procurement included; wider Scope 3 boundary than commuting-only.'
    },
    {
      name: 'NED University of Engineering & Tech',
      location: 'Karachi, Pakistan',
      studyYear: '2017',
      publishingYear: 2021,
      perCapita: 1.79,
      scopeCoverage: 'Scopes 1, 2, 3 (Commuting)',
      reference: 'DOI: 10.1007/s10668-020-00849-1',
      compatibilityStatus: 'moderately_compatible',
      badgeLabel: 'Moderately comparable',
      compatibilityReason: 'South Asian urban commuter campus with comparable regional climate, public transit reliance, and private vehicle split.'
    },
    {
      name: 'Universitat Jaume I',
      location: 'Castellón, Spain',
      studyYear: '2019',
      publishingYear: 2022,
      perCapita: 0.30,
      scopeCoverage: 'Scopes 1, 2, 3',
      reference: 'DOI: 10.1016/j.jclepro.2022.131589',
      compatibilityStatus: 'moderately_compatible',
      badgeLabel: 'Different transit infrastructure',
      compatibilityReason: 'Compact Mediterranean campus with very high non-motorized and cycling commuter modal share.'
    },
    {
      name: 'Bournemouth University',
      location: 'Poole, England',
      studyYear: 'April - June 2020 (3 Months)',
      publishingYear: 2021,
      perCapita: 0.16,
      scopeCoverage: '3-Month Lockdown Period',
      reference: 'DOI: 10.1016/j.jclepro.2021.127889',
      compatibilityStatus: 'incompatible',
      badgeLabel: 'Different reporting period',
      compatibilityReason: 'Measured exclusively during a 3-month COVID-19 national lockdown quarter with campus closed. Cannot be compared with full 12-month academic operational years.'
    },
    {
      name: 'Universidad Tecnológica de Pereira',
      location: 'Pereira, Colombia',
      studyYear: '2017',
      publishingYear: 2021,
      perCapita: 0.40,
      scopeCoverage: 'Scopes 1, 2, 3 (Commuting)',
      reference: 'DOI: 10.1016/j.jclepro.2020.124505',
      compatibilityStatus: 'compatible',
      badgeLabel: 'Comparable urban commuter campus',
      compatibilityReason: 'Tropical commuter institution with comparable floor space per student, transit modal split, and non-residential student body.'
    },
    {
      name: 'Universidad Nacional de Colombia',
      location: 'Bogotá, Colombia',
      studyYear: '2019',
      publishingYear: 2023,
      perCapita: 0.432,
      scopeCoverage: 'Scopes 1, 2, 3',
      reference: 'DOI: 10.1016/j.jclepro.2023.137890',
      compatibilityStatus: 'compatible',
      badgeLabel: 'Comparable urban campus',
      compatibilityReason: 'High-density urban Latin American campus with similar student-to-faculty ratios and public transit dependence.'
    },
    {
      name: 'Universitas Pertamina',
      location: 'Jakarta, Indonesia',
      studyYear: '2017-2018',
      publishingYear: 2020,
      perCapita: 0.52,
      scopeCoverage: 'Scopes 1, 2, 3',
      reference: 'IOP Conf. Ser.: Earth Environ. Sci. 489',
      compatibilityStatus: 'compatible',
      badgeLabel: 'Comparable tropical commuter campus',
      compatibilityReason: 'Humid tropical Southeast Asian commuter university with motorcycle, minibus, and transit commuter distribution.'
    }
  ];

  const sortedStudies = [...literatureStudies].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'perCapita') cmp = a.perCapita - b.perCapita;
    else if (sortBy === 'publishingYear') cmp = a.publishingYear - b.publishingYear;
    else cmp = a.name.localeCompare(b.name);
    return sortAsc ? cmp : -cmp;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold">
          <GitCompare className="w-3.5 h-3.5 text-cobalt" />
          <span>Compare universities</span>
        </div>
        <h1 className="text-2xl font-bold text-navy-800">
          Academic Literature Benchmarks
        </h1>
        <p className="text-sm text-navy-600 leading-relaxed max-w-3xl">
          For a fair comparison, choose universities with similar reporting periods and emission coverage.
        </p>
      </div>

      {/* Fair Comparison Guidance Banner */}
      <div className="bg-ivory rounded-2xl p-5 border border-navy-200 space-y-2 text-xs text-navy-800">
        <div className="flex items-center gap-2 font-bold text-sm text-navy-900">
          <Info className="w-4 h-4 text-cobalt" />
          <span>About fair comparisons</span>
        </div>
        <p className="text-navy-600 leading-relaxed text-xs">
          Higher education institutions differ vastly in geographic climate, student residential housing, laboratory intensity, and reporting boundaries. Comparisons must account for:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px]">
          <div className="p-2.5 rounded-lg bg-white border border-navy-100">
            <strong>Reporting Duration:</strong> A 3-month lockdown interval cannot be compared with full 12-month annual academic operations.
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-navy-100">
            <strong>Emission Coverage:</strong> A commuting-only Scope 3 inventory cannot be directly ranked against comprehensive procurement and flight accounting.
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-navy-100">
            <strong>Campus Morphology:</strong> Highly residential campuses with dormitories naturally exhibit different per-capita energy demands than urban commuter universities.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-navy-100 pb-1">
        <button
          onClick={() => setActiveTab('literature')}
          className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'literature'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          Published Literature Benchmarks
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'guidelines'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          Comparability Criteria
        </button>
      </div>

      {/* Tab 1: Literature Table & Comparison Cards */}
      {activeTab === 'literature' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-navy-700">
              {literatureStudies.length} peer-reviewed studies recorded
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-navy-500">Sort by:</span>
              <button
                onClick={() => {
                  if (sortBy === 'perCapita') setSortAsc(!sortAsc);
                  else { setSortBy('perCapita'); setSortAsc(true); }
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                  sortBy === 'perCapita' ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-navy-700 border-navy-200'
                }`}
              >
                Per Capita {sortBy === 'perCapita' ? (sortAsc ? '↑' : '↓') : ''}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'publishingYear') setSortAsc(!sortAsc);
                  else { setSortBy('publishingYear'); setSortAsc(false); }
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                  sortBy === 'publishingYear' ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-navy-700 border-navy-200'
                }`}
              >
                Year {sortBy === 'publishingYear' ? (sortAsc ? '↑' : '↓') : ''}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedStudies.map((study, idx) => {
              const isCompatible = study.compatibilityStatus === 'compatible';
              const isIncompat = study.compatibilityStatus === 'incompatible';

              return (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border bg-white shadow-2xs space-y-3 transition ${
                    isIncompat ? 'border-coral-200 bg-coral-50/20' : isCompatible ? 'border-navy-200 hover:border-cobalt-300' : 'border-navy-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-navy-900">{study.name}</h4>
                      <span className="text-xs text-navy-500">{study.location} • Reporting: {study.studyYear}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl font-extrabold text-navy-900 tabular-nums">
                        {study.perCapita.toFixed(2)} <span className="text-xs font-normal text-navy-500">t/person</span>
                      </div>
                      <span className="text-[10px] text-navy-400">Published: {study.publishingYear}</span>
                    </div>
                  </div>

                  {/* Compatibility Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isCompatible 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : isIncompat 
                        ? 'bg-coral-50 text-coral-800 border-coral-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {study.badgeLabel}
                    </span>
                    <span className="text-[11px] text-navy-400">{study.scopeCoverage}</span>
                  </div>

                  <p className="text-[11px] text-navy-600 bg-navy-50/60 p-2.5 rounded-xl border border-navy-100 leading-relaxed">
                    {study.compatibilityReason}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-navy-500 pt-1">
                    <span className="font-mono text-[10px] text-navy-400">{study.reference}</span>
                    <button
                      onClick={() => setSelectedStudy(study)}
                      className="text-cobalt hover:underline font-semibold cursor-pointer"
                    >
                      View details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal / Drawer for Details */}
          {selectedStudy && (
            <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-navy-200 shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-navy-900">{selectedStudy.name}</h3>
                    <p className="text-xs text-navy-500">{selectedStudy.location} • Reporting period: {selectedStudy.studyYear}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStudy(null)}
                    className="w-7 h-7 rounded-full bg-navy-100 hover:bg-navy-200 flex items-center justify-center text-navy-700 font-bold text-sm cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-2 text-xs text-navy-700">
                  <div className="flex justify-between py-1 border-b border-navy-50">
                    <span className="text-navy-500">Per capita emissions:</span>
                    <span className="font-bold font-mono text-navy-900">{selectedStudy.perCapita.toFixed(4)} tCO₂e / person</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-navy-50">
                    <span className="text-navy-500">Scope coverage:</span>
                    <span className="font-medium text-navy-900">{selectedStudy.scopeCoverage}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-navy-50">
                    <span className="text-navy-500">Comparability badge:</span>
                    <span className="font-semibold text-navy-900">{selectedStudy.badgeLabel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-navy-50">
                    <span className="text-navy-500">Citation:</span>
                    <span className="font-mono text-cobalt">{selectedStudy.reference}</span>
                  </div>
                  <div className="pt-2">
                    <span className="font-semibold text-navy-800 block mb-1">Methodological context:</span>
                    <p className="text-[11px] leading-relaxed text-navy-600 bg-ivory p-3 rounded-xl border border-navy-100">
                      {selectedStudy.compatibilityReason}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudy(null)}
                  className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4 text-xs text-navy-700">
          <h3 className="font-bold text-base text-navy-900">Institutional Comparability Criteria</h3>
          <p className="leading-relaxed">
            The platform applies four deterministic criteria before permitting cross-institutional emission comparisons:
          </p>

          <ol className="list-decimal pl-5 space-y-2 text-[11px] text-navy-600">
            <li><strong>Temporal Symmetry:</strong> Both institutions must report full 12-month operational data. Partial calendar quarters or short academic terms cannot be benchmarked against annual totals.</li>
            <li><strong>Boundary Concordance:</strong> Core Scope 1, Scope 2, and defined Scope 3 categories must align. Comparing a commuting-only Scope 3 inventory against one including international flights or comprehensive supply chain procurement is misleading.</li>
            <li><strong>Per-Capita Metric Transparency:</strong> Footprint metrics must distinguish between full-time equivalent (FTE) headcount, enrolled student headcount, and total campus population.</li>
            <li><strong>Local Climatic & Grid Normalization:</strong> Cooling degree days (CDD) and national power grid carbon intensities (kg CO₂/kWh) differ widely across geographic regions and must be disclosed.</li>
          </ol>
        </div>
      )}
    </div>
  );
};
