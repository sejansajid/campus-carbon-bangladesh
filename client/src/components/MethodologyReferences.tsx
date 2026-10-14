import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Scale, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Layers, 
  Database,
  ArrowRight
} from 'lucide-react';
import { Language } from '../../../shared/i18n';

interface MethodologyReferencesProps {
  lang: Language;
}

export const MethodologyReferences: React.FC<MethodologyReferencesProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'accounting' | 'literature' | 'limitations'>('accounting');

  const isBn = lang === 'bn';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-cobalt" />
          <span>{isBn ? 'পদ্ধতিগত রেফারেন্স ও প্রমাণ' : 'Methodology & Academic References'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800">
          {isBn ? 'হিসাবরক্ষণ নীতি, সমীকরণ ও গবেষণা রেফারেন্স' : 'Carbon Accounting Methodology & Reference Standards'}
        </h1>
        <p className="text-sm text-navy-600 leading-relaxed max-w-3xl">
          {isBn
            ? 'এই প্ল্যাটফর্মটি আন্তর্জাতিক গ্রিনহাউস গ্যাস প্রোটোকল (GHG Protocol Corporate Standard) এবং প্রকাশিত গবেষণা সাহিত্যের উপর ভিত্তি করে উচ্চশিক্ষা প্রতিষ্ঠানের নির্গমন হিসাব করে।'
            : 'Transparent documentation of carbon accounting boundaries, emission factor sources, GWP versions, sample expansion mathematics, and methodological boundaries.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-navy-100 pb-1">
        <button
          onClick={() => setActiveTab('accounting')}
          className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'accounting'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          {isBn ? 'হিসাবরক্ষণ কাঠামো ও সমীকরণ' : 'Accounting Framework & Mathematics'}
        </button>
        <button
          onClick={() => setActiveTab('literature')}
          className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'literature'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          {isBn ? 'গবেষণা ও উদ্ধৃতি' : 'Study Citations & Data Sources'}
        </button>
        <button
          onClick={() => setActiveTab('limitations')}
          className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'limitations'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          {isBn ? 'সীমাবদ্ধতা ও পরিধি' : 'Boundaries & Exclusions'}
        </button>
      </div>

      {/* Tab 1: Accounting Framework & Mathematics */}
      {activeTab === 'accounting' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4">
            <h2 className="text-lg font-bold text-navy-800 flex items-center gap-2">
              <Scale className="w-5 h-5 text-cobalt" />
              <span>GHG Protocol Corporate Accounting Standard</span>
            </h2>
            <p className="text-xs text-navy-600 leading-relaxed">
              Emissions are grouped using the <strong>Operational Control</strong> consolidation approach. Under this boundary, the institution accounts for 100% of greenhouse gas emissions from operations over which it has the full authority to introduce and implement operating policies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                <span className="font-bold text-amber-950 block">Scope 1 (Direct Fuels & Gases)</span>
                <p className="text-navy-700 text-[11px] leading-relaxed">
                  Calculated using fuel mass/volume and verified Net Calorific Values (NCV) with IPCC oxidation factors. In-scope refrigerants (HFCs such as R-410A) use 100-year GWP. Ozone-depleting substances regulated under the Montreal Protocol (e.g. HCFC-22) are reported as an informational disclosure outside the core Kyoto/UNFCCC basket.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                <span className="font-bold text-blue-950 block">Scope 2 (Purchased Electricity)</span>
                <p className="text-navy-700 text-[11px] leading-relaxed">
                  Evaluated using the location-based grid emission factor:
                  <br />
                  <code className="bg-white/80 px-1.5 py-0.5 rounded text-[10px] font-mono block mt-1">
                    E_s2 = Annual kWh × EF_grid (0.67 kg CO₂/kWh)
                  </code>
                  Reflects the generation mix of the Bangladesh national grid interconnected transmission network.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs space-y-2">
                <span className="font-bold text-purple-950 block">Scope 3 (Commuting & T&D Losses)</span>
                <p className="text-navy-700 text-[11px] leading-relaxed">
                  Daily passenger-kilometres are computed from modal survey responses, round-trip distances, campus days, and vehicle passenger occupancies:
                  <br />
                  <code className="bg-white/80 px-1.5 py-0.5 rounded text-[10px] font-mono block mt-1">
                    E_commute = Σ (N_mode × 2 × dist_km × days × EF_mode / occupancy)
                  </code>
                  Transmission and distribution (T&D) losses are computed at 3.06% of delivered power.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-navy-800">
              Global Warming Potential (GWP) Sets
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Calculations support IPCC Assessment Report 100-year GWP metrics. The platform defaults to AR6 (Sixth Assessment Report) while providing deterministic backward compatibility for comparisons:
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-navy-700">
                <thead>
                  <tr className="bg-navy-50 text-navy-900 font-bold border-b border-navy-100">
                    <th className="py-2.5 px-3 text-left">Gas / Refrigerant</th>
                    <th className="py-2.5 px-3 text-left">Formula / Classification</th>
                    <th className="py-2.5 px-3 text-right">AR6 (100-yr)</th>
                    <th className="py-2.5 px-3 text-right">AR5 (100-yr)</th>
                    <th className="py-2.5 px-3 text-right">AR4 (100-yr)</th>
                    <th className="py-2.5 px-3 text-left">Boundary Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  <tr>
                    <td className="py-2 px-3 font-semibold">Carbon Dioxide (CO₂)</td>
                    <td className="py-2 px-3 text-navy-500">CO₂</td>
                    <td className="py-2 px-3 text-right font-mono">1</td>
                    <td className="py-2 px-3 text-right font-mono">1</td>
                    <td className="py-2 px-3 text-right font-mono">1</td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">In-scope</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Methane (CH₄)</td>
                    <td className="py-2 px-3 text-navy-500">Fossil CH₄</td>
                    <td className="py-2 px-3 text-right font-mono">29.8</td>
                    <td className="py-2 px-3 text-right font-mono">28</td>
                    <td className="py-2 px-3 text-right font-mono">25</td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">In-scope</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Nitrous Oxide (N₂O)</td>
                    <td className="py-2 px-3 text-navy-500">N₂O</td>
                    <td className="py-2 px-3 text-right font-mono">273</td>
                    <td className="py-2 px-3 text-right font-mono">265</td>
                    <td className="py-2 px-3 text-right font-mono">298</td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">In-scope</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">R-410A</td>
                    <td className="py-2 px-3 text-navy-500">50% HFC-32 / 50% HFC-125</td>
                    <td className="py-2 px-3 text-right font-mono">2,255.5</td>
                    <td className="py-2 px-3 text-right font-mono">2,088</td>
                    <td className="py-2 px-3 text-right font-mono">2,088</td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">In-scope (Scope 1)</td>
                  </tr>
                  <tr className="bg-amber-50/30">
                    <td className="py-2 px-3 font-semibold">R-22 (Chlorodifluoromethane)</td>
                    <td className="py-2 px-3 text-navy-500">HCFC-22 (Montreal Protocol ODS)</td>
                    <td className="py-2 px-3 text-right font-mono">1,960</td>
                    <td className="py-2 px-3 text-right font-mono">1,760</td>
                    <td className="py-2 px-3 text-right font-mono">1,810</td>
                    <td className="py-2 px-3 text-amber-700 font-semibold">Separate Memo (Out-of-Scope)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Literature & Citations */}
      {activeTab === 'literature' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4">
            <h2 className="text-lg font-bold text-navy-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cobalt" />
              <span>Reference Scientific Research Paper</span>
            </h2>
            <div className="p-4 rounded-xl bg-ivory border border-navy-200 space-y-2 text-xs">
              <div className="font-bold text-sm text-navy-900">
                “Assessment of Greenhouse Gas Emissions and Mitigation Strategies for a University in Bangladesh”
              </div>
              <div className="text-navy-600">
                Authors: <strong>Alfatha, et al.</strong> • Journal: <em>IEEE Access</em> (Volume 13, 2025)
              </div>
              <div className="text-navy-500">
                Digital Object Identifier: <a href="https://doi.org/10.1109/ACCESS.2025.3605517" target="_blank" rel="noreferrer" className="text-cobalt hover:underline font-mono">10.1109/ACCESS.2025.3605517</a>
              </div>
              <p className="text-navy-700 text-[11px] pt-1 leading-relaxed">
                This benchmark research established the empirical energy, transport, and fugitive gas data baseline for the University of Liberal Arts Bangladesh (ULAB) permanent campus in Mohammadpur, Dhaka for the calendar year 2022.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-navy-800">
              Authoritative Emission Factor Sources
            </h3>
            <ul className="space-y-3 text-xs text-navy-700">
              <li className="p-3 rounded-xl bg-navy-50/60 border border-navy-100 space-y-1">
                <span className="font-bold text-navy-900 block">Bangladesh National Electricity Grid Emission Factor</span>
                <p className="text-navy-600 text-[11px]">
                  0.6700 kg CO₂/kWh. Source: Department of Environment (DoE), Ministry of Environment, Forest and Climate Change, Government of Bangladesh; corroborated by UNFCCC CDM Grid Emission Factor for the National Grid of Bangladesh.
                </p>
              </li>
              <li className="p-3 rounded-xl bg-navy-50/60 border border-navy-100 space-y-1">
                <span className="font-bold text-navy-900 block">Stationary and Mobile Combustion Emission Factors</span>
                <p className="text-navy-600 text-[11px]">
                  Diesel fuel: 2.6865 kg CO₂e/litre; Octane (gasoline): 2.3149 kg CO₂e/litre; LPG mass: 2.9830 kg CO₂e/kg. Source: 2006 IPCC Guidelines for National Greenhouse Gas Inventories (Volume 2: Energy).
                </p>
              </li>
              <li className="p-3 rounded-xl bg-navy-50/60 border border-navy-100 space-y-1">
                <span className="font-bold text-navy-900 block">Commuter Transport Emission Intensities</span>
                <p className="text-navy-600 text-[11px]">
                  Private passenger car: 280.9 g CO₂e/vehicle-km; Motorcycle: 40.0 g CO₂e/vehicle-km; CNG 3-wheeler: 75.0 g CO₂e/vehicle-km; Battery auto-rickshaw (Easybike): 50.8 g CO₂e/vehicle-km; Public bus: 17.1 g CO₂e/passenger-km; Walking/Bicycle: 0.0 g CO₂e/km. Source: Wadud (2020), DEFRA UK Government GHG Conversion Factors (adapted for South Asian vehicle fleet characteristics).
                </p>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Boundaries & Exclusions */}
      {activeTab === 'limitations' && (
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4 text-xs text-navy-700">
          <h2 className="text-lg font-bold text-navy-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>Operational Boundaries, Inclusions, and Explicit Exclusions</span>
          </h2>
          <p className="leading-relaxed">
            Responsible institutional greenhouse gas reporting requires precise disclosure of what is included and what is omitted from the inventory boundary:
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-950 block">Included Emission Categories</span>
              <ul className="list-disc pl-4 space-y-0.5 text-navy-700 text-[11px]">
                <li>Scope 1: Stationary diesel generator combustion during grid interruptions.</li>
                <li>Scope 1: University-owned transport vehicles (buses, microbuses, campus utility cars).</li>
                <li>Scope 1: Cafeteria LPG cooking fuel cylinders.</li>
                <li>Scope 1: Fugitive air conditioning refrigerant leakage (Kyoto Protocol HFCs like R-410A).</li>
                <li>Scope 2: Location-based grid electricity consumed across all campus meters.</li>
                <li>Scope 3: Commuter travel for students, academic faculty, and administrative staff.</li>
                <li>Scope 3: Upstream transmission and distribution (T&D) energy losses.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
              <span className="font-bold text-amber-950 block">Explicit Exclusions (Data Unavailable or Not Sampled)</span>
              <ul className="list-disc pl-4 space-y-0.5 text-navy-700 text-[11px]">
                <li>Food lifecycle emissions (upstream agricultural supply chain of cafeteria meals).</li>
                <li>Embodied carbon in campus building construction and capital equipment purchases.</li>
                <li>Municipal water supply treatment and pumping upstream energy.</li>
                <li>Campus solid waste landfill methane generation (unless weighed and segregated).</li>
                <li>Faculty and executive air travel for international academic conferences.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-50/60 border border-navy-100 space-y-1">
              <span className="font-bold text-navy-950 block">Commuter Spatial Privacy Protection</span>
              <p className="text-navy-600 text-[11px] leading-relaxed">
                Respondent privacy is preserved by aggregating origin coordinates into geographic clusters. Any commuter origin cluster with fewer than five respondents ($k &lt; 5$) is suppressed from public spatial mapping to prevent individual re-identification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
