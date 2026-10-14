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
  Wind, 
  Car, 
  Zap,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';
import { 
  InventoryCalculationResult, 
  MitigationScenarioConfig, 
  SustainabilityAction, 
  ActionStatus 
} from '../../../shared/types';
import { PRESET_SCENARIOS, evaluateMitigationScenario } from '../../../shared/scenarios/mitigation';
import { Language, t } from '../../../shared/i18n';

interface MitigationPlannerProps {
  institutionId: string;
  baseline: InventoryCalculationResult;
  actions: SustainabilityAction[];
  onAddAction: (act: Partial<SustainabilityAction>) => Promise<void>;
  onAddFeedback: (actionId: string, feedback: { author: string; text: string; status?: ActionStatus }) => Promise<void>;
  lang: Language;
}

export const MitigationPlanner: React.FC<MitigationPlannerProps> = ({
  institutionId,
  baseline,
  actions,
  onAddAction,
  onAddFeedback,
  lang
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('SCENARIO-INCREMENTAL');
  
  // Custom Scenario Config State
  const initialConfig = PRESET_SCENARIOS.find(s => s.id === selectedPresetId) || PRESET_SCENARIOS[1];
  const [config, setConfig] = useState<MitigationScenarioConfig>(initialConfig);

  // New Action State
  const [showNewActionModal, setShowNewActionModal] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionScope, setActionScope] = useState<1 | 2 | 3>(2);
  const [actionDept, setActionDept] = useState('Facilities & Engineering');
  const [actionCost, setActionCost] = useState(1500000);
  const [actionReduction, setActionReduction] = useState(42.0);
  const [actionDate, setActionDate] = useState('2026-12-31');
  const [actionDesc, setActionDesc] = useState('');

  // Feedback State
  const [activeFeedbackActionId, setActiveFeedbackActionId] = useState<string | null>(null);
  const [feedbackAuthor, setFeedbackAuthor] = useState('Campus Sustainability Officer');
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-teal-700" />
          Scenario Simulation & Climate Action Tracking
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Simulate decarbonization pathways derived from the IEEE Access research paper. 
          The engine dynamically re-calculates emission savings, enforces physical equipment constraints, and prevents double-counting interactions.
        </p>
      </div>

      {/* Preset Scenario Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_SCENARIOS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset.id)}
            className={`p-4 rounded-2xl border text-left transition space-y-2 ${
              selectedPresetId === preset.id
                ? 'bg-teal-50 border-teal-300 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                preset.type === 'conventional' ? 'bg-amber-100 text-amber-800' : preset.type === 'incremental' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {preset.type.toUpperCase()}
              </span>
              {selectedPresetId === preset.id && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
            </div>

            <div className="font-bold text-sm text-slate-900">{preset.name}</div>
            <p className="text-xs text-slate-500 leading-relaxed">{preset.description}</p>
          </button>
        ))}
      </div>

      {/* Dynamic Scenario Results Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-teal-900 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="text-xs text-teal-300 font-semibold uppercase tracking-wider">
              Simulation Outcome: {config.name}
            </div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {evaluation.scenarioTotalTCO2e.toFixed(2)} <span className="text-sm font-normal text-teal-200">tCO₂e / year</span>
            </div>
            <div className="text-xs text-teal-200/80 mt-1">
              Baseline: {evaluation.baselineTotalTCO2e.toFixed(2)} tCO₂e &rarr; Saves{' '}
              <span className="font-bold text-emerald-400">-{evaluation.netReductionTCO2e.toFixed(2)} tCO₂e</span> ({evaluation.percentageReduction.toFixed(1)}% decarbonization)
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-teal-200 block">Scenario Per Capita</span>
              <span className="text-xl font-extrabold text-white">{evaluation.scenarioPerCapita.toFixed(4)}</span>
              <span className="text-[10px] text-teal-300 block">tCO₂e/person</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-teal-200 block">Relative Saving</span>
              <span className="text-xl font-extrabold text-emerald-400">{evaluation.percentageReduction.toFixed(1)}%</span>
              <span className="text-[10px] text-teal-300 block">Total Reduction</span>
            </div>
          </div>
        </div>

        {/* Interaction Warnings (Prompt Section 11) */}
        {evaluation.interactionWarnings.length > 0 && (
          <div className="bg-amber-950/80 border border-amber-600/60 p-3 rounded-xl text-xs text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Engineering Interaction & Safety Warning:
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {evaluation.interactionWarnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Interventions Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {evaluation.interventions.map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-300">{item.category}</span>
                <span className="font-mono text-emerald-400 font-bold">-{item.netSavingsTCO2e.toFixed(1)} t</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">{item.description}</p>
              <div className="text-[10px] text-teal-200/60 italic">
                {item.technicalFeasibilityNotes[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Parameter Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Tune Intervention Parameters & Capacities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* 1. Solar Capacity */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              Solar PV Generation
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Rooftop Solar Capacity: {config.solarPV.rooftopKwp} kWp
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={config.solarPV.rooftopKwp}
                onChange={e => setConfig({ ...config, solarPV: { ...config.solarPV, rooftopKwp: Number(e.target.value) } })}
                className="w-full accent-teal-600"
              />
              <span className="text-[10px] text-slate-400">ULAB proposal: 42 kWp (Alfatha et al.)</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Floating Solar PV Capacity: {config.solarPV.floatingKwp} kWp
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={config.solarPV.floatingKwp}
                onChange={e => setConfig({ ...config, solarPV: { ...config.solarPV, floatingKwp: Number(e.target.value) } })}
                className="w-full accent-teal-600"
              />
              <span className="text-[10px] text-slate-400">ULAB proposal: 116.5 kWp (Jawad et al.)</span>
            </div>
          </div>

          {/* 2. AC Coolant Transition */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-teal-600" />
              Coolant & Refrigerant Leakage
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Target Coolant Gas</label>
              <select
                value={config.coolantTransition.targetCoolant}
                onChange={e => setConfig({ ...config, coolantTransition: { ...config.coolantTransition, targetCoolant: e.target.value as any } })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
              >
                <option value="none">Retain Current R-410A / R-22</option>
                <option value="R32">Transition to R-32 (GWP 771)</option>
                <option value="R290">Transition to R-290 Propane (GWP 0.02)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="replaceEquip"
                checked={config.coolantTransition.replaceEquipment}
                onChange={e => setConfig({ ...config, coolantTransition: { ...config.coolantTransition, replaceEquipment: e.target.checked } })}
                className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600"
              />
              <label htmlFor="replaceEquip" className="text-[11px] font-medium text-slate-700 cursor-pointer">
                Replace with compatible equipment (Required for safety)
              </label>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Leak Rate Reduction: {config.coolantTransition.leakReductionPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={config.coolantTransition.leakReductionPercent}
                onChange={e => setConfig({ ...config, coolantTransition: { ...config.coolantTransition, leakReductionPercent: Number(e.target.value) } })}
                className="w-full accent-teal-600"
              />
            </div>
          </div>

          {/* 3. Transport Interventions */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-purple-600" />
              Shared Transport Interventions
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Faculty Shared Minibuses: {config.transportIntervention.facultySharedMinibusCount} (Replaces {config.transportIntervention.facultySharedMinibusCount * 14} cars)
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={config.transportIntervention.facultySharedMinibusCount}
                onChange={e => setConfig({ ...config, transportIntervention: { ...config.transportIntervention, facultySharedMinibusCount: Number(e.target.value) } })}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Minibus Powertrain</label>
              <select
                value={config.transportIntervention.minibusType}
                onChange={e => setConfig({ ...config, transportIntervention: { ...config.transportIntervention, minibusType: e.target.value as any } })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
              >
                <option value="hybrid">CNG/Gasoline Hybrid (37% reduction)</option>
                <option value="electric">Electric Minibus (+Scope 2 charging, zero tailpipe)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Tracking with Feedback Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Institutional Action Tracking & Feedback Loop</h3>
            <p className="text-xs text-slate-500">
              Departmental initiatives, capital cost estimates, target dates, and feedback history.
            </p>
          </div>

          <button
            onClick={() => setShowNewActionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Action Initiative
          </button>
        </div>

        <div className="space-y-3">
          {actions.map((act) => (
            <div key={act.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      act.status === 'completed' ? 'bg-forest-100 text-forest-800' : act.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : act.status === 'approved' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {act.status.toUpperCase()}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{act.title}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Responsible: <span className="font-semibold text-slate-700">{act.responsibleDepartment}</span> • Target: {act.targetCompletionDate}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-emerald-700 font-mono">
                      -{act.estimatedReductionTCO2e} tCO₂e
                    </div>
                    {act.estimatedCostBDT && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        ~৳{(act.estimatedCostBDT / 100000).toFixed(1)} Lakh BDT
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveFeedbackActionId(act.id)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition"
                    title="Add Feedback or Status Update"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">{act.description}</p>

              {/* Feedback Trail */}
              {act.feedbacks.length > 0 && (
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 space-y-1.5 pt-2">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">
                    Institutional Audit Feedback History:
                  </span>
                  {act.feedbacks.map((fb) => (
                    <div key={fb.id} className="text-[11px] text-slate-700 border-l-2 border-teal-500 pl-2">
                      <span className="font-semibold text-teal-900">{fb.author}:</span> {fb.text}{' '}
                      <span className="text-[10px] text-slate-400">({new Date(fb.timestamp).toLocaleDateString()})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Modal */}
      {activeFeedbackActionId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleFeedbackSubmit} className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">Add Feedback / Status Update</h4>
              <button
                type="button"
                onClick={() => setActiveFeedbackActionId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Author / Reviewer</label>
              <input
                type="text"
                value={feedbackAuthor}
                onChange={e => setFeedbackAuthor(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Update Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as ActionStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800"
              >
                <option value="proposed">Proposed</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="measured">Measured (Post-Verification)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Feedback / Action Comment</label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="e.g. Procurement approved; contract signed with solar vendor."
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveFeedbackActionId(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800"
              >
                Save Feedback
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Action Modal */}
      {showNewActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateAction} className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">Add New Climate Action Initiative</h4>
              <button
                type="button"
                onClick={() => setShowNewActionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Action Initiative Title</label>
                <input
                  type="text"
                  value={actionTitle}
                  onChange={e => setActionTitle(e.target.value)}
                  placeholder="e.g. Campus LED retrofit in academic building B"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Scope</label>
                <select
                  value={actionScope}
                  onChange={e => setActionScope(Number(e.target.value) as 1 | 2 | 3)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800"
                >
                  <option value={1}>Scope 1 (Fuels & AC)</option>
                  <option value={2}>Scope 2 (Electricity)</option>
                  <option value={3}>Scope 3 (Commuting/Waste)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Responsible Dept</label>
                <input
                  type="text"
                  value={actionDept}
                  onChange={e => setActionDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Savings (tCO₂e/yr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={actionReduction}
                  onChange={e => setActionReduction(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Budget / Cost (BDT)</label>
                <input
                  type="number"
                  value={actionCost}
                  onChange={e => setActionCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Action Details & Scope</label>
                <textarea
                  rows={3}
                  value={actionDesc}
                  onChange={e => setActionDesc(e.target.value)}
                  placeholder="Detailed technical description and implementation plan"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewActionModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800"
              >
                Create Action
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
