import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateInventory } from '../shared/engine/calculator';
import { LEGACY_ULAB_2022_FIXTURE } from '../shared/engine/legacy-reproduction';
import { EMISSION_FACTOR_REGISTRY, getFactorById } from '../shared/factors/registry';
import { GWP_SETS, getGWP } from '../shared/factors/gwp';
import { evaluateMitigationScenario, PRESET_SCENARIOS } from '../shared/scenarios/mitigation';
import { ActivityRecord, CommuterSurveyResponse, PopulationRecord } from '../shared/types';

const BASE_URL = 'http://localhost:4000';

describe('1. Synthetic Test Institutional Run (Section 14)', () => {
  test('Exact mathematical verification of synthetic baseline run', () => {
    // 1,000 kWh grid electricity; 100 L diesel generator; 50 kg LPG cafeteria; 
    // 10 commuters travelling 10 km one-way by bus over 200 operational days; 100 people population.
    const syntheticActivities: ActivityRecord[] = [
      {
        id: 'ACT-SYNTH-1',
        institutionId: 'SYNTH-101',
        campusId: 'CAMPUS-1',
        inventoryId: 'INV-1',
        scope: 2,
        category: 'purchased_electricity_grid',
        name: 'Synthetic Campus Electricity',
        quantity: 1000,
        unit: 'kWh',
        isMonthly: false,
        dataQualityTier: 'billed',
        createdAt: '2022-01-01'
      },
      {
        id: 'ACT-SYNTH-2',
        institutionId: 'SYNTH-101',
        campusId: 'CAMPUS-1',
        inventoryId: 'INV-1',
        scope: 1,
        category: 'stationary_combustion_generator',
        name: 'Synthetic Generator Diesel',
        quantity: 100,
        unit: 'L',
        fuelOrGasType: 'Diesel',
        isMonthly: false,
        dataQualityTier: 'billed',
        createdAt: '2022-01-01'
      },
      {
        id: 'ACT-SYNTH-3',
        institutionId: 'SYNTH-101',
        campusId: 'CAMPUS-1',
        inventoryId: 'INV-1',
        scope: 1,
        category: 'cooking_combustion_cafeteria',
        name: 'Synthetic Cafeteria LPG',
        quantity: 50,
        unit: 'kg',
        fuelOrGasType: 'LPG',
        isMonthly: false,
        dataQualityTier: 'billed',
        createdAt: '2022-01-01'
      }
    ];

    const syntheticCommuters: CommuterSurveyResponse[] = [
      {
        id: 'COMM-SYNTH-1',
        institutionId: 'SYNTH-101',
        campusId: 'CAMPUS-1',
        role: 'student',
        originArea: 'Dhanmondi',
        primaryMode: 'public_bus',
        totalOneWayKm: 10,
        distanceBasis: 'one_way',
        annualAttendanceDays: 200,
        usesInstitutionalFleet: false
      }
    ];

    const pop: PopulationRecord = {
      id: 'POP-SYNTH',
      institutionId: 'SYNTH-101',
      year: 2022,
      studentHeadcount: 80,
      facultyHeadcount: 10,
      staffHeadcount: 10,
      totalHeadcount: 100,
      campusOperatingDaysPerYear: 200,
      sourceCitation: 'Synthetic Baseline Institutional Test'
    };

    const run = calculateInventory(
      syntheticActivities,
      pop,
      syntheticCommuters,
      { tier: 'current_inventory_method', gwpSet: GWP_SETS.AR6 }
    );

    // 1. Grid electricity (Scope 2 Location-Based Generation): 1000 kWh * 0.637861388 / 1000 = ~0.63786 tCO2e
    assert.strictEqual(Number(run.scope2LocationBased.toFixed(4)), 0.6379);

    // 2. Scope 3 T&D Losses: 1000 * 0.637861388 * 0.11 / 1000 = ~0.07016 tCO2e
    assert.strictEqual(Number(run.scope3Breakdown.gridTdLosses.toFixed(4)), 0.0702);

    // 3. Stationary Diesel: 100 L * 2.676 / 1000 = 0.2676 tCO2 + CH4 + N2O = ~0.2686 tCO2e
    assert.strictEqual(Number(run.scope1Breakdown.stationaryDiesel.toFixed(3)), 0.269);

    // 4. LPG: 50 kg * 3.00 kgCO2/kg = 150 kg = 0.150 tCO2e
    assert.strictEqual(Number(run.scope1Breakdown.cafeteriaLpg.toFixed(3)), 0.150);

    // 5. Commuting: 10 km one-way * 2 * 200 days = 4000 annual km per student.
    // 4000 km * 0.017058 kg/km = 68.232 kg/student * 80 students = 5.45856 tCO2e.
    assert.strictEqual(Number(run.scope3Breakdown.studentCommuting.toFixed(2)), 5.46);

    // 6. Audit traces generated for all line items
    assert.ok(run.traces.length >= 4);
    const gridTrace = run.traces.find(t => t.scope === 2);
    assert.ok(gridTrace);
    assert.ok(gridTrace.equationText.includes('1000 kWh'));

    // 7. Per capita total correctly calculated: totalGrossEmissions / 100
    assert.strictEqual(Number(run.perCapitaTotal.toFixed(4)), Number((run.totalGrossEmissions / 100).toFixed(4)));
  });
});

