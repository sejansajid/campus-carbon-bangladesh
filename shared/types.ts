/**
 * Campus Carbon Bangladesh - Core Domain Types
 */

export type CalculationMethodTier = 
  | 'published_study_reference' // Headline values reported in IEEE Access paper
  | 'legacy_study_reproduction' // Replicates exact original spreadsheet formulas and quirks
  | 'current_inventory_method';  // Standardized, reviewed, dimensionally strict GHG Protocol method

export const CalculationMethodTier = {
  PUBLISHED_STUDY: 'published_study_reference' as const,
  LEGACY_REPRODUCTION: 'legacy_study_reproduction' as const,
  CURRENT_INVENTORY: 'current_inventory_method' as const,
} as const;

export type InstitutionType = 'public' | 'private' | 'international' | 'other';

export type ConsolidationMethod = 'operational_control' | 'financial_control' | 'equity_share';

export interface Institution {
  id: string;
  name: string;
  nameBn?: string;
  type: InstitutionType;
  division: string;
  district: string;
  address?: string;
  consolidationMethod: ConsolidationMethod;
  reportingYear: number;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
  periodType: 'calendar_year' | 'academic_year';
  optInPublicComparison: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampusBoundary {
  id: string;
  institutionId: string;
  name: string;
  isMainCampus: boolean;
  centerCoordinates: [number, number]; // [lat, lng]
  polygonGeoJSON?: any; // GeoJSON polygon
  grossFloorAreaM2?: number;
  landAreaAcres?: number;
  numberOfBuildings?: number;
  geometrySource: 'osm' | 'drawn' | 'uploaded' | 'manual_point';
  confirmedByInstitution: boolean;
}

export interface PopulationRecord {
  id: string;
  institutionId: string;
  year: number;
  studentHeadcount: number;
  facultyHeadcount: number;
  staffHeadcount: number;
  totalHeadcount: number; // validated = student + faculty + staff
  fullTimeEquivalent?: number;
  residentialStudentCount?: number;
  campusOperatingDaysPerYear: number; // e.g. 294 for ULAB or user defined
  sourceCitation: string;
}

export type ScopeCategory = 
  // Scope 1
  | 'stationary_combustion_generator'
  | 'mobile_combustion_fleet'
  | 'cooking_combustion_cafeteria'
  | 'refrigerant_fugitive_ac'
  // Scope 2
  | 'purchased_electricity_grid'
  // Scope 3
  | 'employee_commuting'
  | 'student_commuting'
  | 'grid_transmission_distribution_losses'
  | 'water_supply_treatment'
  | 'solid_waste_disposal'
  | 'paper_procurement'
  | 'business_travel'
  | 'out_of_scope_ods_memo';

export type ScopeNumber = 1 | 2 | 3 | 0;

export interface ActivityRecord {
  id: string;
  institutionId: string;
  campusId: string;
  inventoryId: string;
  scope: ScopeNumber;
  category: ScopeCategory;
  sourceOrAssetId: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  quantity: number;
  unit: string;
  fuelOrGasType?: string;
  isMonthly: boolean;
  monthIndex?: number; // 1-12
  evidenceRef?: string;
  dataQualityTier: 'measured' | 'billed' | 'estimated' | 'proxy';
  notes?: string;
  importedFromBatchId?: string;
  createdAt: string;
}

export type CommuterRole = 'student' | 'faculty' | 'staff';

export type CommuterMode = 
  | 'walking'
  | 'bicycle'
  | 'rickshaw' // human-powered
  | 'battery_rickshaw' // easybike / battery auto-rickshaw
  | 'cng_autorickshaw'
  | 'motorcycle'
  | 'private_car'
  | 'rideshare'
  | 'public_bus'
  | 'leguna' // human hauler
  | 'institutional_bus'
  | 'rail_metro'
  | 'ferry'
  | 'multiple_transport';

export interface CommuterSurveyResponse {
  id: string;
  institutionId: string;
  campusId: string;
  role: CommuterRole;
  originArea: string; // e.g. "Dhanmondi", "Mirpur", "Uttara"
  attendanceDaysPerWeek?: number;
  attendanceWeeksPerYear?: number;
  annualAttendanceDays: number;
  primaryMode: CommuterMode;
  totalOneWayKm: number;
  distanceBasis: 'one_way' | 'round_trip';
  carFuelType?: 'gasoline' | 'cng' | 'diesel' | 'octane_cng_hybrid';
  carOccupancy?: number;
  usesInstitutionalFleet: boolean; // if true, legs are accounted for in Scope 1
  multimodalLegs?: {
    mode: CommuterMode;
    oneWayKm: number;
    fuelType?: string;
    occupancy?: number;
  }[];
}

export type FactorProvenance = 
  | 'bangladesh_official'
  | 'bangladesh_research_derived'
  | 'international_proxy'
  | 'institution_specific'
  | 'synthetic_test';

export interface EmissionFactor {
  id: string;
  version: string;
  activityType: ScopeCategory | string;
  geography: string; // "BD", "INT", "US"
  referenceYear: number;
  validPeriod: string;
  value: number; // e.g. 0.637861
  numeratorUnit: string; // "kgCO2e", "gCO2", "kgCO2"
  denominatorUnit: string; // "kWh", "L", "kg", "km", "passenger-km"
  gasOrCO2e: 'CO2e' | 'CO2' | 'CH4' | 'N2O' | 'HFC' | 'HCFC';
  gwpBasis: 'AR6' | 'AR5' | 'AR4' | 'composite';
  boundary: string; // e.g. "Direct combustion", "Grid average generation", "Well-to-wheel"
  sourceOrganization: string; // "BPDB", "DoE", "EPA", "IPCC"
  sourceTitle: string;
  sourceUrlOrDoi?: string;
  pageOrTable?: string;
  publicationDate: string;
  derivationMethod: string;
  uncertaintyPercent?: number;
  reviewStatus: 'reviewed' | 'draft' | 'retired';
  provenance: FactorProvenance;
  supersedesId?: string;
}

export interface CalculationTrace {
  itemKey: string;
  name: string;
  scope: ScopeNumber;
  category: ScopeCategory;
  rawQuantity: number;
  rawUnit: string;
  normalizedQuantity: number;
  normalizedUnit: string;
  factorId: string;
  factorValue: number;
  factorUnit: string;
  factorProvenance: FactorProvenance;
  equationText: string;
  gwpApplied: number;
  gasBreakdown: {
    co2Ton: number;
    ch4Ton: number;
    n2oTon: number;
    fGasTon: number;
    totalCO2eTon: number;
  };
  assumptions: string[];
  disclosures: string[];
}

export interface InventoryCalculationResult {
  runId: string;
  inventoryId: string;
  institutionId: string;
  methodTier: CalculationMethodTier;
  calculatedAt: string;
  
