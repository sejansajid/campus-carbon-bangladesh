import React, { useState } from 'react';
import { GitCompare, AlertTriangle, CheckCircle2, BookOpen, ShieldAlert, Users, ExternalLink } from 'lucide-react';
import { Language, t } from '../../../shared/i18n';

interface FairComparisonProps {
  currentInstitutionName: string;
  currentPerCapita: number;
  lang: Language;
}

export const FairComparison: React.FC<FairComparisonProps> = ({
  currentInstitutionName,
  currentPerCapita,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'participating' | 'literature'>('literature');

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
      compatibilityReason: 'Desert climate requiring year-round high-capacity chiller cooling, on-site energy cogeneration, and energy-intensive desalinated water.'
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
      compatibilityReason: 'Sub-arctic district heating emissions and comprehensive supply chain procurement included; higher Scope 3 boundary than commuting-only.'
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
      compatibilityReason: 'South Asian urban commuter campus with comparable climate, public transit reliance, and private vehicle patterns.'
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
      compatibilityReason: 'Compact Mediterranean campus with high non-motorized and cycling commuter share.'
    },
    {
      name: 'Bournemouth University',
      location: 'Poole, England',
      studyYear: 'April - June 2020',
      publishingYear: 2021,
      perCapita: 0.16,
      scopeCoverage: '3-Month Lockdown Quarter',
      reference: 'DOI: 10.1016/j.jclepro.2021.127889',
      compatibilityStatus: 'incompatible',
      compatibilityReason: 'CRITICAL AUDIT FLAG (Methodological Issue #9): Measured exclusively during a 3-month COVID-19 national lockdown quarter. Cannot be compared with full 12-month annual inventories!'
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
      compatibilityReason: 'High compatibility: Tropical commuter institution with comparable floor space per student and grid emission intensity.'
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
      compatibilityReason: 'High compatibility: High-density urban Latin American campus with similar student-to-faculty ratios.'
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
      compatibilityReason: 'High compatibility: Humid tropical Southeast Asian commuter university with motorcycle and transit share.'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-teal-700" />
          Rigorous & Fair Peer Comparison
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Higher education institutions differ vastly in geographic climate, residential housing, laboratory intensity, and reporting boundaries. 
          The platform enforces strict comparability standards and prohibits arbitrary rankings or greenwashing leaderboards.
        </p>
      </div>

      {/* Strict Comparability Rules Banner */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          Mandatory Comparability Guidelines (Prompt Section 10)
        </div>
        <ul className="list-disc pl-5 space-y-1 text-amber-800 text-[11px]">
          <li><strong>Reporting Duration:</strong> A 3-month lockdown interval (e.g. Bournemouth April–June 2020) must never be presented as equivalent to a full 12-month annual academic year.</li>
          <li><strong>Scope 3 Completeness:</strong> A commuting-only Scope 3 inventory cannot be compared against a comprehensive institution reporting procurement, capital goods, and flights without explicit boundary disclosure.</li>
          <li><strong>Campus Morphology:</strong> Highly residential universities with student dormitories inherently exhibit different per-capita energy profiles than urban non-residential commuter campuses.</li>
        </ul>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('literature')}
          className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'literature'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Published Literature Benchmarks (Table 12)
        </button>
        <button
          onClick={() => setActiveTab('participating')}
          className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'participating'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Participating Bangladeshi Universities (Opted-in)
        </button>
      </div>

      {/* Tab 1: Literature Benchmarks */}
      {activeTab === 'literature' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {literatureStudies.map((study, idx) => {
              const isCompatible = study.compatibilityStatus === 'compatible';
              const isMod = study.compatibilityStatus === 'moderately_compatible';
              const isIncompat = study.compatibilityStatus === 'incompatible';

              return (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border bg-white shadow-2xs space-y-3 transition ${
                    isIncompat ? 'border-rose-200 bg-rose-50/20' : isCompatible ? 'border-teal-200 hover:border-teal-300' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{study.name}</h4>
                      <span className="text-xs text-slate-500">{study.location} • Study Year: {study.studyYear}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-extrabold text-slate-900">
                        {study.perCapita.toFixed(2)} <span className="text-xs font-normal text-slate-500">t/person</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Published: {study.publishingYear}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <span className={`w-2 h-2 rounded-full ${isIncompat ? 'bg-rose-500' : isCompatible ? 'bg-forest-600' : 'bg-amber-500'}`} />
                      Comparability Assessment:
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      {study.compatibilityReason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="font-mono">{study.reference}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isIncompat ? 'bg-rose-100 text-rose-800' : isCompatible ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isIncompat ? 'Not Comparable' : isCompatible ? 'Fair Benchmark' : 'Moderate Match'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Participating Bangladeshi Institutions */}
      {activeTab === 'participating' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Verified Participating Bangladeshi HEI Inventories</h3>
            <p className="text-xs text-slate-500">
              Only universities that have explicitly opted-in to public benchmarking appear here.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-bold text-sm text-slate-900">{currentInstitutionName}</span>
              <div className="text-xs text-slate-600">
                Reporting Year: 2022 • Population: 5,350 • Dhaka Division
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-extrabold text-teal-800">
                {currentPerCapita.toFixed(4)} <span className="text-xs font-normal text-slate-500">tCO₂e/person</span>
              </div>
              <span className="text-[10px] font-semibold text-forest-700 bg-forest-100 px-2 py-0.5 rounded">
                Verified Research Baseline
              </span>
            </div>
          </div>

          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-1">
            <Users className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="font-medium text-slate-600">Awaiting Additional University Publication Consents</p>
            <p className="text-[11px] max-w-md mx-auto text-slate-400">
              As partner institutions across Bangladesh complete and authorize their inventory reports, they will be benchmarked here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