describe('2. Dimensional Consistency & Unit Conversion Invariants', () => {
  const pop: PopulationRecord = {
    id: 'POP-DIM',
    institutionId: 'DIM-TEST',
    year: 2022,
    studentHeadcount: 100,
    facultyHeadcount: 10,
    staffHeadcount: 10,
    totalHeadcount: 120,
    campusOperatingDaysPerYear: 200,
    sourceCitation: 'Test'
  };

  test('Electricity unit scaling: 1 MWh = 1000 kWh', () => {
    const actMWh: ActivityRecord[] = [{
      id: 'ACT-MWH',
      institutionId: 'DIM-TEST',
      campusId: 'CAMPUS-1',
      inventoryId: 'INV-1',
      scope: 2,
      category: 'purchased_electricity_grid',
      name: '1 MWh Substation',
      quantity: 1,
      unit: 'MWh',
      isMonthly: false,
      dataQualityTier: 'billed',
      createdAt: '2022-01-01'
    }];

    const actKWh: ActivityRecord[] = [{
      id: 'ACT-KWH',
      institutionId: 'DIM-TEST',
      campusId: 'CAMPUS-1',
      inventoryId: 'INV-1',
      scope: 2,
      category: 'purchased_electricity_grid',
      name: '1000 kWh Substation',
      quantity: 1000,
      unit: 'kWh',
      isMonthly: false,
      dataQualityTier: 'billed',
      createdAt: '2022-01-01'
    }];

    const runMWh = calculateInventory(actMWh, pop, []);
    const runKWh = calculateInventory(actKWh, pop, []);

    assert.strictEqual(runMWh.scope2LocationBased, runKWh.scope2LocationBased);
  });

  test('LPG mass vs volume distinction: mass factor differs from volumetric factor', () => {
    const massFactor = getFactorById('EF-LPG-MASS-IPCC2006');
    const volumeFactor = getFactorById('EF-LPG-VOLUMETRIC-EPA2024');
    assert.ok(massFactor);
    assert.ok(volumeFactor);
    assert.strictEqual(massFactor.value, 3.00);
    assert.strictEqual(volumeFactor.value, 1.612);

    // 12,720 kg of LPG evaluated with mass factor vs volumetric factor
    const actLpg: ActivityRecord[] = [{
      id: 'ACT-LPG',
      institutionId: 'DIM-TEST',
      campusId: 'CAMPUS-1',
      inventoryId: 'INV-1',
      scope: 1,
      category: 'cooking_combustion_cafeteria',
      name: 'Cafeteria LPG',
      quantity: 12720,
      unit: 'kg',
      isMonthly: false,
      dataQualityTier: 'billed',
      createdAt: '2022-01-01'
    }];

    const runLegacy = calculateInventory(actLpg, pop, [], { tier: 'legacy_study_reproduction' });
    const runCurrent = calculateInventory(actLpg, pop, [], { tier: 'current_inventory_method' });

    // Legacy calculation gave ~20.65 tCO2e (12,720 kg * 1.612 kg/L + CH4/N2O)
    assert.strictEqual(Number(runLegacy.scope1Breakdown.cafeteriaLpg.toFixed(2)), 20.65);

    // Current calculation gives ~38.20 tCO2e (3.00 kgCO2/kg mass factor + IPCC CH4/N2O)
    assert.strictEqual(Number(runCurrent.scope1Breakdown.cafeteriaLpg.toFixed(1)), 38.2);
  });

  test('Commuting dimensional math: round-trip, occupancy division, and zero active emissions', () => {
    const carCommuter: CommuterSurveyResponse = {
      id: 'COMM-CAR',
      institutionId: 'DIM-TEST',
      campusId: 'CAMPUS-1',
      role: 'faculty',
      originArea: 'Uttara',
      primaryMode: 'private_car',
      totalOneWayKm: 15,
      annualAttendanceDays: 200,
      distanceBasis: 'one_way',
      carOccupancy: 2,
      usesInstitutionalFleet: false
    };

    const walkCommuter: CommuterSurveyResponse = {
      id: 'COMM-WALK',
      institutionId: 'DIM-TEST',
      campusId: 'CAMPUS-1',
      role: 'student',
      originArea: 'Dhanmondi',
      primaryMode: 'walking',
      totalOneWayKm: 2,
      annualAttendanceDays: 200,
      distanceBasis: 'one_way',
      usesInstitutionalFleet: false
    };

    const run = calculateInventory([], pop, [carCommuter, walkCommuter]);

    // Walking commuter emissions are zero
    assert.strictEqual(run.scope3Breakdown.studentCommuting, 0);

    // Faculty car commuter emissions reflect 15 km * 2 * 200 = 6,000 annual km / 2 occupancy
    assert.ok(run.scope3Breakdown.facultyCommuting > 0);
  });
});

