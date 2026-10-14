import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Plus, 
  ArrowRight, 
  Sun, 
  Car, 
  Zap,
  TrendingDown,
  FileDown,
  ShieldCheck,
  Building2,
  Clock,
  User,
  Check,
  X,
  RotateCcw,
  Sliders,
  Wind
} from 'lucide-react';
import { 
  InventoryCalculationResult, 
  MitigationScenarioConfig, 
  SustainabilityAction, 
  ActionStatus 
} from '../../../shared/types';
import { PRESET_SCENARIOS, evaluateMitigationScenario } from '../../../shared/scenarios/mitigation';
import { Language, t } from '../../../shared/i18n';

interface PolicyActionPlanProps {
  institutionId: string;
  isDemo?: boolean;
  baseline: InventoryCalculationResult;
  actions: SustainabilityAction[];
  onAddAction: (act: Partial<SustainabilityAction>) => Promise<void>;
  onAddFeedback: (actionId: string, feedback: { author: string; text: string; status?: ActionStatus }) => Promise<void>;
  lang: Language;
}

export const PolicyActionPlan: React.FC<PolicyActionPlanProps> = ({
  institutionId,
  isDemo = false,
  baseline,
  actions,
  onAddAction,
  onAddFeedback,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'scenarios' | 'actions'>('recommended');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('SCENARIO-INCREMENTAL');
  
  // Custom Scenario Config State
  const initialConfig = PRESET_SCENARIOS.find(s => s.id === selectedPresetId) || PRESET_SCENARIOS[1];
  const [config, setConfig] = useState<MitigationScenarioConfig>(initialConfig);

  // New Action Modal State
  const [showNewActionModal, setShowNewActionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionScope, setActionScope] = useState<1 | 2 | 3>(2);
  const [actionDept, setActionDept] = useState('Facilities & Engineering');
  const [actionCost, setActionCost] = useState(1500000);
  const [actionReduction, setActionReduction] = useState(42.0);
  const [actionDate, setActionDate] = useState('2026-12-31');
  const [actionDesc, setActionDesc] = useState('');

  // Feedback State
  const [activeFeedbackActionId, setActiveFeedbackActionId] = useState<string | null>(null);
  const [feedbackAuthor, setFeedbackAuthor] = useState(isDemo ? 'Demo Reviewer (Illustrative)' : 'Campus Sustainability Lead');
  const [feedbackText, setFeedbackText] = useState('');
  const [newStatus, setNewStatus] = useState<ActionStatus>('in_progress');

  // Handle Preset Selection
  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    const found = PRESET_SCENARIOS.find(s => s.id === id);
    if (found) {
      setConfig({ ...found });
    }
  };

  // Run dynamic evaluation
  const evaluation = evaluateMitigationScenario(baseline, config);

  const isBn = lang === 'bn';

  // Recommended Actions based on Hotspots
  const recommendedPolicies = [
    {
      id: 'REC-CAR-TRANSIT',
      title: isBn ? 'ব্যক্তিগত গাড়ি থেকে ক্যাম্পাস শাটল ও কারপুলে স্থানান্তর' : 'Private Car Shift to Dedicated Campus Shuttles & Carpooling',
      scope: 3,
      category: 'Commuting Transport',
      targetSource: 'Private Cars (59.6% of commuting footprint)',
      why: 'Private car users account for only ~8.8% of daily campus travelers, but generate ~59.6% of all commuting emissions. Shifting 30% of car drivers to university shared transit yields significant carbon savings.',
      emissionsAddressed: 'Scope 3 (Employee & Student Commuting)',
      missingInput: 'Detailed origin routes and willingness-to-pay survey for reserved shuttle routes.',
      owner: 'Transport & Fleet Committee / Student Affairs',
      progressMetric: 'Percentage of solo car drivers switching to shared transit or shuttle.',
      potentialSavings: '150 - 350 tCO₂e/year',
      feasibility: 'High Feasibility'
    },
    {
      id: 'REC-SOLAR-PV',
      title: isBn ? 'ছাদভিত্তিক সৌরবিদ্যুৎ প্রকল্প (রুপটপ সোলার পিভি)' : 'Rooftop Solar PV Installation (Self-Consumption)',
      scope: 2,
      category: 'Renewable Generation',
      targetSource: 'Purchased Grid Electricity (171.3 tCO₂e Scope 2)',
      why: 'On-site solar generation directly displaces grid power imported at 0.67 kg CO₂/kWh, reducing electricity utility bills and Scope 2 emissions.',
      emissionsAddressed: 'Scope 2 (Purchased Electricity)',
      missingInput: 'Structural load-bearing engineering survey of campus building roofs.',
      owner: 'Facilities & Campus Engineering Directorate',
      progressMetric: 'Cumulative annual solar energy generation (kWh/year) and grid displacement %.',
      potentialSavings: '50 - 150 tCO₂e/year (depending on kWp)',
      feasibility: 'Proven Commercial Viability'
    },
    {
      id: 'REC-HVAC-REFRIGERANT',
      title: isBn ? 'এসি রেফ্রিজারেন্ট লিকেজ রোধ ও নিম্ন-জিডব্লিউপি রূপান্তর' : 'Air Conditioning Leakage Prevention & Lower-GWP Refrigerant Transition',
      scope: 1,
      category: 'Fugitive Emissions',
      targetSource: 'Refrigerant Fugitive Top-ups (R-410A & legacy R-22)',
      why: 'Refrigerants possess high Global Warming Potentials (GWP > 2,000). Preventive valve maintenance and phasing out obsolete HCFC-22 for low-GWP refrigerants (R-32 or R-290) drastically eliminates Scope 1 leakage.',
      emissionsAddressed: 'Scope 1 (Fugitive Refrigerant Losses)',
      missingInput: 'Equipment-by-equipment age and refrigerant charge inventory with service logs.',
      owner: 'HVAC Maintenance & Operations Division',
      progressMetric: 'Annual refrigerant replenishment kg logged across maintenance contracts.',
      potentialSavings: '100 - 300 tCO₂e/year',
      feasibility: 'High Impact / Maintenance Priority'
    },
    {
      id: 'REC-LIGHTING-EE',
      title: isBn ? 'শক্তির দক্ষতা বৃদ্ধি ও এলইডি লাইটিং রূপান্তর' : 'Campus Energy Efficiency & Smart Sensor LED Retrofit',
      scope: 2,
      category: 'Energy Demand Management',
      targetSource: 'Campus Lighting & Laboratory Baseload',
      why: 'Reducing campus electrical baseload before sizing renewable generation prevents capital misallocation and lowers operational utility bills.',
      emissionsAddressed: 'Scope 2 (Purchased Electricity) & Scope 3 (T&D Losses)',
      missingInput: 'Sub-metered floor-by-floor lighting vs HVAC power audit.',
      owner: 'Campus Operations & Electrical Maintenance',
      progressMetric: 'Building energy intensity (kWh/m²/year).',
      potentialSavings: '20 - 50 tCO₂e/year',
      feasibility: 'Immediate Payback'
    },
    {
      id: 'REC-GOVERNANCE-WASTE',
      title: isBn ? 'ক্যাম্পাস বর্জ্য ও সংগ্রহ নিরীক্ষা ব্যবস্থাপনা' : 'Solid Waste Data Collection & Composting Governance',
      scope: 3,
      category: 'Waste & Circularity',
      targetSource: 'Unmeasured Cafeteria & Academic Waste',
      why: 'Currently excluded from inventory due to lack of measured weight logs. Establishing daily waste weighing creates the data foundation for future Scope 3 accounting.',
      emissionsAddressed: 'Scope 3 (Waste Disposal & Landfill Methane)',
      missingInput: 'Baseline waste audits and compost facility space allocation.',
      owner: 'Campus Green Committee / Administration',
      progressMetric: 'Kilograms of organic waste composted on campus vs sent to landfill.',
      potentialSavings: 'Qualitative Data Completeness Foundation',
      feasibility: 'Low Cost / High Awareness'
    }
  ];

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle) return;
    try {
      await onAddAction({
        institutionId,
        title: actionTitle,
        scope: actionScope,
        category: actionScope === 1 ? 'refrigerant_fugitive_ac' : actionScope === 2 ? 'purchased_electricity_grid' : 'employee_commuting',
        responsibleDepartment: actionDept,
        targetCompletionDate: actionDate,
        status: 'proposed',
        estimatedReductionTCO2e: Number(actionReduction),
        estimatedCostBDT: Number(actionCost),
        description: actionDesc
      });
      setShowNewActionModal(false);
      setActionTitle('');
      setActionDesc('');
    } catch (err) {
      console.error('Failed to create action:', err);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFeedbackActionId || !feedbackText) return;
    try {
      await onAddFeedback(activeFeedbackActionId, {
        author: feedbackAuthor,
        text: feedbackText,
        status: newStatus
      });
      setFeedbackText('');
      setActiveFeedbackActionId(null);
    } catch (err) {
      console.error('Failed to add feedback:', err);
    }
  };

  const handleAcceptRecommendation = async (rec: typeof recommendedPolicies[0]) => {
    try {
      await onAddAction({
        institutionId,
        title: rec.title,
        scope: rec.scope as 1 | 2 | 3,
        category: rec.scope === 1 ? 'refrigerant_fugitive_ac' : rec.scope === 2 ? 'purchased_electricity_grid' : 'employee_commuting',
        responsibleDepartment: rec.owner,
        targetCompletionDate: '2026-12-31',
        status: 'proposed',
        estimatedReductionTCO2e: 50.0,
        estimatedCostBDT: 1000000,
        description: `${rec.why} Emissions addressed: ${rec.emissionsAddressed}. Required input: ${rec.missingInput}`
      });
      setActiveTab('actions');
    } catch (err) {
      console.error('Error adopting recommendation:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold">
          <Lightbulb className="w-3.5 h-3.5 text-cobalt" />
          <span>{isBn ? 'নীতি ও কর্মপরিকল্পনা' : 'Policy & action plan'}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800">
              {isBn ? 'ডিকার্বনাইজেশন কৌশল ও প্রাতিষ্ঠানিক কর্মপরিকল্পনা' : 'Decarbonization Pathways & Action Plan'}
            </h1>
            <p className="text-xs text-navy-500 mt-1">
              {isBn
                ? 'পরিমাপিত নির্গমন তথ্যের উপর ভিত্তি করে অগ্রাধিকারভিত্তিক সুপারিশ, সিমুলেশন দৃশ্যপট ও কর্মপরিকল্পনা পরিচালনা করুন।'
                : 'Turn measured emissions hotspots into prioritized institutional policies, technical simulations, and accountable action tracking.'}
            </p>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs transition cursor-pointer shadow-2xs shrink-0"
          >
            <FileDown className="w-4 h-4" />
            <span>{isBn ? 'খসড়া কর্মপরিকল্পনা রপ্তানি' : 'Export draft action plan'}</span>
          </button>
        </div>
      </div>

      {/* Demo Warning Notice */}
      {isDemo && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <div>
            <strong>Illustrative Demo View:</strong> Actions and comments shown here are temporary illustrations derived from study recommendations. They do not represent official ULAB administrative approvals.
          </div>
        </div>
      )}

      {/* Top 3-Section Navigation Bar */}
      <div className="flex space-x-2 border-b border-navy-100 pb-1">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'recommended'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          {isBn ? '১. সুপারিশকৃত পদক্ষেপসমূহ' : '1. Recommended actions'} ({recommendedPolicies.length})
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'scenarios'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          {isBn ? '২. দৃশ্যপট বিশ্লেষণ ও সিমুলেশন' : '2. Explore scenarios'}
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'actions'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-navy-500 hover:text-navy-800'
          }`}
        >
          {isBn ? '৩. প্রাতিষ্ঠানিক কর্মপরিকল্পনা ট্র্যাকার' : '3. Institutional action plan'} ({actions.length})
        </button>
      </div>

      {/* 1. Recommended Actions View */}
      {activeTab === 'recommended' && (
        <div className="space-y-4">
          <div className="bg-ivory p-4 rounded-2xl border border-navy-100 text-xs text-navy-700">
            <h3 className="font-bold text-navy-900 mb-1">Source-Linked Policy Recommendations</h3>
            <p className="leading-relaxed text-[11px]">
              These policies address the major quantified emission hotspots in this inventory. Each card explains the rationale, required data, department ownership, and progress measurement.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recommendedPolicies.map((rec) => (
              <div 
                key={rec.id}
                className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-4 hover:border-cobalt-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.scope === 1 ? 'bg-amber-100 text-amber-900' :
                        rec.scope === 2 ? 'bg-blue-100 text-blue-900' :
                        'bg-purple-100 text-purple-900'
                      }`}>
                        Scope {rec.scope}
                      </span>
                      <span className="text-xs font-semibold text-navy-500">{rec.category}</span>
                      <span className="text-xs text-navy-400">• Target: {rec.targetSource}</span>
                    </div>
                    <h3 className="font-bold text-base text-navy-900">{rec.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAcceptRecommendation(rec)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isBn ? 'পরিকল্পনায় যুক্ত করুন' : 'Accept into plan'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-navy-50/50 p-4 rounded-xl border border-navy-100">
                  <div className="space-y-2">
                    <div>
                      <span className="font-bold text-navy-900 block text-[11px]">Why this action?</span>
                      <p className="text-navy-600 text-[11px] leading-relaxed">{rec.why}</p>
                    </div>
                    <div>
                      <span className="font-bold text-navy-900 block text-[11px]">What evidence or input is missing?</span>
                      <p className="text-navy-600 text-[11px]">{rec.missingInput}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t md:border-t-0 md:border-l border-navy-100 md:pl-4 pt-2 md:pt-0">
                    <div>
                      <span className="font-bold text-navy-900 block text-[11px]">Suggested Institutional Owner:</span>
                      <p className="text-navy-700 font-medium text-[11px]">{rec.owner}</p>
                    </div>
                    <div>
                      <span className="font-bold text-navy-900 block text-[11px]">How progress would be measured:</span>
                      <p className="text-navy-600 text-[11px]">{rec.progressMetric}</p>
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-navy-500">Indicative Potential Saving:</span>
                      <span className="font-bold text-emerald-700 font-mono">{rec.potentialSavings}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Explore Scenarios View */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          {/* Preset Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-4 rounded-2xl border text-left transition space-y-2 cursor-pointer ${
                  selectedPresetId === preset.id
                    ? 'bg-cobalt-50/60 border-cobalt shadow-2xs'
                    : 'bg-white border-navy-100 hover:border-navy-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    preset.type === 'conventional' ? 'bg-amber-100 text-amber-800' : preset.type === 'incremental' ? 'bg-cobalt-100 text-cobalt' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {preset.type.toUpperCase()}
                  </span>
                  {selectedPresetId === preset.id && <CheckCircle2 className="w-4 h-4 text-cobalt" />}
                </div>

                <div className="font-bold text-sm text-navy-900">{preset.name}</div>
                <p className="text-xs text-navy-500 leading-relaxed">{preset.description}</p>
              </button>
            ))}
          </div>

          {/* Dynamic Scenario Outcome Card */}
          <div className="bg-navy-800 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-navy-700 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-700 pb-5">
              <div>
                <div className="text-xs text-cobalt-200 font-semibold uppercase tracking-wider">
                  Simulation Outcome: {config.name}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tabular-nums">
                  {evaluation.scenarioTotalTCO2e.toFixed(2)} <span className="text-sm font-normal text-navy-300">tCO₂e / year</span>
                </div>
                <div className="text-xs text-navy-300 mt-1">
                  Baseline: {evaluation.baselineTotalTCO2e.toFixed(2)} tCO₂e &rarr; Net in-scope reduction:{' '}
                  <span className="font-bold text-emerald-400 font-mono">-{evaluation.netReductionTCO2e.toFixed(2)} tCO₂e</span> ({evaluation.percentageReduction.toFixed(1)}% cut)
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] text-navy-300 block">Scenario Per Capita</span>
                  <span className="text-xl font-extrabold text-white tabular-nums">{evaluation.scenarioPerCapita.toFixed(4)}</span>
                  <span className="text-[10px] text-navy-300 block">tCO₂e/person</span>
                </div>
                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] text-navy-300 block">Relative Reduction</span>
                  <span className="text-xl font-extrabold text-emerald-400 tabular-nums">{evaluation.percentageReduction.toFixed(1)}%</span>
                  <span className="text-[10px] text-navy-300 block">Core Inventory</span>
                </div>
              </div>
            </div>

            {/* Interaction Warnings */}
            {evaluation.interactionWarnings.length > 0 && (
              <div className="bg-amber-950/80 border border-amber-600/60 p-4 rounded-2xl text-xs text-amber-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  Engineering Interaction & Safety Consideration:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-amber-200/90 text-[11px]">
                  {evaluation.interactionWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interventions Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {evaluation.interventions.map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cobalt-200">{item.category}</span>
                    <span className="font-mono text-emerald-400 font-bold tabular-nums">-{item.netSavingsTCO2e.toFixed(1)} t</span>
                  </div>
                  <p className="text-[11px] text-navy-200 leading-tight">{item.description}</p>
                  <div className="text-[10px] text-navy-400 italic">
                    {item.technicalFeasibilityNotes[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Sliders */}
          <div className="bg-white p-6 rounded-3xl border border-navy-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 pb-2">
              <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cobalt" />
                <span>Adjust Scenario Parameters</span>
              </h3>
              <button
                onClick={() => handleSelectPreset(selectedPresetId)}
                className="text-xs text-navy-500 hover:text-navy-800 font-semibold cursor-pointer"
              >
                Reset to preset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* Solar PV */}
              <div className="space-y-3 p-4 bg-navy-50/50 rounded-2xl border border-navy-100">
                <div className="font-bold text-navy-800 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Rooftop Solar PV
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-navy-600 block mb-1">
                    Solar Capacity: {config.solarPV.rooftopKwp} kWp
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="2"
                    value={config.solarPV.rooftopKwp}
                    onChange={e => setConfig({ ...config, solarPV: { ...config.solarPV, rooftopKwp: Number(e.target.value) } })}
                    className="w-full accent-cobalt cursor-pointer"
                  />
                  <span className="text-[10px] text-navy-400">Generates clean electricity for self-consumption</span>
                </div>
              </div>

              {/* Transit */}
              <div className="space-y-3 p-4 bg-navy-50/50 rounded-2xl border border-navy-100">
                <div className="font-bold text-navy-800 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-purple-600" />
                  Commuting Transport
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-navy-600 block mb-1">
                    Solo Car Shift to Shuttles: {config.fleetElectrification.electricMinibuses * 10}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={config.fleetElectrification.electricMinibuses}
                    onChange={e => setConfig({ ...config, fleetElectrification: { ...config.fleetElectrification, electricMinibuses: Number(e.target.value) } })}
                    className="w-full accent-cobalt cursor-pointer"
                  />
                  <span className="text-[10px] text-navy-400">{config.fleetElectrification.electricMinibuses} electric minibuses deployed</span>
                </div>
              </div>

              {/* Cooling & Refrigerants */}
              <div className="space-y-3 p-4 bg-navy-50/50 rounded-2xl border border-navy-100">
                <div className="font-bold text-navy-800 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-amber-600" />
                  Cooling Efficiency & Refrigerants
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-navy-600 block mb-1">
                    Leakage Reduction: {(config.refrigerantManagement.leakageRateReductionFraction * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={config.refrigerantManagement.leakageRateReductionFraction}
                    onChange={e => setConfig({ ...config, refrigerantManagement: { ...config.refrigerantManagement, leakageRateReductionFraction: Number(e.target.value) } })}
                    className="w-full accent-cobalt cursor-pointer"
                  />
                  <span className="text-[10px] text-navy-400">Preventive maintenance and valve sealing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Institutional Action Plan View */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-navy-800">
                {isBn ? 'প্রাতিষ্ঠানিক জলবায়ু পদক্ষেপ ও বাস্তবায়ন ট্র্যাকার' : 'Institutional Climate Actions'}
              </h3>
              <p className="text-xs text-navy-500">
                {isBn
                  ? 'দায়িত্বপ্রাপ্ত বিভাগ, লক্ষ্যমাত্রা তারিখ, অনুমোদনের অবস্থা এবং অডিট প্রমাণের ট্র্যাকিং।'
                  : 'Assigned departments, target dates, approval status, and implementation feedback.'}
              </p>
            </div>

            <button
              onClick={() => setShowNewActionModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isBn ? 'নতুন পদক্ষেপ তৈরি করুন' : 'Add custom action'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {actions.map((act) => (
              <div 
                key={act.id} 
                className="bg-white rounded-2xl border border-navy-100 p-5 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        act.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        act.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        act.status === 'approved' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {act.status.toUpperCase().replace('_', ' ')}
                      </span>
                      <span className="text-xs text-navy-400 font-mono">Scope {act.scope}</span>
                    </div>
                    <h4 className="font-bold text-sm text-navy-900">{act.title}</h4>
                    <p className="text-xs text-navy-600 leading-relaxed">{act.description}</p>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-sm font-extrabold text-emerald-700 font-mono">
                      -{act.estimatedReductionTCO2e} tCO₂e
                    </div>
                    <div className="text-[11px] text-navy-400">
                      Budget: ৳{act.estimatedCostBDT.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-navy-500 pt-2 border-t border-navy-50 gap-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-navy-400" />
                      {act.responsibleDepartment}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-navy-400" />
                      Target: {act.targetCompletionDate}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveFeedbackActionId(activeFeedbackActionId === act.id ? null : act.id)}
                    className="text-cobalt hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Feedback & Notes ({act.feedback?.length || 0})</span>
                  </button>
                </div>

                {/* Feedback Drawer */}
                {activeFeedbackActionId === act.id && (
                  <div className="mt-3 p-4 bg-navy-50/60 rounded-xl border border-navy-100 space-y-3">
                    <h5 className="font-bold text-xs text-navy-800">Stakeholder Comments & Reviews</h5>
                    {act.feedback && act.feedback.length > 0 ? (
                      <div className="space-y-2">
                        {act.feedback.map((fb, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-white border border-navy-100 text-xs space-y-1">
                            <div className="flex justify-between text-[10px] text-navy-500">
                              <span className="font-bold text-navy-800">{fb.author}</span>
                              <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-navy-700">{fb.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-navy-400">No stakeholder notes submitted yet.</p>
                    )}

                    <form onSubmit={handleFeedbackSubmit} className="space-y-2 pt-2 border-t border-navy-200">
                      <input
                        type="text"
                        placeholder="Your role (e.g. Energy Committee Reviewer)..."
                        value={feedbackAuthor}
                        onChange={e => setFeedbackAuthor(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs focus:outline-none focus:border-cobalt"
                      />
                      <textarea
                        placeholder="Add evaluation, budgetary note, or status update..."
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs focus:outline-none focus:border-cobalt"
                      />
                      <div className="flex items-center justify-between">
                        <select
                          value={newStatus}
                          onChange={e => setNewStatus(e.target.value as ActionStatus)}
                          className="px-2.5 py-1 rounded-lg border border-navy-200 text-xs bg-white"
                        >
                          <option value="proposed">Proposed</option>
                          <option value="approved">Approved</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs cursor-pointer"
                        >
                          Submit Note
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Action Modal */}
      {showNewActionModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-navy-200 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-base text-navy-900">Add Institutional Sustainability Action</h3>
              <button
                onClick={() => setShowNewActionModal(false)}
                className="text-navy-400 hover:text-navy-700 font-bold text-base cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-navy-700 block mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Variable refrigerant flow (VRF) maintenance"
                  value={actionTitle}
                  onChange={e => setActionTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:border-cobalt"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-navy-700 block mb-1">Emission Scope</label>
                  <select
                    value={actionScope}
                    onChange={e => setActionScope(Number(e.target.value) as 1 | 2 | 3)}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 bg-white"
                  >
                    <option value={1}>Scope 1 (Direct)</option>
                    <option value={2}>Scope 2 (Electricity)</option>
                    <option value={3}>Scope 3 (Commuting/Waste)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-navy-700 block mb-1">Responsible Dept</label>
                  <input
                    type="text"
                    value={actionDept}
                    onChange={e => setActionDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:border-cobalt"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-navy-700 block mb-1">Est. Savings (tCO₂e/yr)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={actionReduction}
                    onChange={e => setActionReduction(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:border-cobalt"
                  />
                </div>

                <div>
                  <label className="font-semibold text-navy-700 block mb-1">Est. Budget (BDT)</label>
                  <input
                    type="number"
                    step="10000"
                    value={actionCost}
                    onChange={e => setActionCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:border-cobalt"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-navy-700 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={actionDate}
                  onChange={e => setActionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:border-cobalt"
                />
              </div>

              <div>
                <label className="font-semibold text-navy-700 block mb-1">Description & Evidence</label>
                <textarea
                  rows={2}
                  placeholder="Scope of work, milestone metrics, and equipment constraints..."
                  value={actionDesc}
                  onChange={e => setActionDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:border-cobalt"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewActionModal(false)}
                  className="px-4 py-2 rounded-xl border border-navy-200 text-navy-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold cursor-pointer"
                >
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Draft Action Plan Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 border border-navy-200 shadow-xl text-xs">
            <div className="flex items-start justify-between border-b border-navy-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-navy-100 text-navy-800 font-bold text-[10px]">
                  Institutional Review Draft
                </span>
                <h3 className="text-lg font-bold text-navy-900 mt-1">Draft Institutional Carbon Action Plan</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-navy-400 hover:text-navy-700 font-bold text-base cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-navy-700">
              <p className="text-[11px] leading-relaxed text-navy-600 bg-ivory p-3 rounded-xl border border-navy-100">
                <strong>Administrative Notice:</strong> This document represents a working proposal for university administrative review. It consolidates baseline emissions, prioritized interventions, assigned responsibilities, and unresolved assumptions.
              </p>

              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-navy-50">
                  <span className="text-navy-500">Inventory Baseline Total:</span>
                  <span className="font-mono font-bold text-navy-900">{baseline.totalGrossEmissions.toFixed(2)} tCO₂e</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-50">
                  <span className="text-navy-500">Planned Actions Count:</span>
                  <span className="font-mono font-bold text-navy-900">{actions.length} initiatives</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-50">
                  <span className="text-navy-500">Potential Total Reduction:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    -{actions.reduce((sum, a) => sum + (a.estimatedReductionTCO2e || 0), 0).toFixed(1)} tCO₂e
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl border border-navy-200 text-navy-700 font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold cursor-pointer"
              >
                Print / Save Draft PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
