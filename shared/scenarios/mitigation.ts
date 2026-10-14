import { InventoryCalculationResult, MitigationScenarioConfig } from '../types';

export interface ScenarioCalculationResult {
  scenarioId: string;
  name: string;
  type: string;
  baselineTotalTCO2e: number;
  scenarioTotalTCO2e: number;
  netReductionTCO2e: number;
  percentageReduction: number;
  
  scope1Baseline: number;
  scope1Scenario: number;
  scope1Reduction: number;
  
  scope2Baseline: number;
  scope2Scenario: number;
  scope2Reduction: number;
  
  scope3Baseline: number;
  scope3Scenario: number;
  scope3Reduction: number;
  
  scenarioPerCapita: number;
  outOfScopeOdsBaseline?: number;
  outOfScopeOdsSavings?: number;
  
  interventions: {
    category: string;
    description: string;
    scopeAffected: 1 | 2 | 3;
    grossSavingsTCO2e: number;
    crossScopeAdditionTCO2e: number; // e.g. EV charging in Scope 2
    netSavingsTCO2e: number;
    technicalFeasibilityNotes: string[];
  }[];
  
  interactionWarnings: string[];
}

export function evaluateMitigationScenario(
  baseline: InventoryCalculationResult,
  config: MitigationScenarioConfig,
  totalHeadcount: number = 5350
): ScenarioCalculationResult {
  const warnings: string[] = [];
  const interventions: ScenarioCalculationResult['interventions'] = [];

  let scope1Savings = 0;
  let scope2Savings = 0;
  let scope2Additions = 0;
  let scope3Savings = 0;

  const includesOdsInScope1 = Boolean(
    baseline.scope1Total && 
    baseline.scope1Breakdown.totalWithODS && 
    Math.abs(baseline.scope1Total - baseline.scope1Breakdown.totalWithODS) < 0.01
  );

  let outOfScopeOdsBaseline = 0;
  let outOfScopeOdsSavings = 0;

  // 1. COOLANT TRANSITION & AC LEAK REDUCTION (SCOPE 1)
  if (config.coolantTransition.enabled) {
    const inScopeAcBaseline = includesOdsInScope1
      ? (baseline.scope1Breakdown.acR410A + (baseline.scope1Breakdown.acR22MontrealProtocol || 0))
      : baseline.scope1Breakdown.acR410A;
    
    outOfScopeOdsBaseline = !includesOdsInScope1 ? (baseline.scope1Breakdown.acR22MontrealProtocol || 0) : 0;

    if (inScopeAcBaseline > 0 || outOfScopeOdsBaseline > 0) {
      if (!config.coolantTransition.replaceEquipment && (config.coolantTransition.targetCoolant === 'R32' || config.coolantTransition.targetCoolant === 'R290')) {
        warnings.push('CRITICAL: R-32 or R-290 cannot be dropped into existing R-22/R-410A compressors due to operating pressure and A2L flammability differences. Equipment replacement must be specified.');
      }

      // R32 has GWP 771 vs R410A GWP 2255.5 (~65.8% reduction)
      const gwpFactorReduction = config.coolantTransition.targetCoolant === 'R32' ? (1 - 771 / 2255.5) : 0.99;
      const leakReduction = config.coolantTransition.leakReductionPercent / 100;
      
      const effectiveSavingRatio = 1 - (1 - gwpFactorReduction) * (1 - leakReduction);
      const inScopeSavings = inScopeAcBaseline * effectiveSavingRatio;
      scope1Savings += inScopeSavings;

      if (outOfScopeOdsBaseline > 0) {
        outOfScopeOdsSavings = outOfScopeOdsBaseline * effectiveSavingRatio;
      }

      interventions.push({
        category: 'Cooling / HVAC Refrigerants',
        description: `Transition to ${config.coolantTransition.targetCoolant} with ${config.coolantTransition.leakReductionPercent}% leak reduction`,
        scopeAffected: 1,
        grossSavingsTCO2e: inScopeSavings,
        crossScopeAdditionTCO2e: 0,
        netSavingsTCO2e: inScopeSavings,
        technicalFeasibilityNotes: [
          config.coolantTransition.replaceEquipment 
            ? 'Compatible heat pumps/inverters with A2L ventilation installed' 
            : 'WARNING: Compressor retrofit required for safety certification',
          outOfScopeOdsSavings > 0
            ? `Separately disclosed Montreal Protocol ODS abatement: ${outOfScopeOdsSavings.toFixed(2)} tCO2e phased out (reported in memo item, not deducted from Scope 1)`
            : 'Enforces mechanical room safety protocols'
        ]
      });
    }
  }

  // 2. ENERGY EFFICIENCY (HVAC + LIGHTING) APPLIED BEFORE SOLAR (SCOPE 2)
  let remainingElectricityDemandTCO2e = baseline.scope2LocationBased;
  if (config.energyEfficiency.hvacOptimizationPercent > 0 || config.energyEfficiency.ledLightingPercent > 0) {
    const efficiencyFraction = (config.energyEfficiency.hvacOptimizationPercent + config.energyEfficiency.ledLightingPercent) / 100;
    const efficiencySavings = baseline.scope2LocationBased * efficiencyFraction;
    
    scope2Savings += efficiencySavings;
    remainingElectricityDemandTCO2e -= efficiencySavings;

    interventions.push({
      category: 'Energy Efficiency (HVAC & LED)',
      description: `HVAC setpoint optimization (${config.energyEfficiency.hvacOptimizationPercent}%) + LED lighting retrofits (${config.energyEfficiency.ledLightingPercent}%)`,
      scopeAffected: 2,
      grossSavingsTCO2e: efficiencySavings,
      crossScopeAdditionTCO2e: 0,
      netSavingsTCO2e: efficiencySavings,
      technicalFeasibilityNotes: [
        'Applied prior to sizing solar self-consumption to prevent double-counting savings'
      ]
    });
  }

  // 3. SOLAR PV GENERATION (ROOFTOP + FLOATING) (SCOPE 2)
  if (config.solarPV.rooftopKwp > 0 || config.solarPV.floatingKwp > 0) {
    const rooftopKwh = config.solarPV.rooftopKwp * (config.solarPV.rooftopYieldKwhPerKwp || 1577);
    const floatingKwh = config.solarPV.floatingKwp * (config.solarPV.floatingYieldKwhPerKwp || 1450);
    const totalSolarGeneratedKwh = rooftopKwh + floatingKwh;
    
    // Self-consumption ratio
    const selfConsumedKwh = totalSolarGeneratedKwh * (config.solarPV.selfConsumptionRatio || 0.95);
    const gridFactor = 0.637861; // kgCO2e/kWh
    
    // Cannot reduce more than remaining demand
    const potentialSolarAvoidedTCO2e = (selfConsumedKwh * gridFactor) / 1000;
    const actualSolarSavings = Math.min(potentialSolarAvoidedTCO2e, remainingElectricityDemandTCO2e);
    
    scope2Savings += actualSolarSavings;
    remainingElectricityDemandTCO2e -= actualSolarSavings;

    interventions.push({
      category: 'On-Site Renewable Solar PV',
      description: `${config.solarPV.rooftopKwp} kWp Rooftop + ${config.solarPV.floatingKwp} kWp Floating PV (${(totalSolarGeneratedKwh / 1000).toFixed(1)} MWh/yr, ${(config.solarPV.selfConsumptionRatio * 100).toFixed(0)}% self-consumed)`,
      scopeAffected: 2,
      grossSavingsTCO2e: actualSolarSavings,
      crossScopeAdditionTCO2e: 0,
      netSavingsTCO2e: actualSolarSavings,
      technicalFeasibilityNotes: [
        `Self-consumption capped against remaining demand: ${actualSolarSavings.toFixed(2)} tCO2e offset`,
        config.solarPV.floatingKwp > 0 ? 'Requires institutional water body access and environmental anchoring survey' : 'Rooftop structural loading inspection verified'
      ]
    });
  }

  // 4. TRANSPORT INTERVENTIONS (COMMUTING SCOPE 3 -> FLEET / GRID)
  if (config.transportIntervention.facultySharedMinibusCount > 0) {
    // Replaces 14 individual private cars per minibus (each car ~1.64 tCO2e/yr = ~23.0 tCO2e)
    const carsReplaced = config.transportIntervention.facultySharedMinibusCount * 14;
    const privateCarEmissionsAvoided = carsReplaced * 1.64; // ~22.96 tCO2e

    if (config.transportIntervention.minibusType === 'hybrid') {
      // Hybrid minibus emits ~37% less than individual cars
      const hybridMinibusEmissions = privateCarEmissionsAvoided * 0.63; // ~14.46 tCO2e
      const netSavings = privateCarEmissionsAvoided - hybridMinibusEmissions;
      scope3Savings += netSavings;

      interventions.push({
        category: 'Shared Transportation',
        description: `Shared Hybrid Minibus for ${carsReplaced} faculty members (CNG/Gasoline hybrid)`,
        scopeAffected: 3,
        grossSavingsTCO2e: privateCarEmissionsAvoided,
        crossScopeAdditionTCO2e: hybridMinibusEmissions,
        netSavingsTCO2e: netSavings,
        technicalFeasibilityNotes: [
          'Calculated using 20 km/day route with 80% CNG and 20% gasoline mix'
        ]
      });
    } else {
      // Electric Minibus: Avoids 100% tailpipe Scope 3, but adds to Scope 2 Grid Electricity
      const evEfficiencyKwhPerKm = 0.8; // kWh/km for 14-seater electric minibus
      const annualDistanceKm = 20 * 294; // 5,880 km/year
      const chargingKwh = annualDistanceKm * evEfficiencyKwhPerKm * config.transportIntervention.facultySharedMinibusCount;
      const chargingEmissionsScope2 = (chargingKwh * 0.637861) / 1000; // ~3.0 tCO2e added to Scope 2

      scope3Savings += privateCarEmissionsAvoided;
      scope2Additions += chargingEmissionsScope2;

      interventions.push({
        category: 'Shared Transportation (Electric)',
        description: `Shared Electric Minibus for ${carsReplaced} faculty members (Zero tailpipe Scope 3)`,
        scopeAffected: 3,
        grossSavingsTCO2e: privateCarEmissionsAvoided,
        crossScopeAdditionTCO2e: chargingEmissionsScope2,
        netSavingsTCO2e: privateCarEmissionsAvoided - chargingEmissionsScope2,
        technicalFeasibilityNotes: [
          `Adds ${(chargingKwh / 1000).toFixed(1)} MWh charging demand (+${chargingEmissionsScope2.toFixed(2)} tCO2e in Scope 2)`,
          'Net overall lifecycle reduction of ~87% relative to private car baseline'
        ]
      });
    }
  }

  // Calculate Scenario Totals
  const scope1Scenario = Math.max(0, baseline.scope1Total - scope1Savings);
  const scope2Scenario = Math.max(0, baseline.scope2LocationBased - scope2Savings + scope2Additions);
  const scope3Scenario = Math.max(0, baseline.scope3Total - scope3Savings);

  const scenarioTotalTCO2e = scope1Scenario + scope2Scenario + scope3Scenario;
  const netReductionTCO2e = baseline.totalGrossEmissions - scenarioTotalTCO2e;
  const percentageReduction = (netReductionTCO2e / baseline.totalGrossEmissions) * 100;
  const scenarioPerCapita = scenarioTotalTCO2e / totalHeadcount;

  return {
    scenarioId: config.id,
    name: config.name,
    type: config.type,
    baselineTotalTCO2e: baseline.totalGrossEmissions,
    scenarioTotalTCO2e,
    netReductionTCO2e,
    percentageReduction,
    scope1Baseline: baseline.scope1Total,
    scope1Scenario,
    scope1Reduction: scope1Savings,
    scope2Baseline: baseline.scope2LocationBased,
    scope2Scenario,
    scope2Reduction: scope2Savings - scope2Additions,
    scope3Baseline: baseline.scope3Total,
    scope3Scenario,
    scope3Reduction: scope3Savings,
    scenarioPerCapita,
    outOfScopeOdsBaseline,
    outOfScopeOdsSavings,
    interventions,
    interactionWarnings: warnings
  };
}