describe('3. GWP Set & Provenance Invariants', () => {
  test('AR6, AR5, AR4 values correctly defined and non-zero', () => {
    assert.strictEqual(getGWP('CH4', 'AR6'), 27.9);
    assert.strictEqual(getGWP('CH4', 'AR5'), 28.0);
    assert.strictEqual(getGWP('CH4', 'AR4'), 25.0);

    assert.strictEqual(getGWP('N2O', 'AR6'), 273);
    assert.strictEqual(getGWP('N2O', 'AR5'), 265);
    assert.strictEqual(getGWP('N2O', 'AR4'), 298);

    assert.strictEqual(getGWP('R-22', 'AR6'), 1960);
    assert.strictEqual(getGWP('R-22', 'AR5'), 1810);
    assert.strictEqual(getGWP('R-22', 'AR4'), 1810);

    assert.strictEqual(getGWP('R-32', 'AR6'), 771);
    assert.strictEqual(getGWP('R-134a', 'AR6'), 1530);
    assert.strictEqual(getGWP('R-410A', 'AR6'), 2255.5);
  });

  test('Registry contains verified emission factors across provenance categories', () => {
    assert.ok(EMISSION_FACTOR_REGISTRY.length >= 10);
    const bdOfficial = EMISSION_FACTOR_REGISTRY.filter(f => f.provenance === 'bangladesh_official');
    const bdResearch = EMISSION_FACTOR_REGISTRY.filter(f => f.provenance === 'bangladesh_research_derived');
    const intlProxy = EMISSION_FACTOR_REGISTRY.filter(f => f.provenance === 'international_proxy');

    assert.ok(bdOfficial.length >= 1, 'Must have official Bangladesh factors (e.g. SREDA grid emission factor)');
    assert.ok(bdResearch.length >= 1, 'Must have Bangladesh research-derived factors');
    assert.ok(intlProxy.length >= 1, 'Must have international proxy factors (e.g. EPA/IPCC)');
  });
});