  // Scopes summary (in metric tonnes CO2e)
  scope1Total: number;
  scope2LocationBased: number;
  scope2MarketBased?: number;
  scope3Total: number;
  totalGrossEmissions: number;
  
  // Specific subcategories
  scope1Breakdown: {
    stationaryDiesel: number;
    fleetOctane: number;
    fleetDiesel: number;
    cafeteriaLpg: number;
    acR410A: number;
    acR22MontrealProtocol: number; // Reported separately under current method
    totalWithoutODS: number;
    totalWithODS: number;
  };
  
  scope2Breakdown: {
    generationEmissions: number;
    tdLossesReallocatedToScope3?: number;
  };
  
  scope3Breakdown: {
    studentCommuting: number;
    facultyCommuting: number;
    staffCommuting: number;
    totalCommuting: number;
    gridTdLosses: number;
    waterEmissions: number;
  };
  
  // Gas decomposition
  gasDecomposition: {
    co2Ton: number;
    ch4Ton: number;
    n2oTon: number;
    hfcTonCO2e: number;
    hcfcTonCO2e: number; // R-22
  };
  
  // Per Capita Indicators
  perCapitaTotal: number;
  perCapitaScope1: number;
  perCapitaScope2: number;
  perCapitaScope3: number;
  perStudentTotal: number;
  perFteTotal?: number;
  emissionsPerM2?: number;
  
  // Detailed audit traces
  traces: CalculationTrace[];
  outOfScopeDisclosures?: CalculationTrace[];
  
  // Data coverage and flags
  unquantifiedCategories: string[];
  dataQualityNotes: string[];
}

export interface MitigationScenarioConfig {
  id: string;
  name: string;
  type: 'baseline' | 'conventional' | 'incremental' | 'comprehensive' | 'custom';
  description: string;
  
  // Parameters
  coolantTransition: {
    enabled: boolean;
    targetCoolant: 'R32' | 'R290' | 'none';
    replaceEquipment: boolean; // Must be true for R32/R290
    leakReductionPercent: number; // e.g. 50%
  };
  
  solarPV: {
    rooftopKwp: number; // e.g. 42 kWp
    floatingKwp: number; // e.g. 116.5 kWp
    rooftopYieldKwhPerKwp: number; // ~1577 kWh/kWp
    floatingYieldKwhPerKwp: number; // ~1450 kWh/kWp
    selfConsumptionRatio: number; // e.g. 0.95 (95% self-consumed on campus)
  };
  
  transportIntervention: {
    facultySharedMinibusCount: number; // e.g. 1 minibus replacing 14 cars
    minibusType: 'hybrid' | 'electric';
    evChargingGridSource: boolean; // adds to electricity demand
    modalShiftWalkCyclePercent: number; // % shifting from rickshaw/car to non-motorized
  };
  
  energyEfficiency: {
    hvacOptimizationPercent: number; // e.g. 10%
    ledLightingPercent: number; // e.g. 5%
  };
}

export type ActionStatus = 'proposed' | 'approved' | 'in_progress' | 'completed' | 'measured';

export interface SustainabilityAction {
  id: string;
  institutionId: string;
  title: string;
  scope: ScopeNumber;
  category: ScopeCategory;
  responsibleDepartment: string;
  targetCompletionDate: string;
  status: ActionStatus;
  estimatedReductionTCO2e: number;
  measuredReductionTCO2e?: number;
  estimatedCostBDT?: number;
  actualCostBDT?: number;
  evidenceRef?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  feedbacks: {
    id: string;
    author: string;
    type: 'comment' | 'status_change' | 'cost_update' | 'measurement_added';
    text: string;
    timestamp: string;
  }[];
}
