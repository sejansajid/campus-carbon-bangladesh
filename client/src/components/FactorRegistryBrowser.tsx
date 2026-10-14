import React, { useState } from 'react';
import { Sparkles, Search, Filter, ExternalLink, ShieldCheck, Info } from 'lucide-react';
import { EmissionFactor, FactorProvenance } from '../../../shared/types';
import { EMISSION_FACTOR_REGISTRY } from '../../../shared/factors/registry';
import { Language, t } from '../../../shared/i18n';

interface FactorRegistryBrowserProps {
  lang: Language;
}

export const FactorRegistryBrowser: React.FC<FactorRegistryBrowserProps> = ({ lang }) => {
  const [search, setSearch] = useState('');
  const [selectedProv, setSelectedProv] = useState<string>('all');
  const [selectedFactor, setSelectedFactor] = useState<EmissionFactor | null>(null);

  const filtered = EMISSION_FACTOR_REGISTRY.filter(f => {
    const matchesSearch = 
      f.id.toLowerCase().includes(search.toLowerCase()) ||
      f.sourceTitle.toLowerCase().includes(search.toLowerCase()) ||
      f.activityType.toLowerCase().includes(search.toLowerCase()) ||
      f.sourceOrganization.toLowerCase().includes(search.toLowerCase());

    const matchesProv = selectedProv === 'all' || f.provenance === selectedProv;
    return matchesSearch && matchesProv;
  });

  const getBadgeClass = (prov: FactorProvenance) => {
    switch (prov) {
      case 'bangladesh_official':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'bangladesh_research_derived':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'international_proxy':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'synthetic_test':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-700" />
          Emission Factors Database
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Search and inspect greenhouse gas emission factors, accounting boundaries, and scientific citations. 
          Agency-published factors are segregated from research-derived and international proxy metrics.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search factors by fuel, activity, source title, or organization..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedProv}
            onChange={e => setSelectedProv(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Provenance Categories</option>
            <option value="bangladesh_official">Bangladesh Official (SREDA/DoE)</option>
            <option value="bangladesh_research_derived">Bangladesh Research-Derived (ULAB)</option>
            <option value="international_proxy">International Proxy (EPA/IPCC)</option>
            <option value="synthetic_test">Synthetic Test Benchmark</option>
          </select>
        </div>
      </div>

      {/* Factors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="p-3 font-semibold">Factor Identifier</th>
                <th className="p-3 font-semibold">Activity Type</th>
                <th className="p-3 font-semibold">Factor Value & Unit</th>
                <th className="p-3 font-semibold">Accounting Boundary</th>
                <th className="p-3 font-semibold">Source & Citation</th>
                <th className="p-3 font-semibold">Provenance Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((factor) => (
                <tr 
                  key={factor.id} 
                  onClick={() => setSelectedFactor(factor)}
                  className="hover:bg-teal-50/40 cursor-pointer transition"
                >
                  <td className="p-3 font-mono font-bold text-slate-900">
                    {factor.id}
                    <span className="block text-[10px] text-slate-400 font-sans font-normal">v{factor.version} • {factor.geography}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800">{factor.activityType}</span>
                    <span className="block text-[10px] text-slate-500">{factor.gasOrCO2e} ({factor.gwpBasis})</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-teal-800">
                    {factor.value} <span className="text-[11px] font-normal text-slate-500">{factor.numeratorUnit} / {factor.denominatorUnit}</span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-600 max-w-xs truncate">
                    {factor.boundary}
                  </td>
                  <td className="p-3 text-[11px]">
                    <span className="font-semibold text-slate-800 block">{factor.sourceOrganization}</span>
                    <span className="text-slate-500 truncate block max-w-xs">{factor.sourceTitle}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getBadgeClass(factor.provenance)}`}>
                      {factor.provenance.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Factor Detail Modal */}
      {selectedFactor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getBadgeClass(selectedFactor.provenance)}`}>
                  {selectedFactor.provenance.replace('_', ' ')}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedFactor.id}</h3>
              </div>
              <button
                onClick={() => setSelectedFactor(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base px-2"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Factor Value</span>
                  <span className="text-lg font-mono font-extrabold text-teal-800">
                    {selectedFactor.value} {selectedFactor.numeratorUnit}/{selectedFactor.denominatorUnit}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Applicable Geography & Year</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {selectedFactor.geography} • Ref Year: {selectedFactor.referenceYear}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Scientific Derivation:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedFactor.derivationMethod}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-1 text-slate-600">
                <div><strong>Source Title:</strong> {selectedFactor.sourceTitle}</div>
                <div><strong>Issuing Organization:</strong> {selectedFactor.sourceOrganization}</div>
                {selectedFactor.pageOrTable && <div><strong>Location in Document:</strong> {selectedFactor.pageOrTable}</div>}
                {selectedFactor.sourceUrlOrDoi && (
                  <div>
                    <strong>Publication / DOI Reference:</strong>{' '}
                    <span className="font-mono text-teal-700">{selectedFactor.sourceUrlOrDoi}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedFactor(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900"
              >
                Close Registry Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