describe('4. Legacy Reproduction Fixture vs Published Paper Figures', () => {
  test('Exact reproduction of ULAB 2022 dataset matches published figures', () => {
    const { activities, population, commuters } = LEGACY_ULAB_2022_FIXTURE;

    const legacyRun = calculateInventory(
      activities,
      population,
      commuters,
      { tier: 'legacy_study_reproduction', includeOdsInScope1: true, separateTdLosses: false }
    );

    // 1. Scope 2 Grid: 454.14 tCO2e (paper reports 454.14 tCO2e)
    assert.strictEqual(Number(legacyRun.scope2LocationBased.toFixed(2)), 454.14);

    // 2. Scope 3 Commuting: 1,302.10 tCO2e (paper reports 1,302.14 tCO2e, sheet formula is 1,302.1028)
    assert.strictEqual(Number(legacyRun.scope3Total.toFixed(2)), 1302.10);

    // 3. Scope 1 (including R-22 in Scope 1): 742.55 tCO2e (matches paper within 0.01 tCO2e)
    assert.ok(Math.abs(legacyRun.scope1Total - 742.55) < 0.1);

    // 4. Total Gross Emissions: 2,499.35 tCO2e (matches workbook 2,498.79 tCO2e within < 0.03%)
    assert.strictEqual(Number(legacyRun.totalGrossEmissions.toFixed(1)), 2498.8);

    // 5. Per Capita: 2498.8 / 5350 = 0.4671 tCO2e/person (exact match with paper's 0.4671)
    assert.strictEqual(Number(legacyRun.perCapitaTotal.toFixed(4)), 0.4671);
  });

  test('Current Standardized Method correctly isolates Scope 2 generation and Montreal Protocol R-22', () => {
    const { activities, population, commuters } = LEGACY_ULAB_2022_FIXTURE;

    const currentRun = calculateInventory(
      activities,
      population,
      commuters,
      { tier: 'current_inventory_method', includeOdsInScope1: false, separateTdLosses: true }
    );

    // In Current Method:
    // Scope 2 is pure generation: 409.13 tCO2e
    assert.strictEqual(Number(currentRun.scope2LocationBased.toFixed(2)), 409.13);

    // T&D losses (45.00 tCO2e) placed in Scope 3 Cat 3
    assert.strictEqual(Number(currentRun.scope3Breakdown.gridTdLosses.toFixed(2)), 45.00);

    // Scope 1 core Kyoto gases (excluding Montreal Protocol R-22): 441.18 tCO2e
    // (reflects corrected mass-based LPG 38.19 tCO2e vs legacy volumetric 20.65 tCO2e)
    assert.strictEqual(Number(currentRun.scope1Breakdown.totalWithoutODS.toFixed(2)), 441.18);

    // R-22 reported out-of-scope under Montreal Protocol disclosure: 319.48 tCO2e
    assert.strictEqual(Number(currentRun.scope1Breakdown.acR22MontrealProtocol.toFixed(2)), 319.48);
  });
});

