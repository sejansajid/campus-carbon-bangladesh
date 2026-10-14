import { ActivityRecord, PopulationRecord, CommuterSurveyResponse } from '../types';

export const ULAB_2022_POPULATION: PopulationRecord = {
  id: 'POP-ULAB-2022',
  institutionId: 'INST-ULAB',
  year: 2022,
  studentHeadcount: 4860,
  facultyHeadcount: 240,
  staffHeadcount: 250,
  totalHeadcount: 5350,
  fullTimeEquivalent: 5100,
  residentialStudentCount: 0,
  campusOperatingDaysPerYear: 294,
  sourceCitation: 'ULAB Registrar Annual Report 2022 / IEEE Access Publication'
};

export const ULAB_2022_ACTIVITIES: ActivityRecord[] = [
  // Scope 1: Vehicles - Octane (Scope1!B19:B30 sum = 8,593.207692 L)
  {
    id: 'ACT-S1-VEH-OCTANE-2022',
    institutionId: 'INST-ULAB',
    campusId: 'CAMPUS-ULAB-PERMANENT',
    inventoryId: 'INV-ULAB-2022',
    scope: 1,
    category: 'mobile_combustion_fleet',
    sourceOrAssetId: 'FLEET-OCTANE',
    name: 'University Vehicles (Octane Fuel)',
    periodStart: '2022-01-01',
    periodEnd: '2022-12-31',
    quantity: 8593.207692, // Litres
    unit: 'L',
    fuelOrGasType: 'Octane',
    isMonthly: false,
    dataQualityTier: 'billed',
    notes: 'Scope1!B19:B30 sum = 8,593.208 L billed octane',
    createdAt: '2022-12-31T23:59:59Z'
  },
  // Scope 1: Vehicles - Diesel (Scope1!I19:I30 sum = 19,128.779817 L)
  {
    id: 'ACT-S1-VEH-DIESEL-2022',
    institutionId: 'INST-ULAB',
    campusId: 'CAMPUS-ULAB-PERMANENT',
    inventoryId: 'INV-ULAB-2022',
    scope: 1,
    category: 'mobile_combustion_fleet',
    sourceOrAssetId: 'FLEET-DIESEL',
    name: 'University Vehicles (Diesel Transport)',
    periodStart: '2022-01-01',
    periodEnd: '2022-12-31',
    quantity: 19128.779817, // Litres
    unit: 'L',
    fuelOrGasType: 'Diesel',
    isMonthly: false,
    dataQualityTier: 'billed',
    notes: 'Scope1!I19:I30 sum = 19,128.78 L transport diesel',
    createdAt: '2022-12-31T23:59:59Z'
  },
  // Scope 1: Generator Diesel (Scope1!B47 sum = 9,112.844037 L)
  {
    id: 'ACT-S1-GEN-DIESEL-2022',
    institutionId: 'INST-ULAB',
    campusId: 'CAMPUS-ULAB-PERMANENT',
    inventoryId: 'INV-ULAB-2022',
    scope: 1,
    category: 'stationary_combustion_generator',
    sourceOrAssetId: 'GEN-BACKUP',
    name: 'Backup Generator Diesel',
    periodStart: '2022-01-01',
    periodEnd: '2022-12-31',
    quantity: 9112.844037, // Litres
    unit: 'L',
    fuelOrGasType: 'Diesel',
    isMonthly: false,
    dataQualityTier: 'billed',
    notes: 'Scope1!B47 sum = 9,112.844 L generator diesel',
    createdAt: '2022-12-31T23:59:59Z'
  },
  // Scope 1: Cafeteria LPG (Scope1!J35 = 12,720 kg)
  {
    id: 'ACT-S1-COOK-LPG-2022',
    institutionId: 'INST-ULAB',
    campusId: 'CAMPUS-ULAB-PERMANENT',
    inventoryId: 'INV-ULAB-2022',
    scope: 1,
    category: 'cooking_combustion_cafeteria',
    sourceOrAssetId: 'CAFE-LPG',
    name: 'Cafeteria Cooking (LPG)',
    periodStart: '2022-01-01',
    periodEnd: '2022-12-31',
    quantity: 12720, // kg
    unit: 'kg',
    fuelOrGasType: 'LPG',
    isMonthly: false,
    dataQualityTier: 'billed',
    notes: '12,720 kg annual LPG in commercial cylinders',
    createdAt: '2022-12-31T23:59:59Z'
  },
  // Scope 1: AC Refrigerant R-410A (Scope1!J46 = 136 kg)
  {
    id: 'ACT-S1-AC-R410A-2022',
    institutionId: 'INST-ULAB',
    campusId: 'CAMPUS-ULAB-PERMANENT',
    inventoryId: 'INV-ULAB-2022',
    scope: 1,
    category: 'refrigerant_fugitive_ac',
    sourceOrAssetId: 'AC-SYSTEMS-R410A',
    name: 'AC Top-Up (R-410A)',
    periodStart: '2022-01-01',
    periodEnd: '2022-12-31',
    quantity: 136, // kg
    unit: 'kg',
    fuelOrGasType: 'R-410A',
    isMonthly: false,
    dataQualityTier: 'measured',
    notes: '136 kg maintenance top-up in 2022',
    createdAt: '2022-12-31T23:59:59Z'
  },
  // Scope 1: AC Refrigerant R-22 (Scope1!M46 = 163 kg)
  {
    id: 'ACT-S1-AC-R22-2022',
    institutionId: 'INST-ULAB',
    campusId: 'CAMPUS-ULAB-PERMANENT',
    inventoryId: 'INV-ULAB-2022',
    scope: 1,
    category: 'refrigerant_fugitive_ac',
    sourceOrAssetId: 'AC-SYSTEMS-R22',
    name: 'AC Top-Up (R-22/HCFC-22)',
    periodStart: '2022-01-01',
    periodEnd: '2022-12-31',
    quantity: 163, // kg
    unit: 'kg',
    fuelOrGasType: 'R-22',
    isMonthly: false,
    dataQualityTier: 'measured',
    notes: '163 kg maintenance top-up in 2022 (Montreal Protocol ODS)',
    createdAt: '2022-12-31T23:59:59Z'
  },

  // Scope 2: Grid Electricity (Scope2!B16 = 641,412 kWh)
  {
    id: 'ACT-S2-ELEC-GRID-2022',
    institutionId: 'INST-ULAB',
    campusId: 'CAMPUS-ULAB-PERMANENT',
    inventoryId: 'INV-ULAB-2022',
    scope: 2,
    category: 'purchased_electricity_grid',
    sourceOrAssetId: 'METER-MAIN-DESCO',
    name: 'Purchased Electricity (DESCO/DPDC)',
    periodStart: '2022-01-01',
    periodEnd: '2022-12-31',
    quantity: 641412, // kWh
    unit: 'kWh',
    isMonthly: false,
    dataQualityTier: 'billed',
    notes: 'Annual billed import from power grid',
    createdAt: '2022-12-31T23:59:59Z'
  }
];

