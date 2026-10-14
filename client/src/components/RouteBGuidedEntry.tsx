import React, { useState } from 'react';
import { 
  Layers, 
  Flame, 
  Zap, 
  Car, 
  Wind, 
  Utensils, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  Info
} from 'lucide-react';
import { ScopeNumber, ScopeCategory, ActivityRecord } from '../../../shared/types';
import { Language, t } from '../../../shared/i18n';

interface RouteBGuidedEntryProps {
  institutionId: string;
  onAddActivity: (act: Partial<ActivityRecord>) => Promise<void>;
  lang: Language;
}

export const RouteBGuidedEntry: React.FC<RouteBGuidedEntryProps> = ({
  institutionId,
  onAddActivity,
  lang
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [category, setCategory] = useState<ScopeCategory>('stationary_combustion_generator');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('L');
  const [fuelOrGas, setFuelOrGas] = useState('Diesel');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Formula previews
  const getPreviewEmissions = () => {
    if (category === 'stationary_combustion_generator') {
      return ((quantity * 2.676) / 1000).toFixed(3);
    }
    if (category === 'mobile_combustion_fleet') {
      const isOctane = fuelOrGas.toLowerCase().includes('octane') || fuelOrGas.toLowerCase().includes('gasoline');
      return ((quantity * (isOctane ? 2.308 : 2.687)) / 1000).toFixed(3);
    }
    if (category === 'cooking_combustion_cafeteria') {
      // 3.00 kg CO2 / kg LPG or 1.612 kg CO2 / L
      const factor = unit.toLowerCase().includes('lit') ? 1.612 : 3.00;
      return ((quantity * factor) / 1000).toFixed(3);
    }
    if (category === 'refrigerant_fugitive_ac') {
      const gwp = fuelOrGas.includes('410') ? 2255.5 : 1960;
      return ((quantity * gwp) / 1000).toFixed(3);
    }
    if (category === 'purchased_electricity_grid') {
      return ((quantity * 0.637861) / 1000).toFixed(3);
    }
    return (0).toFixed(3);
  };

  const handleCategoryPreset = (cat: ScopeCategory, defaultUnit: string, defaultFuel: string, defaultName: string) => {
    setCategory(cat);
    setUnit(defaultUnit);
    setFuelOrGas(defaultFuel);
    setName(defaultName);
    setQuantity(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    setSaving(true);
    setSuccessMsg('');

    const scope: ScopeNumber = category.includes('electricity') ? 2 : (category.includes('commuting') || category.includes('water') ? 3 : 1);

    try {
      await onAddActivity({
        institutionId,
        campusId: 'CAMPUS-MAIN',
        inventoryId: 'INV-2022',
        scope,
        category,
        sourceOrAssetId: `ASSET-${Date.now()}`,
        name: name || `${category} Record`,
        periodStart: '2022-01-01',
        periodEnd: '2022-12-31',
        quantity: Number(quantity),
        unit,
        fuelOrGasType: fuelOrGas,
        isMonthly: false,
        dataQualityTier: 'billed',
        notes
      });

      setSuccessMsg(`Successfully logged ${quantity} ${unit} of ${name || category}!`);
      setQuantity(0);
      setNotes('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save activity record:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-700" />
          Route B — Guided Question Data Entry
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Step-by-step entry for independently collected data, utility bills, generator fuel logbooks, and maintenance receipts.
          Live calculation traces reveal exact emission factors and unit conversions in real time.
        </p>
      </div>

      {/* Step Selector */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => { setActiveStep(1); handleCategoryPreset('stationary_combustion_generator', 'L', 'Diesel', 'Campus Backup Generator'); }}
          className={`p-3.5 rounded-xl border text-left transition ${
            activeStep === 1
              ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-600" />
            Step 1: Scope 1 Direct Fuels & AC
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Generators, Fleet, LPG, Refrigerants</div>
        </button>

        <button
          onClick={() => { setActiveStep(2); handleCategoryPreset('purchased_electricity_grid', 'kWh', 'Grid Electricity', 'Main Campus Grid Import'); }}
          className={`p-3.5 rounded-xl border text-left transition ${
            activeStep === 2
              ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-bold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-600" />
            Step 2: Scope 2 Electricity
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Utility billing (DESCO, DPDC, BREB)</div>
        </button>

        <button
          onClick={() => { setActiveStep(3); handleCategoryPreset('water_supply_treatment', 'L', 'Water', 'Municipal Water Consumption'); }}
          className={`p-3.5 rounded-xl border text-left transition ${
            activeStep === 3
              ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-bold flex items-center gap-1.5">
            <Car className="w-4 h-4 text-purple-600" />
            Step 3: Scope 3 Indirect Sources
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Water, commuting totals, waste</div>
        </button>
      </div>

      {/* Preset Quick Tabs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-900">Select Activity Category Preset</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {activeStep === 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handleCategoryPreset('stationary_combustion_generator', 'L', 'Diesel', 'Campus Backup Generator')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${category === 'stationary_combustion_generator' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                >
                  Generator Diesel
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryPreset('mobile_combustion_fleet', 'L', 'Octane', 'Staff Van Octane Fuel')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${category === 'mobile_combustion_fleet' && fuelOrGas === 'Octane' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                >
                  Fleet Vehicles (Octane)
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryPreset('mobile_combustion_fleet', 'L', 'Diesel', 'Campus Bus Diesel Fuel')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${category === 'mobile_combustion_fleet' && fuelOrGas === 'Diesel' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                >
                  Fleet Vehicles (Diesel)
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryPreset('cooking_combustion_cafeteria', 'kg', 'LPG', 'Main Cafeteria Cooking')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${category === 'cooking_combustion_cafeteria' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                >
                  Cafeteria LPG
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryPreset('refrigerant_fugitive_ac', 'kg', 'R-410A', 'Central AC Top-Up (R-410A)')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${category === 'refrigerant_fugitive_ac' && fuelOrGas === 'R-410A' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                >
                  AC R-410A (HFC)
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryPreset('refrigerant_fugitive_ac', 'kg', 'R-22', 'Split AC Top-Up (R-22 ODS)')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${category === 'refrigerant_fugitive_ac' && fuelOrGas === 'R-22' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                >
                  AC R-22 (HCFC ODS)
                </button>
              </>
            )}

            {activeStep === 2 && (
              <button
                type="button"
                onClick={() => handleCategoryPreset('purchased_electricity_grid', 'kWh', 'Grid Electricity', 'Utility Grid Electricity')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-blue-600 text-white border-blue-600"
              >
                Grid Imported Electricity (kWh)
              </button>
            )}

            {activeStep === 3 && (
              <button
                type="button"
                onClick={() => handleCategoryPreset('water_supply_treatment', 'L', 'Water', 'Municipal Water Consumption')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-purple-600 text-white border-purple-600"
              >
                Water Consumption (Liters)
              </button>
            )}
          </div>
        </div>

        {/* Guided Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset / Equipment Description</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. 500kVA Cummins Backup Generator"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fuel / Gas Specific Type</label>
              <input
                type="text"
                value={fuelOrGas}
                onChange={e => setFuelOrGas(e.target.value)}
                placeholder="Diesel, Octane, LPG, R-410A, R-22"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consumed Quantity (Annual or Period)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={quantity || ''}
                onChange={e => setQuantity(Number(e.target.value))}
                placeholder="e.g. 9112.84"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Measurement Unit</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                <option value="L">Liters (L)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="kWh">Kilowatt-hours (kWh)</option>
                <option value="m3">Cubic Meters (m³)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Evidence Reference / Audit Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Invoice #2022-GEN-04, DESCO utility account 401928"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          </div>

          {/* Live Dynamic Preview Callout */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                Deterministic Calculation Preview
              </div>
              <div className="text-[11px] text-slate-500">
                Formula: {quantity > 0 ? `${quantity} ${unit} evaluated via reviewed registry factor` : 'Enter quantity to preview'}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Estimated Impact:</span>
              <div className="text-xl font-extrabold text-teal-800">
                {getPreviewEmissions()} <span className="text-xs font-normal text-slate-500">tCO₂e</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            {successMsg ? (
              <span className="text-forest-700 font-semibold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-forest-600" />
                {successMsg}
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={saving || quantity <= 0}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {saving ? 'Saving...' : 'Add Activity Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