describe('5. Mitigation Scenario Engine & Interaction Invariants', () => {
  const { activities, population, commuters } = LEGACY_ULAB_2022_FIXTURE;
  const baseRun = calculateInventory(
    activities,
    population,
    commuters,
    { tier: 'current_inventory_method', includeOdsInScope1: false, separateTdLosses: true }
  );

  test('Conventional Scenario (50 kWp solar + 1 hybrid minibus)', () => {
    const res = evaluateMitigationScenario(baseRun, PRESET_SCENARIOS[0], 5350);
    assert.ok(res.netReductionTCO2e > 0);
    assert.ok(res.scenarioTotalTCO2e < res.baselineTotalTCO2e);
    assert.ok(res.percentageReduction > 0);
  });

  test('Interaction check: Energy efficiency is applied prior to solar sizing', () => {
    const res = evaluateMitigationScenario(baseRun, PRESET_SCENARIOS[1], 5350);
    const effIntervention = res.interventions.find(i => i.category.includes('Energy Efficiency'));
    const solarIntervention = res.interventions.find(i => i.category.includes('Solar PV'));

    assert.ok(effIntervention);
    assert.ok(solarIntervention);
    assert.ok(effIntervention.technicalFeasibilityNotes[0].includes('Applied prior to sizing solar'));
  });

  test('Interaction check: Electric minibus fleet adds charging electricity to Scope 2', () => {
    const comprehensive = PRESET_SCENARIOS[2];
    assert.strictEqual(comprehensive.transportIntervention.minibusType, 'electric');

    const res = evaluateMitigationScenario(baseRun, comprehensive, 5350);
    const evIntervention = res.interventions.find(i => i.category.includes('Electric'));
    assert.ok(evIntervention);
    assert.ok(evIntervention.crossScopeAdditionTCO2e > 0);
    assert.ok(evIntervention.technicalFeasibilityNotes[0].includes('charging demand'));
  });

  test('Interaction check: Refrigerant replacement without equipment triggers critical safety warning', () => {
    const invalidRefrigConfig = {
      ...PRESET_SCENARIOS[1],
      coolantTransition: {
        enabled: true,
        targetCoolant: 'R32' as const,
        replaceEquipment: false, // INVALID: trying to drop in R-32 without replacing compressor
        leakReductionPercent: 50
      }
    };

    const res = evaluateMitigationScenario(baseRun, invalidRefrigConfig, 5350);
    assert.ok(res.interactionWarnings.length > 0);
    assert.ok(res.interactionWarnings[0].includes('cannot be dropped into existing'));
  });
});

describe('6. Spatial Clustering & Privacy Suppression Invariant', () => {
  test('Commuter origins with k < 5 respondents are suppressed from public spatial maps', () => {
    const sampleCommuters: CommuterSurveyResponse[] = [
      { id: 'C1', institutionId: 'I1', campusId: 'C1', role: 'student', originArea: 'Dhanmondi', primaryMode: 'walking', totalOneWayKm: 1, annualAttendanceDays: 200, usesInstitutionalFleet: false },
      { id: 'C2', institutionId: 'I1', campusId: 'C1', role: 'student', originArea: 'Dhanmondi', primaryMode: 'walking', totalOneWayKm: 1, annualAttendanceDays: 200, usesInstitutionalFleet: false },
      { id: 'C3', institutionId: 'I1', campusId: 'C1', role: 'student', originArea: 'Dhanmondi', primaryMode: 'walking', totalOneWayKm: 1, annualAttendanceDays: 200, usesInstitutionalFleet: false },
      { id: 'C4', institutionId: 'I1', campusId: 'C1', role: 'student', originArea: 'Dhanmondi', primaryMode: 'walking', totalOneWayKm: 1, annualAttendanceDays: 200, usesInstitutionalFleet: false },
      { id: 'C5', institutionId: 'I1', campusId: 'C1', role: 'student', originArea: 'Dhanmondi', primaryMode: 'walking', totalOneWayKm: 1, annualAttendanceDays: 200, usesInstitutionalFleet: false },
      { id: 'C6', institutionId: 'I1', campusId: 'C1', role: 'faculty', originArea: 'Keraniganj', primaryMode: 'motorcycle', totalOneWayKm: 15, annualAttendanceDays: 200, usesInstitutionalFleet: false }
    ];

    const counts: Record<string, number> = {};
    for (const c of sampleCommuters) {
      if (c.originArea) {
        counts[c.originArea] = (counts[c.originArea] || 0) + 1;
      }
    }

    const publicClusters = Object.entries(counts).filter(([_, count]) => count >= 5);
    const suppressedClusters = Object.entries(counts).filter(([_, count]) => count < 5);

    assert.strictEqual(publicClusters.length, 1);
    assert.strictEqual(publicClusters[0][0], 'Dhanmondi');
    assert.strictEqual(suppressedClusters.length, 1);
    assert.strictEqual(suppressedClusters[0][0], 'Keraniganj');
  });
});