export const ULAB_COMMUTER_SURVEY_SAMPLE: CommuterSurveyResponse[] = [
  { id: 'RESP-01', institutionId: 'INST-ULAB', campusId: 'CAMPUS-ULAB', role: 'student', originArea: 'Dhanmondi', annualAttendanceDays: 294, primaryMode: 'walking', totalOneWayKm: 1.255, distanceBasis: 'one_way', usesInstitutionalFleet: false },
  { id: 'RESP-02', institutionId: 'INST-ULAB', campusId: 'CAMPUS-ULAB', role: 'student', originArea: 'Mohammadpur', annualAttendanceDays: 294, primaryMode: 'bicycle', totalOneWayKm: 2.77, distanceBasis: 'one_way', usesInstitutionalFleet: false },
  { id: 'RESP-03', institutionId: 'INST-ULAB', campusId: 'CAMPUS-ULAB', role: 'student', originArea: 'Adabar', annualAttendanceDays: 294, primaryMode: 'rickshaw', totalOneWayKm: 3.04, distanceBasis: 'one_way', usesInstitutionalFleet: false },
  { id: 'RESP-04', institutionId: 'INST-ULAB', campusId: 'CAMPUS-ULAB', role: 'student', originArea: 'Kalyanpur', annualAttendanceDays: 294, primaryMode: 'battery_rickshaw', totalOneWayKm: 3.255, distanceBasis: 'one_way', usesInstitutionalFleet: false },
  { id: 'RESP-05', institutionId: 'INST-ULAB', campusId: 'CAMPUS-ULAB', role: 'student', originArea: 'Mirpur', annualAttendanceDays: 294, primaryMode: 'public_bus', totalOneWayKm: 14.51, distanceBasis: 'one_way', usesInstitutionalFleet: false },
  { id: 'RESP-06', institutionId: 'INST-ULAB', campusId: 'CAMPUS-ULAB', role: 'student', originArea: 'Farmgate', annualAttendanceDays: 294, primaryMode: 'leguna', totalOneWayKm: 6.075, distanceBasis: 'one_way', usesInstitutionalFleet: false },
  { id: 'RESP-07', institutionId: 'INST-ULAB', campusId: 'CAMPUS-ULAB', role: 'student', originArea: 'Shyamoli', annualAttendanceDays: 294, primaryMode: 'cng_autorickshaw', totalOneWayKm: 7.86, distanceBasis: 'one_way', usesInstitutionalFleet: false },
  { id: 'RESP-08', institutionId: 'INST-ULAB', campusId: 'CAMPUS-ULAB', role: 'faculty', originArea: 'Uttara', annualAttendanceDays: 294, primaryMode: 'private_car', totalOneWayKm: 9.932, distanceBasis: 'one_way', carOccupancy: 1, usesInstitutionalFleet: false },
  { id: 'RESP-09', institutionId: 'INST-ULAB', campusId: 'CAMPUS-ULAB', role: 'faculty', originArea: 'Gulshan', annualAttendanceDays: 294, primaryMode: 'motorcycle', totalOneWayKm: 8.36, distanceBasis: 'one_way', usesInstitutionalFleet: false },
  { id: 'RESP-10', institutionId: 'INST-ULAB', campusId: 'CAMPUS-ULAB', role: 'staff', originArea: 'Badda', annualAttendanceDays: 294, primaryMode: 'multiple_transport', totalOneWayKm: 9.045, distanceBasis: 'one_way', usesInstitutionalFleet: false }
];

export const ULAB_EXPECTED_BENCHMARKS = {
  publishedPaper: {
    total: 2498.80,
    scope1: 742.55,
    scope2: 454.14,
    scope3: 1302.14,
    perCapita: 0.4671,
    sumOfScopes: 2498.83 // 742.55 + 454.14 + 1302.14 = 2498.83
  },
  workbookCached: {
    total: 2498.790365,
    scope1: 742.551085,
    scope2: 454.136463,
    scope3: 1302.102817,
    perCapita: 0.4670636
  }
};

export const LEGACY_ULAB_2022_FIXTURE = {
  population: ULAB_2022_POPULATION,
  activities: ULAB_2022_ACTIVITIES,
  commuters: ULAB_COMMUTER_SURVEY_SAMPLE,
  benchmarks: ULAB_EXPECTED_BENCHMARKS
};
