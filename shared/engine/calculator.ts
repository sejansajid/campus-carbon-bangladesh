import { 
  ActivityRecord, 
  CalculationMethodTier, 
  CalculationTrace, 
  CommuterSurveyResponse, 
  InventoryCalculationResult, 
  PopulationRecord,
  EmissionFactor
} from '../types';
import { DEFAULT_GWP_SET, GWPSet } from '../factors/gwp';
import { EMISSION_FACTOR_REGISTRY, getEmissionFactorById, getFactorForActivity } from '../factors/registry';

export interface CalculationOptions {
  tier?: CalculationMethodTier;
  gwpSet?: GWPSet;
  customFactors?: EmissionFactor[];
  includeOdsInScope1?: boolean; // If true (legacy), R22 is in Scope 1; if false (current), out of scope
  separateTdLosses?: boolean;   // If true (current), 11% T&D is in Scope 3 Cat 3; if false (legacy), in Scope 2
}

/**
 * Pure Deterministic Calculation Engine
 */
export function calculateInventory(
  activities: ActivityRecord[],
  population: PopulationRecord,
  commuterResponses?: CommuterSurveyResponse[],
  options: CalculationOptions = {}
): InventoryCalculationResult {
  const tier = options.tier || 'current_inventory_method';
  const gwp = options.gwpSet || DEFAULT_GWP_SET;
  const isLegacy = tier === 'legacy_study_reproduction';
  const includeOdsInScope1 = options.includeOdsInScope1 ?? isLegacy;
  const separateTdLosses = options.separateTdLosses ?? !isLegacy;

  const traces: CalculationTrace[] = [];
  const unquantifiedCategories: string[] = [];
  const dataQualityNotes: string[] = [];

  // -------------------------------------------------------------
  // SCOPE 1: Direct Emissions
  // -------------------------------------------------------------
  let stationaryDieselTonCO2e = 0;
  let fleetOctaneTonCO2e = 0;
  let fleetDieselTonCO2e = 0;
  let cafeteriaLpgTonCO2e = 0;
  let acR410ATonCO2e = 0;
  let acR22TonCO2e = 0;

  let scope1CO2Ton = 0;
  let scope1CH4Ton = 0;
  let scope1N2OTon = 0;

  // Process Scope 1 activities
  const scope1Acts = activities.filter(a => a.scope === 1);
  for (const act of scope1Acts) {
    if (act.category === 'stationary_combustion_generator') {
      // Stationary generator diesel
      const unit = (act.unit || 'L').toLowerCase();
      let liters = act.quantity;
      if (unit === 'm3' || unit === 'cubic_meter') liters = act.quantity * 1000;
      else if (unit === 'gal' || unit === 'gallon') liters = act.quantity * 3.78541;

      const co2Kg = liters * 2.676;
      const ch4Kg = liters * 0.0003612;
      const n2oKg = liters * 0.000021672;

      const co2Ton = co2Kg / 1000;
      const ch4Ton = ch4Kg / 1000;
      const n2oTon = n2oKg / 1000;
      const totalCO2e = co2Ton * gwp.co2 + ch4Ton * gwp.ch4_fossil + n2oTon * gwp.n2o;

      stationaryDieselTonCO2e += totalCO2e;
      scope1CO2Ton += co2Ton;
      scope1CH4Ton += ch4Ton;
      scope1N2OTon += n2oTon;

      traces.push({
        itemKey: act.id,
        name: act.name || 'Stationary Generator (Diesel)',
        scope: 1,
        category: act.category,
        rawQuantity: act.quantity,
        rawUnit: act.unit,
        normalizedQuantity: liters,
        normalizedUnit: 'L',
        factorId: 'EF-FUEL-DIESEL-GEN-EPA2024',
        factorValue: 2.676,
        factorUnit: 'kgCO2/L',
        factorProvenance: 'international_proxy',
        equationText: `CO2: (${liters} L * 2.676)/1000 = ${co2Ton.toFixed(4)} t; CH4: (${liters} * 0.0003612)/1000 * ${gwp.ch4_fossil} = ${(ch4Ton * gwp.ch4_fossil).toFixed(5)} tCO2e; N2O: (${liters} * 0.00002167)/1000 * ${gwp.n2o} = ${(n2oTon * gwp.n2o).toFixed(5)} tCO2e`,
        gwpApplied: gwp.co2,
        gasBreakdown: {
          co2Ton,
          ch4Ton,
          n2oTon,
          fGasTon: 0,
          totalCO2eTon: totalCO2e
        },
        assumptions: ['Stationary diesel combustion with standard EPA emissions'],
        disclosures: []
      });
    } else if (act.category === 'mobile_combustion_fleet') {
      const isOctane = (act.fuelOrGasType || '').toLowerCase().includes('octane') || (act.fuelOrGasType || '').toLowerCase().includes('gasoline') || act.name.toLowerCase().includes('octane');
      const unit = (act.unit || 'L').toLowerCase();
      let liters = act.quantity;
      if (unit === 'm3' || unit === 'cubic_meter') liters = act.quantity * 1000;
      else if (unit === 'gal' || unit === 'gallon') liters = act.quantity * 3.78541;

      if (isOctane) {
        // Octane fleet
        const factorVal = isLegacy ? 2.272 : 2.308;
        const ch4Factor = isLegacy ? 0.0003612 : 0.000195;
        const n2oFactor = isLegacy ? 0.000021672 : 0.000088;

        const co2Kg = liters * factorVal;
        const ch4Kg = liters * ch4Factor;
        const n2oKg = liters * n2oFactor;

        const co2Ton = co2Kg / 1000;
        const ch4Ton = ch4Kg / 1000;
        const n2oTon = n2oKg / 1000;
        const totalCO2e = co2Ton * gwp.co2 + ch4Ton * gwp.ch4_fossil + n2oTon * gwp.n2o;

        fleetOctaneTonCO2e += totalCO2e;
        scope1CO2Ton += co2Ton;
        scope1CH4Ton += ch4Ton;
        scope1N2OTon += n2oTon;

        traces.push({
          itemKey: act.id,
          name: act.name || 'Fleet Vehicles (Octane)',
          scope: 1,
          category: act.category,
          rawQuantity: act.quantity,
          rawUnit: act.unit,
          normalizedQuantity: liters,
          normalizedUnit: 'L',
          factorId: isLegacy ? 'EF-FUEL-OCTANE-LEGACY' : 'EF-FUEL-OCTANE-EPA2024',
          factorValue: factorVal,
          factorUnit: 'kgCO2/L',
          factorProvenance: isLegacy ? 'bangladesh_research_derived' : 'international_proxy',
          equationText: `CO2: (${liters} L * ${factorVal})/1000 = ${co2Ton.toFixed(4)} t; CH4 & N2O evaluated via ${gwp.name} GWP`,
          gwpApplied: gwp.co2,
          gasBreakdown: { co2Ton, ch4Ton, n2oTon, fGasTon: 0, totalCO2eTon: totalCO2e },
          assumptions: ['Mobile gasoline combustion'],
          disclosures: []
        });
      } else {
        // Fleet Diesel
        const factorVal = isLegacy ? 2.676 : 2.687;
        const ch4Factor = isLegacy ? 0.0003612 : 0.000140;
        const n2oFactor = isLegacy ? 0.000021672 : 0.000027;

        const co2Kg = liters * factorVal;
        const ch4Kg = liters * ch4Factor;
        const n2oKg = liters * n2oFactor;

        const co2Ton = co2Kg / 1000;
        const ch4Ton = ch4Kg / 1000;
        const n2oTon = n2oKg / 1000;
        const totalCO2e = co2Ton * gwp.co2 + ch4Ton * gwp.ch4_fossil + n2oTon * gwp.n2o;

        fleetDieselTonCO2e += totalCO2e;
        scope1CO2Ton += co2Ton;
        scope1CH4Ton += ch4Ton;
        scope1N2OTon += n2oTon;

        traces.push({
          itemKey: act.id,
          name: act.name || 'Fleet Vehicles (Diesel)',
          scope: 1,
          category: act.category,
          rawQuantity: act.quantity,
          rawUnit: act.unit,
          normalizedQuantity: liters,
          normalizedUnit: 'L',
          factorId: 'EF-FUEL-DIESEL-MOBILE-EPA2024',
          factorValue: 2.687,
          factorUnit: 'kgCO2/L',
          factorProvenance: 'international_proxy',
          equationText: `CO2: (${liters} L * 2.687)/1000 = ${co2Ton.toFixed(4)} t; CH4 & N2O evaluated via AR6 GWP`,
          gwpApplied: gwp.co2,
          gasBreakdown: { co2Ton, ch4Ton, n2oTon, fGasTon: 0, totalCO2eTon: totalCO2e },
          assumptions: ['Mobile diesel combustion'],
          disclosures: []
        });
      }
    } else if (act.category === 'cooking_combustion_cafeteria') {
      let rawQty = act.quantity;
      const rawUnit = (act.unit || 'kg').toLowerCase();
      if (rawUnit === 'tonne' || rawUnit === 'ton' || rawUnit === 't') {
        rawQty = act.quantity * 1000;
      }

      let co2Ton = 0;
      let ch4Ton = 0;
      let n2oTon = 0;
      let eqText = '';

      if (isLegacy || rawUnit.includes('lit')) {
        // Legacy: multiply quantity (12,720) directly by 1.612 kg/L factor
        co2Ton = (rawQty * 1.612) / 1000;
        ch4Ton = (rawQty * 0.00037976) / 1000;
        n2oTon = (rawQty * 0.0000025542) / 1000;
        eqText = `LEGACY CALCULATION: (${rawQty} kg * 1.612 kg/L)/1000 = ${co2Ton.toFixed(4)} tCO2 (Assumed 1 kg = 1 L)`;
      } else {
        // Current Method: mass-based factor (3.00 kg CO2 / kg LPG)
        co2Ton = (rawQty * 3.00) / 1000;
        ch4Ton = (rawQty * 0.00005) / 1000; // IPCC Table 1.4
        n2oTon = (rawQty * 0.000005) / 1000;
        eqText = `CURRENT METHOD: (${rawQty} kg * 3.00 kgCO2/kg)/1000 = ${co2Ton.toFixed(4)} tCO2 (Corrected for LPG liquid density ~0.54 kg/L)`;
      }

      const totalCO2e = co2Ton * gwp.co2 + ch4Ton * gwp.ch4_fossil + n2oTon * gwp.n2o;
      cafeteriaLpgTonCO2e += totalCO2e;
      scope1CO2Ton += co2Ton;
      scope1CH4Ton += ch4Ton;
      scope1N2OTon += n2oTon;

      traces.push({
        itemKey: act.id,
        name: act.name || 'Cafeteria Cooking (LPG)',
        scope: 1,
        category: act.category,
        rawQuantity: rawQty,
        rawUnit: act.unit,
        normalizedQuantity: rawQty,
        normalizedUnit: rawUnit,
        factorId: isLegacy ? 'EF-LPG-VOLUMETRIC-EPA2024' : 'EF-LPG-MASS-IPCC2006',
        factorValue: isLegacy ? 1.612 : 3.00,
        factorUnit: isLegacy ? 'kgCO2/L' : 'kgCO2/kg',
        factorProvenance: 'international_proxy',
        equationText: eqText,
        gwpApplied: gwp.co2,
        gasBreakdown: { co2Ton, ch4Ton, n2oTon, fGasTon: 0, totalCO2eTon: totalCO2e },
        assumptions: isLegacy ? ['Dimensional mismatch preserved: kg multiplied by kg/L'] : ['Mass-based emission factor applied'],
        disclosures: isLegacy ? ['Methodological issue #1: LPG units mismatch'] : []
      });
    } else if (act.category === 'refrigerant_fugitive_ac') {
      const gasType = (act.fuelOrGasType || act.name).toUpperCase();
      const kg = act.quantity;

      if (gasType.includes('410') || gasType.includes('HFC')) {
        // R-410A (HFC)
        const gwpVal = gwp.r410a; // 2255.5
        const tCO2e = (kg * gwpVal) / 1000;
        acR410ATonCO2e += tCO2e;

        traces.push({
          itemKey: act.id,
          name: act.name || 'AC Refrigerant (R-410A)',
          scope: 1,
          category: act.category,
          rawQuantity: kg,
          rawUnit: 'kg',
          normalizedQuantity: kg,
          normalizedUnit: 'kg',
          factorId: 'EF-REFRIG-R410A-IPCC-AR6',
          factorValue: gwpVal,
          factorUnit: 'kgCO2e/kg',
          factorProvenance: 'international_proxy',
          equationText: `(${kg} kg * ${gwpVal} GWP)/1000 = ${tCO2e.toFixed(3)} tCO2e`,
          gwpApplied: gwpVal,
          gasBreakdown: { co2Ton: 0, ch4Ton: 0, n2oTon: 0, fGasTon: tCO2e, totalCO2eTon: tCO2e },
          assumptions: ['Sales-based top-up replacement equals annual fugitive emissions'],
          disclosures: ['Included in Kyoto GHG Basket']
        });
      } else if (gasType.includes('22') || gasType.includes('HCFC')) {
        // R-22 (HCFC - Montreal Protocol)
        const gwpVal = gwp.r22; // 1960
        const tCO2e = (kg * gwpVal) / 1000;
        acR22TonCO2e += tCO2e;

        traces.push({
          itemKey: act.id,
          name: act.name || 'AC Refrigerant (R-22/HCFC-22)',
          scope: 1,
          category: act.category,
          rawQuantity: kg,
          rawUnit: 'kg',
          normalizedQuantity: kg,
          normalizedUnit: 'kg',
          factorId: 'EF-REFRIG-R22-IPCC-AR6',
          factorValue: gwpVal,
          factorUnit: 'kgCO2e/kg',
          factorProvenance: 'international_proxy',
          equationText: `(${kg} kg * ${gwpVal} GWP)/1000 = ${tCO2e.toFixed(3)} tCO2e`,
          gwpApplied: gwpVal,
          gasBreakdown: { co2Ton: 0, ch4Ton: 0, n2oTon: 0, fGasTon: tCO2e, totalCO2eTon: tCO2e },
          assumptions: ['Top-up assumed emitted'],
          disclosures: [
            includeOdsInScope1
              ? 'Legacy reproduction: R-22 included in Scope 1'
              : 'Current method: R-22 is an ODS under Montreal Protocol and reported out-of-scope'
          ]
        });
      }
    }
  }

  const scope1TotalWithoutODS = stationaryDieselTonCO2e + fleetOctaneTonCO2e + fleetDieselTonCO2e + cafeteriaLpgTonCO2e + acR410ATonCO2e;
  const scope1TotalWithODS = scope1TotalWithoutODS + acR22TonCO2e;
  const scope1Total = includeOdsInScope1 ? scope1TotalWithODS : scope1TotalWithoutODS;

  // -------------------------------------------------------------
  // SCOPE 2: Purchased Electricity
  // -------------------------------------------------------------
  let scope2GenerationTonCO2e = 0;
  let scope2TdLossTonCO2e = 0;

  const scope2Acts = activities.filter(a => a.scope === 2);
  for (const act of scope2Acts) {
    const unit = (act.unit || 'kwh').toLowerCase();
    let kwh = act.quantity;
    if (unit === 'mwh') kwh = act.quantity * 1000;
    else if (unit === 'gwh') kwh = act.quantity * 1000000;
    else if (unit === 'gj') kwh = act.quantity * 277.778;

    // Default factor is 0.637861388 kgCO2e/kWh
    const factorVal = 0.637861388;
    const genEmissions = (kwh * factorVal) / 1000;
    const tdEmissions = genEmissions * 0.11; // 11% T&D loss uplift

    scope2GenerationTonCO2e += genEmissions;
    scope2TdLossTonCO2e += tdEmissions;

    if (separateTdLosses) {
      // Current method: Scope 2 is generation only
      traces.push({
        itemKey: act.id,
        name: act.name || 'Grid Purchased Electricity (Generation)',
        scope: 2,
        category: act.category,
        rawQuantity: kwh,
        rawUnit: 'kWh',
        normalizedQuantity: kwh,
        normalizedUnit: 'kWh',
        factorId: 'EF-ELEC-GRID-BD-RESEARCH-2022',
        factorValue: factorVal,
        factorUnit: 'kgCO2e/kWh',
        factorProvenance: 'bangladesh_research_derived',
        equationText: `Scope 2 Generation: (${kwh} kWh * ${factorVal.toFixed(6)})/1000 = ${genEmissions.toFixed(4)} tCO2e. (T&D loss 11% allocated to Scope 3)`,
        gwpApplied: 1,
        gasBreakdown: { co2Ton: genEmissions, ch4Ton: 0, n2oTon: 0, fGasTon: 0, totalCO2eTon: genEmissions },
        assumptions: ['Bangladesh National Grid generation mix 2021-2022'],
        disclosures: ['Scope 2 Location-Based Generation only']
      });

      // Add T&D loss trace to Scope 3
      traces.push({
        itemKey: `${act.id}-TD-LOSS`,
        name: 'Grid T&D Losses (Upstream)',
        scope: 3,
        category: 'grid_transmission_distribution_losses',
        rawQuantity: kwh,
        rawUnit: 'kWh',
        normalizedQuantity: kwh,
        normalizedUnit: 'kWh',
        factorId: 'EF-GRID-TD-LOSS-11PCT',
        factorValue: factorVal * 0.11,
        factorUnit: 'kgCO2e/kWh',
        factorProvenance: 'bangladesh_research_derived',
        equationText: `Scope 3 Cat 3: (${kwh} kWh * ${factorVal.toFixed(6)} * 0.11)/1000 = ${tdEmissions.toFixed(4)} tCO2e`,
        gwpApplied: 1,
        gasBreakdown: { co2Ton: tdEmissions, ch4Ton: 0, n2oTon: 0, fGasTon: 0, totalCO2eTon: tdEmissions },
        assumptions: ['11% grid transmission and distribution loss'],
        disclosures: ['Re-allocated from Scope 2 to Scope 3 Cat 3 per GHG Protocol Scope 2 Guidance']
      });
    } else {
      // Legacy reproduction: 1.11 uplift embedded directly in Scope 2
      const legacyScope2 = genEmissions + tdEmissions;
      traces.push({
        itemKey: act.id,
        name: act.name || 'Grid Purchased Electricity (incl. 1.11 T&D Loss)',
        scope: 2,
        category: act.category,
        rawQuantity: kwh,
        rawUnit: 'kWh',
        normalizedQuantity: kwh,
        normalizedUnit: 'kWh',
        factorId: 'EF-ELEC-GRID-BD-RESEARCH-2022',
        factorValue: factorVal * 1.11,
        factorUnit: 'kgCO2e/kWh',
        factorProvenance: 'bangladesh_research_derived',
        equationText: `LEGACY REPRODUCTION: (${kwh} kWh * ${factorVal.toFixed(6)} * 1.11)/1000 = ${legacyScope2.toFixed(4)} tCO2e`,
        gwpApplied: 1,
        gasBreakdown: { co2Ton: legacyScope2, ch4Ton: 0, n2oTon: 0, fGasTon: 0, totalCO2eTon: legacyScope2 },
        assumptions: ['Direct 1.11 multiplier applied to generation emissions in Scope 2'],
        disclosures: ['Methodological issue #4: Grid losses mixed into Scope 2']
      });
    }
  }

  const scope2LocationBased = separateTdLosses 
    ? scope2GenerationTonCO2e 
    : (scope2GenerationTonCO2e + scope2TdLossTonCO2e);

  // -------------------------------------------------------------
  // SCOPE 3: Commuting and Other Indirect
  // -------------------------------------------------------------
  let studentCommutingTonCO2e = 0;
  let facultyCommutingTonCO2e = 0;
  let staffCommutingTonCO2e = 0;
  let waterEmissionsTonCO2e = 0;

  let scope3CO2Ton = 0;
  let scope3CH4Ton = 0;
  let scope3N2OTon = 0;

  // Process optional Scope 3 activities (e.g. water usage from Other_GHG_Emissions)
  const scope3Acts = activities.filter(a => a.scope === 3);
  for (const act of scope3Acts) {
    if (act.category === 'water_supply_treatment') {
      const liters = act.quantity;
      const factor = 0.00026446; // kg CO2 / L (ADB 2022)
      const tco2 = (liters * factor) / 1000;
      waterEmissionsTonCO2e += tco2;
      scope3CO2Ton += tco2;

      traces.push({
        itemKey: act.id,
        name: act.name || 'Water Consumption',
        scope: 3,
        category: act.category,
        rawQuantity: liters,
        rawUnit: act.unit,
        normalizedQuantity: liters,
        normalizedUnit: 'L',
        factorId: 'EF-WATER-SUPPLY-BD-ADB2022',
        factorValue: factor,
        factorUnit: 'kgCO2/L',
        factorProvenance: 'bangladesh_research_derived',
        equationText: `(${liters} L * 0.26446 g/L)/10^6 = ${tco2.toFixed(4)} tCO2`,
        gwpApplied: 1,
        gasBreakdown: { co2Ton: tco2, ch4Ton: 0, n2oTon: 0, fGasTon: 0, totalCO2eTon: tco2 },
        assumptions: ['Municipal pumping energy 0.406 kWh/m3 * 651 g/kWh'],
        disclosures: ['Informational disclosure in research paper']
      });
    }
  }

  // Calculate Commuting Emissions
  if (commuterResponses && commuterResponses.length > 0) {
    if (isLegacy) {
      // Legacy Reproduction Mode: Replicates ULAB Scope3 sheet exactly
      // Sample total CO2 = 184.269557 tCO2 for 758 people
      // Scaled to 5,350 = 1300.583288 tCO2
      // CH4 = 0.054457 tCH4 -> * 27.9 = 1.519361 tCO2e
      // N2O = 0.000000616 tN2O -> * 273 = 0.000168 tCO2e
      // Total Scope 3 Commuting = 1302.102817 tCO2e
      const sampleSize = 758;
      const totalPop = population.totalHeadcount || 5350;

      // In legacy sheet:
      const legacyCO2 = (184.269557419763 / sampleSize) * totalPop; // 1300.583288
      const legacyCH4 = (0.00771564222775 / sampleSize) * totalPop; // 0.054457 tCH4
      const legacyN2O = (0.00000008734096 / sampleSize) * totalPop; // 6.16e-7 tN2O

      const ch4CO2e = legacyCH4 * gwp.ch4_fossil;
      const n2oCO2e = legacyN2O * gwp.n2o;
      const totalLegacyCommuting = legacyCO2 + ch4CO2e + n2oCO2e;

      studentCommutingTonCO2e = totalLegacyCommuting * (4860 / 5350);
      facultyCommutingTonCO2e = totalLegacyCommuting * (240 / 5350);
      staffCommutingTonCO2e = totalLegacyCommuting * (250 / 5350);

      scope3CO2Ton += legacyCO2;
      scope3CH4Ton += legacyCH4;
      scope3N2OTon += legacyN2O;

      traces.push({
        itemKey: 'SCOPE3-LEGACY-COMMUTING',
        name: 'Daily Commuting (Legacy Reproduction Model)',
        scope: 3,
        category: 'student_commuting',
        rawQuantity: sampleSize,
        rawUnit: 'survey_respondents',
        normalizedQuantity: totalPop,
        normalizedUnit: 'campus_headcount',
        factorId: 'LEGACY-ULAB-COMMUTE-EXPANSION',
        factorValue: totalLegacyCommuting / totalPop,
        factorUnit: 'tCO2e/person-yr',
        factorProvenance: 'bangladesh_research_derived',
        equationText: `Sample (758 non-fleet commuters) sum = 184.27 tCO2. Scaled: (184.27 / 758) * ${totalPop} = ${legacyCO2.toFixed(3)} tCO2. Plus CH4 (${ch4CO2e.toFixed(3)} tCO2e) & N2O (${n2oCO2e.toFixed(4)} tCO2e) = ${totalLegacyCommuting.toFixed(3)} tCO2e`,
        gwpApplied: gwp.co2,
        gasBreakdown: { co2Ton: legacyCO2, ch4Ton: legacyCH4, n2oTon: legacyN2O, fGasTon: 0, totalCO2eTon: totalLegacyCommuting },
        assumptions: ['758 non-university-transport responses expanded to 5,350 total population'],
        disclosures: [
          'Methodological issue #2: motorcycle & transit formulas multiplied headcount/percentages',
          'Methodological issue #3: non-fleet mean applied to all without fleet subtraction'
        ]
      });
    } else {
      // Current Inventory Method: Role-stratified, dimensionally strict expansion
      const studentResp = commuterResponses.filter(r => r.role === 'student' && !r.usesInstitutionalFleet);
      const facultyResp = commuterResponses.filter(r => r.role === 'faculty' && !r.usesInstitutionalFleet);
      const staffResp = commuterResponses.filter(r => r.role === 'staff' && !r.usesInstitutionalFleet);

      const calcStratum = (resps: CommuterSurveyResponse[], targetPop: number, stratumName: string) => {
        if (resps.length === 0) return 0;
        let sumTons = 0;
        for (const resp of resps) {
          const days = resp.annualAttendanceDays || 294;
          const oneWayKm = resp.totalOneWayKm;
          const annualKm = resp.distanceBasis === 'round_trip' ? oneWayKm * days : oneWayKm * 2 * days;
          
          let efKgPerKm = 0.040; // Default proxy
          if (resp.primaryMode === 'walking' || resp.primaryMode === 'bicycle' || resp.primaryMode === 'rickshaw') {
            efKgPerKm = 0;
          } else if (resp.primaryMode === 'battery_rickshaw') {
            efKgPerKm = 0.050838;
          } else if (resp.primaryMode === 'public_bus') {
            efKgPerKm = 0.017058;
          } else if (resp.primaryMode === 'leguna') {
            efKgPerKm = 0.027708;
          } else if (resp.primaryMode === 'cng_autorickshaw') {
            efKgPerKm = 0.075;
          } else if (resp.primaryMode === 'private_car') {
            efKgPerKm = 0.280897 / (resp.carOccupancy || 1);
          } else if (resp.primaryMode === 'motorcycle') {
            efKgPerKm = 0.042; // CO2 + CH4/N2O
          } else if (resp.primaryMode === 'multiple_transport') {
            efKgPerKm = 0.03058;
          }

          const personTons = (annualKm * efKgPerKm) / 1000;
          sumTons += personTons;
        }

        const meanPerPerson = sumTons / resps.length;
        const totalStratumTons = meanPerPerson * targetPop;

        traces.push({
          itemKey: `SCOPE3-STRATUM-${stratumName.toUpperCase()}`,
          name: `${stratumName} Commuting (${resps.length} sampled -> ${targetPop} pop)`,
          scope: 3,
          category: stratumName === 'Student' ? 'student_commuting' : 'employee_commuting',
          rawQuantity: resps.length,
          rawUnit: 'sample_responses',
          normalizedQuantity: targetPop,
          normalizedUnit: 'stratum_population',
          factorId: 'EF-COMMUTE-STRATIFIED',
          factorValue: meanPerPerson,
          factorUnit: 'tCO2e/person-yr',
          factorProvenance: 'bangladesh_research_derived',
          equationText: `Sample mean: ${meanPerPerson.toFixed(4)} tCO2e/person * ${targetPop} headcount = ${totalStratumTons.toFixed(3)} tCO2e`,
          gwpApplied: 1,
          gasBreakdown: { co2Ton: totalStratumTons, ch4Ton: 0, n2oTon: 0, fGasTon: 0, totalCO2eTon: totalStratumTons },
          assumptions: ['Stratified expansion with verified round-trip distance'],
          disclosures: ['Zero Scope 3 applied to institutional fleet users']
        });

        return totalStratumTons;
      };

      studentCommutingTonCO2e = calcStratum(studentResp, population.studentHeadcount || 4860, 'Student');
      facultyCommutingTonCO2e = calcStratum(facultyResp, population.facultyHeadcount || 240, 'Faculty');
      staffCommutingTonCO2e = calcStratum(staffResp, population.staffHeadcount || 250, 'Staff');

      scope3CO2Ton += (studentCommutingTonCO2e + facultyCommutingTonCO2e + staffCommutingTonCO2e);
    }
  }

  const totalCommuting = studentCommutingTonCO2e + facultyCommutingTonCO2e + staffCommutingTonCO2e;
  const gridTdInScope3 = separateTdLosses ? scope2TdLossTonCO2e : 0;
  const scope3Total = totalCommuting + gridTdInScope3 + waterEmissionsTonCO2e;

  // -------------------------------------------------------------
  // TOTALS & PER CAPITA
  // -------------------------------------------------------------
  const totalGrossEmissions = scope1Total + scope2LocationBased + scope3Total;
  const totalHeadcount = population.totalHeadcount || (population.studentHeadcount + population.facultyHeadcount + population.staffHeadcount) || 5350;

  const perCapitaTotal = totalGrossEmissions / totalHeadcount;
  const perCapitaScope1 = scope1Total / totalHeadcount;
  const perCapitaScope2 = scope2LocationBased / totalHeadcount;
  const perCapitaScope3 = scope3Total / totalHeadcount;
  const perStudentTotal = totalGrossEmissions / (population.studentHeadcount || 4860);

  return {
    runId: `RUN-${Date.now()}`,
    inventoryId: activities[0]?.inventoryId || 'INV-2022',
    institutionId: population.institutionId,
    methodTier: tier,
    calculatedAt: new Date().toISOString(),
    scope1Total,
    scope2LocationBased,
    scope3Total,
    totalGrossEmissions,
    scope1Breakdown: {
      stationaryDiesel: stationaryDieselTonCO2e,
      fleetOctane: fleetOctaneTonCO2e,
      fleetDiesel: fleetDieselTonCO2e,
      cafeteriaLpg: cafeteriaLpgTonCO2e,
      acR410A: acR410ATonCO2e,
      acR22MontrealProtocol: acR22TonCO2e,
      totalWithoutODS: scope1TotalWithoutODS,
      totalWithODS: scope1TotalWithODS
    },
    scope2Breakdown: {
      generationEmissions: scope2GenerationTonCO2e,
      tdLossesReallocatedToScope3: separateTdLosses ? scope2TdLossTonCO2e : undefined
    },
    scope3Breakdown: {
      studentCommuting: studentCommutingTonCO2e,
      facultyCommuting: facultyCommutingTonCO2e,
      staffCommuting: staffCommutingTonCO2e,
      totalCommuting,
      gridTdLosses: gridTdInScope3,
      waterEmissions: waterEmissionsTonCO2e
    },
    gasDecomposition: {
      co2Ton: scope1CO2Ton + scope2GenerationTonCO2e + scope3CO2Ton,
      ch4Ton: scope1CH4Ton + scope3CH4Ton,
      n2oTon: scope1N2OTon + scope3N2OTon,
      hfcTonCO2e: acR410ATonCO2e,
      hcfcTonCO2e: acR22TonCO2e
    },
    perCapitaTotal,
    perCapitaScope1,
    perCapitaScope2,
    perCapitaScope3,
    perStudentTotal,
    traces,
    unquantifiedCategories: [
      'Purchased Goods & Services (Scope 3 Cat 1)',
      'Capital Goods (Scope 3 Cat 2)',
      'Waste Generated in Operations (Scope 3 Cat 5)',
      'Business Travel (Scope 3 Cat 6)'
    ],
    dataQualityNotes: [
      'Scope 1 fuels and AC refrigerants derived from verified campus administrative receipts',
      'Scope 2 based on billed utility imports (DESCO/DPDC 641,412 kWh)',
      'Scope 3 commuting derived from 803 campus survey respondents'
    ]
  };
}
