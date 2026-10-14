export const EN_TRANSLATIONS = {
  appTitle: 'Campus Carbon Bangladesh',
  appSubtitle: 'GHG Inventory, Geospatial Mapping & Mitigation Platform for Higher Education Institutions',
  
  // Navigation
  navOverview: 'Overview',
  navBoundaries: 'Institution & Boundaries',
  navCollect: 'Collect Data (Route A)',
  navEnter: 'Guided Entry (Route B)',
  navReview: 'Data Review',
  navResults: 'Inventory Results',
  navMap: 'Campus Map',
  navCompare: 'Peer Comparison',
  navMitigation: 'Mitigation & Actions',
  navFactors: 'Emission Factors',
  navReports: 'Reports & Export',
  navSettings: 'Settings',
  
  // Scopes
  scope1: 'Scope 1: Direct Emissions',
  scope1Desc: 'Direct GHG emissions from owned or controlled operations: generator fuel, university fleet vehicles, cafeteria cooking LPG, and AC refrigerant leakage.',
  scope2: 'Scope 2: Purchased Electricity',
  scope2Desc: 'Indirect GHG emissions from generation of purchased grid electricity consumed across academic buildings, laboratories, and campus facilities.',
  scope3: 'Scope 3: Indirect & Commuting',
  scope3Desc: 'Value chain emissions: student, faculty, and staff commuting, grid transmission & distribution (T&D) losses, water consumption, and waste.',
  
  // Tiers
  publishedReference: 'Published Study Reference',
  legacyReproduction: 'Legacy Study Reproduction',
  currentMethod: 'Current Inventory Method (Reviewed)',
  
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
  actionPlan: 'Climate Action Plan',
  howCalculated: 'How Calculated (Audit Trace)',
  
  // Buttons
  calculateNow: 'Calculate Inventory',
  exportCsv: 'Export CSV',
  exportReport: 'Print / Save Report',
  downloadTemplate: 'Download Template',
  saveAction: 'Save Action',
  accept: 'Accept',
  reject: 'Reject',
  defer: 'Defer',
  comment: 'Add Comment'
};

export type TranslationKey = keyof typeof EN_TRANSLATIONS;