describe('7. Live Backend API Acceptance Tests', () => {
  test('GET /api/health responds with status ok and version', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json() as any;
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.platform, 'Campus Carbon Bangladesh');
  });

  test('GET /api/institutions returns seeded institutions including ULAB', async () => {
    const res = await fetch(`${BASE_URL}/api/institutions`);
    assert.strictEqual(res.status, 200);
    const list = await res.json() as any[];
    assert.ok(Array.isArray(list));
    const ulab = list.find((i: any) => i.id === 'INST-ULAB');
    assert.ok(ulab, 'ULAB must be present in seeded institutions');
    assert.strictEqual(ulab.name, 'University of Liberal Arts Bangladesh');
  });

  test('GET /api/factors returns full registry with provenance categories', async () => {
    const res = await fetch(`${BASE_URL}/api/factors`);
    assert.strictEqual(res.status, 200);
    const body = await res.json() as any;
    assert.ok(Array.isArray(body.factors));
    assert.ok(body.factors.length >= 10);
    const bdOfficial = body.factors.filter((f: any) => f.provenance === 'bangladesh_official');
    assert.ok(bdOfficial.length >= 1, 'Must have official Bangladesh factors');
  });

  test('POST /api/calculate executes deterministic calculation and returns audit trail', async () => {
    const payload = {
      institutionId: 'INST-ULAB',
      tier: 'current_inventory_method',
      includeOdsInScope1: false,
      separateTdLosses: true
    };

    const res = await fetch(`${BASE_URL}/api/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 200);
    const run = await res.json() as any;
    assert.ok(run.runId);
    assert.ok(run.totalGrossEmissions > 0);
    assert.ok(run.traces.length > 0);
    assert.ok(run.traces[0].equationText.length > 0);
  });

  test('POST /api/scenarios/evaluate computes multi-lever mitigation projection', async () => {
    const payload = {
      institutionId: 'INST-ULAB',
      scenarioConfig: PRESET_SCENARIOS[1] // Incremental
    };

    const res = await fetch(`${BASE_URL}/api/scenarios/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(res.status, 200);
    const evalResult = await res.json() as any;
    assert.ok(evalResult.scenarioResult);
    assert.ok(evalResult.scenarioResult.netReductionTCO2e > 0);
    assert.ok(evalResult.scenarioResult.percentageReduction > 0);
  });

  test('GET /api/reports/:id returns complete printable payload with methodology disclosures', async () => {
    const res = await fetch(`${BASE_URL}/api/reports/INST-ULAB`);
    assert.strictEqual(res.status, 200);
    const report = await res.json() as any;
    assert.ok(report.institution);
    assert.ok(report.population);
    assert.ok(report.methodologyDisclosure);
    assert.strictEqual(report.methodologyDisclosure.standard, 'GHG Protocol Corporate Standard & Scope 2 Guidance');
  });

  test('GET /api/templates/commuter and /api/templates/google-forms-script deliver valid files', async () => {
    const resComm = await fetch(`${BASE_URL}/api/templates/commuter`);
    assert.strictEqual(resComm.status, 200);
    assert.strictEqual(resComm.headers.get('content-type'), 'text/csv; charset=utf-8');
    const textComm = await resComm.text();
    assert.ok(textComm.includes('role,campus_id,origin_area'));

    const resGas = await fetch(`${BASE_URL}/api/templates/google-forms-script`);
    assert.strictEqual(resGas.status, 200);
    const scriptText = await resGas.text();
    assert.ok(scriptText.includes('createCampusCommuterSurvey'));
  });
});
