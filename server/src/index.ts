import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { db } from './db/storage';
import { calculateInventory } from '../../shared/engine/calculator';
import { EMISSION_FACTOR_REGISTRY } from '../../shared/factors/registry';
import { GWP_SETS } from '../../shared/factors/gwp';
import { evaluateMitigationScenario, PRESET_SCENARIOS } from '../../shared/scenarios/mitigation';
import { CalculationMethodTier, MitigationScenarioConfig, ActivityRecord, CommuterSurveyResponse } from '../../shared/types';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', platform: 'Campus Carbon Bangladesh', version: '1.0.0', time: new Date().toISOString() });
});

// ----------------------------------------------------------------
// Institutions & Boundaries
// ----------------------------------------------------------------
app.get('/api/institutions', (req, res) => {
  const list = db.getInstitutions();
  res.json(list);
});

app.get('/api/institutions/:id', (req, res) => {
  const inst = db.getInstitutionById(req.params.id);
  if (!inst) return res.status(404).json({ error: 'Institution not found' });
  const boundaries = db.getBoundaries(inst.id);
  const population = db.getPopulation(inst.id);
  res.json({ institution: inst, boundaries, population });
});

app.post('/api/institutions', (req, res) => {
  const data = req.body;
  if (!data.name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const id = data.id || `INST-${Date.now()}`;
  try {
    const inst = db.saveInstitution({ ...data, id });
    db.log('CREATE_INSTITUTION', 'Institution', inst.id, { name: inst.name });
    res.status(201).json(inst);
  } catch (err: any) {
    if (err.message && err.message.includes('read-only')) {
      return res.status(403).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/boundaries/:institutionId', (req, res) => {
  const list = db.getBoundaries(req.params.institutionId);
  res.json(list);
});

app.post('/api/boundaries', (req, res) => {
  const data = req.body;
  if (!data.institutionId || !data.name) {
    return res.status(400).json({ error: 'institutionId and name required' });
  }
  const id = data.id || `CAMPUS-${Date.now()}`;
  try {
    const boundary = db.saveBoundary({ ...data, id });
    db.log('UPDATE_BOUNDARY', 'CampusBoundary', boundary.id, { name: boundary.name });
    res.json(boundary);
  } catch (err: any) {
    if (err.message && err.message.includes('read-only')) {
      return res.status(403).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------------------
// Population
// ----------------------------------------------------------------
app.get('/api/population/:institutionId', (req, res) => {
  const pop = db.getPopulation(req.params.institutionId);
  if (!pop) return res.status(404).json({ error: 'Population not found' });
  res.json(pop);
});

app.post('/api/population', (req, res) => {
  const data = req.body;
  const student = Number(data.studentHeadcount) || 0;
  const faculty = Number(data.facultyHeadcount) || 0;
  const staff = Number(data.staffHeadcount) || 0;
  const total = student + faculty + staff;

  const id = data.id || `POP-${Date.now()}`;
  try {
    const pop = db.savePopulation({
      ...data,
      id,
      studentHeadcount: student,
      facultyHeadcount: faculty,
      staffHeadcount: staff,
      totalHeadcount: total,
      campusOperatingDaysPerYear: Number(data.campusOperatingDaysPerYear) || 294
    });
    db.log('UPDATE_POPULATION', 'PopulationRecord', pop.id, { totalHeadcount: total });
    res.json(pop);
  } catch (err: any) {
    if (err.message && err.message.includes('read-only')) {
      return res.status(403).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------------------
// Activities (Scope 1, Scope 2, Scope 3 administrative)
// ----------------------------------------------------------------
app.get('/api/activities/:institutionId', (req, res) => {
  const acts = db.getActivities(req.params.institutionId);
  res.json(acts);
});

app.post('/api/activities', (req, res) => {
  const data = req.body;
  if (!data.institutionId || !data.category || data.quantity === undefined) {
    return res.status(400).json({ error: 'Missing required activity fields' });
  }
  const id = data.id || `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const act = db.saveActivity({ ...data, id });
  db.log('SAVE_ACTIVITY', 'ActivityRecord', act.id, { category: act.category, quantity: act.quantity });
  res.status(201).json(act);
});

app.delete('/api/activities/:id', (req, res) => {
  const deleted = db.deleteActivity(req.params.id);
  if (deleted) {
    db.log('DELETE_ACTIVITY', 'ActivityRecord', req.params.id);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Activity not found' });
});

// ----------------------------------------------------------------
// Commuter Surveys (Route A & B Commuting Data)
// ----------------------------------------------------------------
app.get('/api/commuters/:institutionId', (req, res) => {
  const list = db.getCommuterSurveys(req.params.institutionId);
  res.json(list);
});

app.post('/api/commuters', (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];
  const validated: CommuterSurveyResponse[] = [];

  for (const item of items) {
    if (!item.institutionId || !item.role || !item.primaryMode) continue;
    validated.push({
      id: item.id || `SURVEY-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      institutionId: item.institutionId,
      campusId: item.campusId || 'CAMPUS-MAIN',
      role: item.role,
      originArea: item.originArea || 'Unspecified Dhaka Area',
      annualAttendanceDays: Number(item.annualAttendanceDays) || 294,
      primaryMode: item.primaryMode,
      totalOneWayKm: Number(item.totalOneWayKm) || 5.0,
      distanceBasis: item.distanceBasis || 'one_way',
      carFuelType: item.carFuelType,
      carOccupancy: Number(item.carOccupancy) || 1,
      usesInstitutionalFleet: Boolean(item.usesInstitutionalFleet),
      multimodalLegs: item.multimodalLegs
    });
  }

  const savedCount = db.saveCommuterSurveys(validated);
  db.log('IMPORT_COMMUTER_SURVEYS', 'CommuterSurveyResponse', 'BATCH', { count: savedCount });
  res.status(201).json({ count: savedCount, items: validated });
});

// ----------------------------------------------------------------
// Calculation Execution & History
// ----------------------------------------------------------------
app.post('/api/calculate', (req, res) => {
  const { institutionId, tier, includeOdsInScope1, separateTdLosses } = req.body;
  if (!institutionId) return res.status(400).json({ error: 'institutionId is required' });

  const population = db.getPopulation(institutionId);
  if (!population) {
    return res.status(400).json({ error: 'Institution population must be configured before calculation' });
  }

  const activities = db.getActivities(institutionId);
  const commuters = db.getCommuterSurveys(institutionId);

  const selectedTier: CalculationMethodTier = tier || 'current_inventory_method';
  const result = calculateInventory(activities, population, commuters, {
    tier: selectedTier,
    includeOdsInScope1,
    separateTdLosses
  });

  db.saveCalculationRun(result);
  db.log('EXECUTE_CALCULATION', 'CalculationRun', result.runId, {
    tier: selectedTier,
    totalGrossEmissions: result.totalGrossEmissions,
    perCapita: result.perCapitaTotal
  });

  res.json(result);
});

app.get('/api/calculations/:institutionId/latest', (req, res) => {
  const latest = db.getLatestCalculationRun(req.params.institutionId);
  if (!latest) {
    const pop = db.getPopulation(req.params.institutionId);
    if (pop) {
      const acts = db.getActivities(req.params.institutionId);
      const commuters = db.getCommuterSurveys(req.params.institutionId);
      const computed = calculateInventory(acts, pop, commuters);
      db.saveCalculationRun(computed);
      return res.json(computed);
    }
    return res.status(404).json({ error: 'No calculations found for this institution' });
  }
  res.json(latest);
});

// ----------------------------------------------------------------
// Emission Factor Registry
// ----------------------------------------------------------------
app.get('/api/factors', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase();
  const provenance = req.query.provenance as string;

  let factors = [...EMISSION_FACTOR_REGISTRY];
  if (query) {
    factors = factors.filter(f => 
      f.id.toLowerCase().includes(query) ||
      f.sourceTitle.toLowerCase().includes(query) ||
      f.activityType.toLowerCase().includes(query) ||
      f.sourceOrganization.toLowerCase().includes(query)
    );
  }
  if (provenance) {
    factors = factors.filter(f => f.provenance === provenance);
  }

  res.json({
    total: factors.length,
    factors,
    gwpSets: GWP_SETS
  });
});

// ----------------------------------------------------------------
// Peer Comparison & Historical Literature Benchmarks
// ----------------------------------------------------------------
app.get('/api/comparisons', (req, res) => {
  const optedIn = db.getInstitutions().filter(i => i.optInPublicComparison).map(inst => {
    const pop = db.getPopulation(inst.id);
    const run = db.getLatestCalculationRun(inst.id);
    return {
      institutionId: inst.id,
      name: inst.name,
      type: inst.type,
      division: inst.division,
      reportingYear: inst.reportingYear,
      population: pop?.totalHeadcount || 0,
      totalEmissionsTCO2e: run?.totalGrossEmissions || 0,
      perCapitaTCO2e: run?.perCapitaTotal || 0,
      scope1Share: run ? ((run.scope1Total / run.totalGrossEmissions) * 100).toFixed(1) : '0',
      scope2Share: run ? ((run.scope2LocationBased / run.totalGrossEmissions) * 100).toFixed(1) : '0',
      scope3Share: run ? ((run.scope3Total / run.totalGrossEmissions) * 100).toFixed(1) : '0',
      coverageStatus: 'Scopes 1, 2, 3 (Commuting)',
      assuranceStatus: 'Self-Assessed / Research-Audited',
      isLiteratureBenchmark: false
    };
  });

  const literatureBenchmarks = [
    {
      name: 'The American University of Sharjah',
      location: 'Sharjah, UAE',
      studyYear: '2018-2019',
      publishingYear: 2022,
      perCapitaTCO2e: 15.7,
      reference: 'DOI: 10.1016/j.jclepro.2021.130283',
      compatibilityRating: 'Incompatible (Desert climate, on-site heavy generation, desalinated water)',
      isLiteratureBenchmark: true
    },
    {
      name: 'University of Oulu',
      location: 'Oulu, Finland',
      studyYear: '2019',
      publishingYear: 2023,
      perCapitaTCO2e: 1.129,
      reference: 'DOI: 10.1016/j.jclepro.2023.136224',
      compatibilityRating: 'Partially Compatible (Sub-arctic heating, full scope 3 goods & services)',
      isLiteratureBenchmark: true
    },
    {
      name: 'NED University of Engineering & Tech',
      location: 'Karachi, Pakistan',
      studyYear: '2017',
      publishingYear: 2021,
      perCapitaTCO2e: 1.79,
      reference: 'DOI: 10.1007/s10668-020-00849-1',
      compatibilityRating: 'Moderately Compatible (South Asian urban commuter campus)',
      isLiteratureBenchmark: true
    },
    {
      name: 'Universitat Jaume I',
      location: 'Castellón, Spain',
      studyYear: '2019',
      publishingYear: 2022,
      perCapitaTCO2e: 0.30,
      reference: 'DOI: 10.1016/j.jclepro.2022.131589',
      compatibilityRating: 'Moderately Compatible (Compact Mediterranean campus)',
      isLiteratureBenchmark: true
    },
    {
      name: 'Bournemouth University',
      location: 'Poole, England',
      studyYear: 'April - June 2020',
      publishingYear: 2021,
      perCapitaTCO2e: 0.16,
      reference: 'DOI: 10.1016/j.jclepro.2021.127889',
      compatibilityRating: 'INCOMPATIBLE: Measured during 3-month COVID-19 lockdown quarter only; not annual footprint',
      isLiteratureBenchmark: true
    },
    {
      name: 'Universidad Tecnológica de Pereira',
      location: 'Pereira, Colombia',
      studyYear: '2017',
      publishingYear: 2021,
      perCapitaTCO2e: 0.40,
      reference: 'DOI: 10.1016/j.jclepro.2020.124505',
      compatibilityRating: 'Compatible (Tropical Latin American university)',
      isLiteratureBenchmark: true
    },
    {
      name: 'Universidad Nacional de Colombia',
      location: 'Bogotá, Colombia',
      studyYear: '2019',
      publishingYear: 2023,
      perCapitaTCO2e: 0.432,
      reference: 'DOI: 10.1016/j.jclepro.2023.137890',
      compatibilityRating: 'Compatible (Similar urban density and climate adaptation)',
      isLiteratureBenchmark: true
    },
    {
      name: 'Universitas Pertamina',
      location: 'Jakarta, Indonesia',
      studyYear: '2017-2018',
      publishingYear: 2020,
      perCapitaTCO2e: 0.52,
      reference: 'IOP Conf. Ser.: Earth Environ. Sci. 489 012019',
      compatibilityRating: 'High Compatibility (Southeast Asian humid urban commuter institution)',
      isLiteratureBenchmark: true
    }
  ];

  res.json({
    participatingInstitutions: optedIn,
    literatureBenchmarks,
    comparisonGuidelines: [
      'Comparisons require identical reporting duration (full 12 months vs pandemic quarters).',
      'Scope 3 boundaries must be matched: commuting-only inventories cannot be compared with comprehensive supply-chain footprints.',
      'Institutions cannot be ranked on arbitrary leaderboards without equal accounting rigor.'
    ]
  });
});

// ----------------------------------------------------------------
// Mitigation Scenarios & Action Tracking
// ----------------------------------------------------------------
app.get('/api/actions/:institutionId', (req, res) => {
  const actions = db.getActions(req.params.institutionId);
  res.json(actions);
});

app.post('/api/actions', (req, res) => {
  const data = req.body;
  if (!data.institutionId || !data.title) {
    return res.status(400).json({ error: 'institutionId and title required' });
  }
  const id = data.id || `ACTION-${Date.now()}`;
  const action = db.saveAction({
    ...data,
    id,
    status: data.status || 'proposed',
    feedbacks: data.feedbacks || []
  });
  db.log('CREATE_ACTION', 'SustainabilityAction', action.id, { title: action.title });
  res.status(201).json(action);
});

app.post('/api/actions/:id/feedback', (req, res) => {
  const { author, type, text, status } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'Author and text are required' });
  }

  const updated = db.addFeedbackToAction(req.params.id, {
    author,
    type: type || 'comment',
    text
  });

  if (!updated) return res.status(404).json({ error: 'Action not found' });

  if (status) {
    updated.status = status;
    db.saveAction(updated);
  }

  db.log('ADD_FEEDBACK', 'SustainabilityAction', req.params.id, { author, type });
  res.json(updated);
});

app.post('/api/scenarios/evaluate', (req, res) => {
  const institutionId = req.body.institutionId;
  const scenarioConfig = req.body.scenarioConfig || req.body.config;
  if (!scenarioConfig) {
    return res.status(400).json({ error: 'scenarioConfig or config is required' });
  }
  const pop = db.getPopulation(institutionId);
  let baseline = db.getLatestCalculationRun(institutionId);

  if (!baseline) {
    if (pop) {
      const acts = db.getActivities(institutionId);
      const commuters = db.getCommuterSurveys(institutionId);
      baseline = calculateInventory(acts, pop, commuters);
      db.saveCalculationRun(baseline);
    } else {
      return res.status(400).json({ error: 'No baseline calculation available' });
    }
  }

  const result = evaluateMitigationScenario(baseline, scenarioConfig, pop?.totalHeadcount || 5350);
  res.json({
    scenarioResult: result,
    presets: PRESET_SCENARIOS
  });
});

// ----------------------------------------------------------------
// Data Collection Kit Templates
// ----------------------------------------------------------------
app.get('/api/templates/:type', (req, res) => {
  const { type } = req.params;

  if (type === 'commuter' || type === 'csv-commuter') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="commuter_survey_template.csv"');
    const csvContent = [
      'response_id,role,campus_id,origin_area,annual_attendance_days,primary_mode,total_one_way_km,distance_basis,car_fuel_type,car_occupancy,uses_institutional_fleet',
      'RESP-001,student,CAMPUS-MAIN,Dhanmondi,294,walking,1.5,one_way,,,false',
      'RESP-002,student,CAMPUS-MAIN,Mirpur,294,public_bus,12.0,one_way,,,false',
      'RESP-003,faculty,CAMPUS-MAIN,Uttara,294,private_car,18.5,one_way,gasoline,1,false',
      'RESP-004,staff,CAMPUS-MAIN,Mohammadpur,294,rickshaw,2.5,one_way,,,false',
      'RESP-005,student,CAMPUS-MAIN,Farmgate,294,battery_rickshaw,4.0,one_way,,,false',
      'RESP-006,student,CAMPUS-MAIN,Kallyanpur,294,institutional_bus,6.0,one_way,,,true'
    ].join('\n');
    return res.send(csvContent);
  }

  if (type === 'fuels') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fuels_generator_fleet_template.csv"');
    const csvContent = [
      'source_id,category,name,fuel_type,period_start,period_end,quantity,unit,evidence_ref,notes',
      'GEN-01,stationary_combustion_generator,Backup Generator #1,Diesel,2022-01-01,2022-12-31,9112.84,L,INVOICE-DIESEL-2022,Annual generator logbook total',
      'FLEET-01,mobile_combustion_fleet,University Staff Van #1,Octane,2022-01-01,2022-12-31,4500.00,L,RECEIPT-OCTANE-2022,Campus transport van',
      'FLEET-02,mobile_combustion_fleet,University Campus Bus #1,Diesel,2022-01-01,2022-12-31,2967.15,L,RECEIPT-BUS-2022,Student commuter shuttle',
      'COOK-01,cooking_combustion_cafeteria,Main Campus Cafeteria,LPG,2022-01-01,2022-12-31,12720.00,kg,CYLINDER-PURCHASE-2022,12720 kg commercial cylinders'
    ].join('\n');
    return res.send(csvContent);
  }

  if (type === 'electricity') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="electricity_billing_template.csv"');
    const csvContent = [
      'meter_id,category,name,period_start,period_end,imported_kwh,on_site_solar_generated_kwh,self_consumed_solar_kwh,evidence_ref,notes',
      'METER-DESCO-01,purchased_electricity_grid,Main Substation DESCO,2022-01-01,2022-12-31,641412.00,0.00,0.00,BILL-DESCO-ANNUAL-2022,DESCO billed utility consumption'
    ].join('\n');
    return res.send(csvContent);
  }

  if (type === 'refrigerants') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ac_refrigerants_template.csv"');
    const csvContent = [
      'equipment_id,category,refrigerant_type,period_start,period_end,top_up_quantity,unit,method,service_provider,notes',
      'AC-CHILLER-01,refrigerant_fugitive_ac,R-410A,2022-01-01,2022-12-31,136.00,kg,top_up_sales_based,CoolTech Bangladesh,Top-up during annual servicing',
      'AC-SPLIT-02,refrigerant_fugitive_ac,R-22,2022-01-01,2022-12-31,163.00,kg,top_up_sales_based,CoolTech Bangladesh,Montreal Protocol ODS gas servicing'
    ].join('\n');
    return res.send(csvContent);
  }

  if (type === 'google-forms-script' || type === 'gas-script') {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="CampusCarbon_CommuterSurvey_GoogleFormsGenerator.js"');
    const scriptContent = `/**
 * Campus Carbon Bangladesh - Google Forms Commuter Survey Generator
 * Instructions:
 * 1. Open Google Drive -> New -> More -> Google Apps Script
 * 2. Paste this script into Code.gs
 * 3. Click 'Run' -> 'createCampusCommuterSurvey'
 * 4. Check your Google Drive for the generated Survey Form and responses sheet!
 */
function createCampusCommuterSurvey() {
  var form = FormApp.create('Campus Commuter Carbon Survey - Bangladesh HEI');
  form.setDescription('Anonymous travel survey to measure greenhouse gas emissions and environmental footprint of our university community.');
  form.setIsQuiz(false);
  form.setCollectEmail(false);

  var itemRole = form.addMultipleChoiceItem();
  itemRole.setTitle('1. What is your primary role at the university?')
    .setChoiceValues(['student', 'faculty', 'staff'])
    .setRequired(true);

  var itemOrigin = form.addListItem();
  itemOrigin.setTitle('2. Which area of the metropolitan city do you commute from?')
    .setChoiceValues([
      'Dhanmondi', 'Mohammadpur', 'Mirpur', 'Uttara', 'Farmgate', 
      'Gulshan', 'Banani', 'Badda', 'Kallyanpur', 'Adabar', 
      'Old Dhaka', 'Motijheel', 'Rampura', 'Khilgaon', 'Other Area'
    ])
    .setRequired(true);

  var itemMode = form.addMultipleChoiceItem();
  itemMode.setTitle('3. What is your primary mode of transportation to campus?')
    .setChoiceValues([
      'Walking',
      'Bicycle',
      'Rickshaw (Human-powered)',
      'Battery-operated Auto-Rickshaw / Easybike',
      'CNG Auto-Rickshaw',
      'Motorcycle',
      'Private Car',
      'Ridesharing (Car/CNG)',
      'Public City Bus',
      'Leguna (Human hauler)',
      'University-provided Bus / Van',
      'Train / Metro Rail',
      'Multiple Transports'
    ])
    .setRequired(true);

  var itemDistance = form.addTextItem();
  itemDistance.setTitle('4. What is the approximate one-way travel distance to campus in kilometers (km)?')
    .setRequired(true);

  var itemDays = form.addScaleItem();
  itemDays.setTitle('5. On average, how many days per week do you commute to campus?')
    .setBounds(1, 6)
    .setRequired(true);

  Logger.log('Form created successfully! URL: ' + form.getEditUrl());
  Logger.log('Published Survey URL: ' + form.getPublishedUrl());
}
`;
    return res.send(scriptContent);
  }

  res.status(404).json({ error: 'Unknown template type' });
});

// ----------------------------------------------------------------
// Printable / Exportable Report Payload
// ----------------------------------------------------------------
app.get('/api/reports/:institutionId', (req, res) => {
  const inst = db.getInstitutionById(req.params.institutionId);
  if (!inst) return res.status(404).json({ error: 'Institution not found' });
  const pop = db.getPopulation(inst.id);
  const boundary = db.getBoundaries(inst.id)[0];
  const run = db.getLatestCalculationRun(inst.id);
  const actions = db.getActions(inst.id);

  res.json({
    generatedAt: new Date().toISOString(),
    institution: inst,
    boundary,
    population: pop,
    latestInventoryRun: run,
    actions,
    methodologyDisclosure: {
      standard: 'GHG Protocol Corporate Standard & Scope 2 Guidance',
      gwpSet: 'IPCC AR6 100-year Time Horizon',
      gridEmissionFactor: '0.637861 kgCO2e/kWh (Bangladesh National Generation Mix)',
      auditReference: 'docs/source-audit.md',
      platform: 'Campus Carbon Bangladesh v1.0.0'
    }
  });
});

// ----------------------------------------------------------------
// Serve Static Frontend Assets (Production Mode)
// ----------------------------------------------------------------
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

export { app };
export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