export const PRESET_SCENARIOS: MitigationScenarioConfig[] = [
  {
    id: 'SCENARIO-CONVENTIONAL',
    name: 'Conventional Scenario',
    type: 'conventional',
    description: 'Operational awareness, setpoint adjustments (25°C HVAC), and routine leak inspections.',
    coolantTransition: {
      enabled: true,
      targetCoolant: 'none',
      replaceEquipment: false,
      leakReductionPercent: 20 // 20% leak reduction from routine maintenance
    },
    solarPV: {
      rooftopKwp: 0,
      floatingKwp: 0,
      rooftopYieldKwhPerKwp: 1577,
      floatingYieldKwhPerKwp: 1450,
      selfConsumptionRatio: 0.95
    },
    transportIntervention: {
      facultySharedMinibusCount: 0,
      minibusType: 'hybrid',
      evChargingGridSource: false,
      modalShiftWalkCyclePercent: 5
    },
    energyEfficiency: {
      hvacOptimizationPercent: 5,
      ledLightingPercent: 5
    }
  },
  {
    id: 'SCENARIO-INCREMENTAL',
    name: 'Incremental Scenario',
    type: 'incremental',
    description: 'Transition to R-32 AC units, 42 kWp Rooftop Solar, and Shared Hybrid Minibus for 14 faculty members.',
    coolantTransition: {
      enabled: true,
      targetCoolant: 'R32',
      replaceEquipment: true,
      leakReductionPercent: 40
    },
    solarPV: {
      rooftopKwp: 42,
      floatingKwp: 0,
      rooftopYieldKwhPerKwp: 1577, // Alfatha et al. proposal: 66.225 MWh/yr
      floatingYieldKwhPerKwp: 1450,
      selfConsumptionRatio: 0.98
    },
    transportIntervention: {
      facultySharedMinibusCount: 1, // Replaces 14 faculty cars
      minibusType: 'hybrid',
      evChargingGridSource: false,
      modalShiftWalkCyclePercent: 10
    },
    energyEfficiency: {
      hvacOptimizationPercent: 10,
      ledLightingPercent: 10
    }
  },
  {
    id: 'SCENARIO-COMPREHENSIVE',
    name: 'Comprehensive Scenario',
    type: 'comprehensive',
    description: 'Full decarbonization pathway: Low-GWP cooling, 42 kWp Rooftop + 116.5 kWp Floating Solar, Shared Electric Minibus fleet, and campus mode shift.',
    coolantTransition: {
      enabled: true,
      targetCoolant: 'R32',
      replaceEquipment: true,
      leakReductionPercent: 60
    },
    solarPV: {
      rooftopKwp: 42,
      floatingKwp: 116.5, // Jawad et al.: 169 MWh/yr floating solar
      rooftopYieldKwhPerKwp: 1577,
      floatingYieldKwhPerKwp: 1450,
      selfConsumptionRatio: 0.95
    },
    transportIntervention: {
      facultySharedMinibusCount: 2, // 2 Electric minibuses replacing 28 cars
      minibusType: 'electric',
      evChargingGridSource: true,
      modalShiftWalkCyclePercent: 20
    },
    energyEfficiency: {
      hvacOptimizationPercent: 15,
      ledLightingPercent: 15
    }
  }
];
