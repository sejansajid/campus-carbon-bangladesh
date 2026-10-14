export const EN_TRANSLATIONS = {
  appTitle: 'Campus Carbon Bangladesh',
  appSubtitle: 'GHG Inventory, Geospatial Mapping & Practical Mitigation Platform for Higher Education',
  
  // Navigation
  navOverview: 'Overview',
  navBoundaries: 'Campus setup',
  navCollect: 'Collect data with templates',
  navEnter: 'Enter existing data',
  navReview: 'Data Review',
  navResults: 'Inventory Results',
  navMap: 'Campus Map',
  navCompare: 'Compare universities',
  navMitigation: 'Policy & action plan',
  navFactors: 'Emission Factors',
  navMethodology: 'Methodology & References',
  navReports: 'Reports & Export',
  navSettings: 'Settings',
  
  // Scopes
  scope1: 'Scope 1: Direct Operations',
  scope1Desc: 'Direct GHG emissions from owned or controlled operations: generator fuel, university fleet vehicles, cafeteria cooking LPG, and AC refrigerant leakage.',
  scope2: 'Scope 2: Purchased Electricity',
  scope2Desc: 'Indirect GHG emissions from generation of purchased grid electricity consumed across academic buildings, laboratories, and campus facilities.',
  scope3: 'Scope 3: Indirect & Commuting',
  scope3Desc: 'Value chain emissions: student, faculty, and staff commuting, and grid transmission & distribution (T&D) losses.',
  
  // Tiers
  publishedReference: 'Published Study Reference',
  legacyReproduction: 'ULAB 2022 study demo — historical method',
  currentMethod: 'Standardized Method',
  
  // Common terms
  totalEmissions: 'Total Gross Emissions',
  perCapitaFootprint: 'Per Capita Footprint',
  students: 'Students',
  faculty: 'Faculty',
  staff: 'Staff',
  headcount: 'Headcount',
  tonsCO2e: 'tCO₂e',
  tonsCO2ePerPerson: 'tCO₂e / person',
  operatingDays: 'Campus Operating Days',
  actionPlan: 'Policy & action plan',
  howCalculated: 'How this was calculated',
  
  // Buttons
  calculateNow: 'Update results',
  exportCsv: 'Export CSV',
  exportReport: 'Print / Save Report',
  downloadTemplate: 'Download Template',
  saveAction: 'Save Action',
  accept: 'Accept into plan',
  reject: 'Reject',
  defer: 'Defer',
  comment: 'Add Comment'
};

export type TranslationKey = keyof typeof EN_TRANSLATIONS;
