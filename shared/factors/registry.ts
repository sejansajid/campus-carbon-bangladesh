import { EmissionFactor } from '../types';

export const EMISSION_FACTOR_REGISTRY: EmissionFactor[] = [
  // ==========================================
  // SCOPE 1: FUELS & COMBUSTION
  // ==========================================
  {
    id: 'EF-FUEL-OCTANE-EPA2024',
    version: '1.0',
    activityType: 'mobile_combustion_fleet',
    geography: 'INT',
    referenceYear: 2024,
    validPeriod: '2020-2025',
    value: 2.308, // kg CO2 / L
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'L',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Direct tailpipe combustion',
    sourceOrganization: 'US EPA',
    sourceTitle: 'GHG Emission Factors Hub (2024)',
    sourceUrlOrDoi: 'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
    pageOrTable: 'Table 2: Mobile Combustion',
    publicationDate: '2024-02-01',
    derivationMethod: 'Derived from fuel carbon content and oxidation fraction for motor gasoline',
    uncertaintyPercent: 5.0,
    reviewStatus: 'reviewed',
    provenance: 'international_proxy'
  },
  {
    id: 'EF-FUEL-OCTANE-CH4-EPA2024',
    version: '1.0',
    activityType: 'mobile_combustion_fleet',
    geography: 'INT',
    referenceYear: 2024,
    validPeriod: '2020-2025',
    value: 0.000195, // kg CH4 / L (0.000195 kg/L = 0.195 g/L)
    numeratorUnit: 'kgCH4',
    denominatorUnit: 'L',
    gasOrCO2e: 'CH4',
    gwpBasis: 'AR6',
    boundary: 'Direct tailpipe combustion',
    sourceOrganization: 'US EPA',
    sourceTitle: 'GHG Emission Factors Hub (2024)',
    pageOrTable: 'Table 2: Mobile Combustion',
    publicationDate: '2024-02-01',
    derivationMethod: 'EPA vehicle testing database standard factors',
    reviewStatus: 'reviewed',
    provenance: 'international_proxy'
  },
  {
    id: 'EF-FUEL-OCTANE-N2O-EPA2024',
    version: '1.0',
    activityType: 'mobile_combustion_fleet',
    geography: 'INT',
    referenceYear: 2024,
    validPeriod: '2020-2025',
    value: 0.000088, // kg N2O / L
    numeratorUnit: 'kgN2O',
    denominatorUnit: 'L',
    gasOrCO2e: 'N2O',
    gwpBasis: 'AR6',
    boundary: 'Direct tailpipe combustion',
    sourceOrganization: 'US EPA',
    sourceTitle: 'GHG Emission Factors Hub (2024)',
    pageOrTable: 'Table 2: Mobile Combustion',
    publicationDate: '2024-02-01',
    derivationMethod: 'EPA vehicle testing database standard factors',
    reviewStatus: 'reviewed',
    provenance: 'international_proxy'
  },
  {
    id: 'EF-FUEL-DIESEL-MOBILE-EPA2024',
    version: '1.0',
    activityType: 'mobile_combustion_fleet',
    geography: 'INT',
    referenceYear: 2024,
    validPeriod: '2020-2025',
    value: 2.687, // kg CO2 / L
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'L',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Direct tailpipe combustion',
    sourceOrganization: 'US EPA',
    sourceTitle: 'GHG Emission Factors Hub (2024)',
    pageOrTable: 'Table 2: Mobile Combustion',
    publicationDate: '2024-02-01',
    derivationMethod: 'Calculated from carbon content of standard diesel fuel No. 2',
    reviewStatus: 'reviewed',
    provenance: 'international_proxy'
  },
  {
    id: 'EF-FUEL-DIESEL-GEN-EPA2024',
    version: '1.0',
    activityType: 'stationary_combustion_generator',
    geography: 'INT',
    referenceYear: 2024,
    validPeriod: '2020-2025',
    value: 2.676, // kg CO2 / L (as in ULAB Scope1!C35)
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'L',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Stationary combustion in generator',
    sourceOrganization: 'US EPA / IPCC',
    sourceTitle: 'GHG Emission Factors Hub (2024)',
    pageOrTable: 'Table 1: Stationary Combustion',
    publicationDate: '2024-02-01',
    derivationMethod: 'Standard stationary generator diesel combustion',
    reviewStatus: 'reviewed',
    provenance: 'international_proxy'
  },
  {
    id: 'EF-LPG-VOLUMETRIC-EPA2024',
    version: '1.0',
    activityType: 'cooking_combustion_cafeteria',
    geography: 'INT',
    referenceYear: 2024,
    validPeriod: '2020-2025',
    value: 1.612, // kg CO2 / L
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'L',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Direct combustion',
    sourceOrganization: 'US EPA',
    sourceTitle: 'GHG Emission Factors Hub (2024)',
    pageOrTable: 'Table 1: Stationary Combustion (LPG)',
    publicationDate: '2024-02-01',
    derivationMethod: 'Volumetric combustion factor for commercial liquid petroleum gas (propane/butane)',
    reviewStatus: 'reviewed',
    provenance: 'international_proxy'
  },
  {
    id: 'EF-LPG-MASS-IPCC2006',
    version: '1.0',
    activityType: 'cooking_combustion_cafeteria',
    geography: 'INT',
    referenceYear: 2024,
    validPeriod: '2020-2025',
    value: 3.00, // kg CO2 / kg LPG (63,100 kg CO2 / TJ with NCV 47.3 TJ/Gg = ~2.985 kg CO2/kg)
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'kg',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Direct combustion',
    sourceOrganization: 'IPCC',
    sourceTitle: '2006 IPCC Guidelines for National Greenhouse Gas Inventories',
    pageOrTable: 'Vol 2 Energy, Table 1.4',
    publicationDate: '2006-01-01',
    derivationMethod: 'Mass-based factor accounting for 63,100 kg CO2/TJ and lower heating value of LPG',
    reviewStatus: 'reviewed',
    provenance: 'international_proxy'
  },

  // ==========================================
  // SCOPE 2: ELECTRICITY (GRID GENERATION)
  // ==========================================
  {
    id: 'EF-ELEC-GRID-BD-RESEARCH-2022',
    version: '1.0',
    activityType: 'purchased_electricity_grid',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2021-2022',
    value: 0.637861388, // kg CO2e / kWh (= 637.861388 gCO2e/kWh)
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    gasOrCO2e: 'CO2e',
    gwpBasis: 'composite',
    boundary: 'Grid Generation (excl. T&D losses)',
    sourceOrganization: 'ULAB Research / BPDB Grid Mix Analysis',
    sourceTitle: 'Assessment of GHG Emissions and Mitigation Strategies for a University in Bangladesh',
    sourceUrlOrDoi: '10.1109/ACCESS.2025.3605517',
    pageOrTable: 'Table 7 / Scope2!C38',
    publicationDate: '2025-09-02',
    derivationMethod: 'Weighted average of Bangladesh generation mix (Gas: 55.06%, Coal: 6.24%, Oil: 26.71%, Solar: 0.38%, Hydro: 0.87%, Diesel: 1.73%, Power Import: 9.01%)',
    uncertaintyPercent: 7.5,
    reviewStatus: 'reviewed',
    provenance: 'bangladesh_research_derived'
  },
  {
    id: 'EF-ELEC-GRID-BD-OFFICIAL-SREDA-2023',
    version: '1.0',
    activityType: 'purchased_electricity_grid',
    geography: 'BD',
    referenceYear: 2023,
    validPeriod: '2022-2024',
    value: 0.620, // kg CO2e / kWh
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    gasOrCO2e: 'CO2e',
    gwpBasis: 'AR5',
    boundary: 'National Grid Generation Average',
    sourceOrganization: 'SREDA / DoE Bangladesh',
    sourceTitle: 'Bangladesh Grid Emission Factor Report',
    pageOrTable: 'Section 4.1',
    publicationDate: '2023-06-01',
    derivationMethod: 'Standard CDM grid tool combined margin calculation for Bangladesh national interconnected grid',
    uncertaintyPercent: 5.0,
    reviewStatus: 'reviewed',
    provenance: 'bangladesh_official'
  },
  {
    id: 'EF-ELEC-SYNTHETIC-TEST-050',
    version: '1.0',
    activityType: 'purchased_electricity_grid',
    geography: 'SYNTHETIC',
    referenceYear: 2024,
    validPeriod: '2024-2025',
    value: 0.500, // kg CO2e / kWh
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    gasOrCO2e: 'CO2e',
    gwpBasis: 'AR6',
    boundary: 'Synthetic Test Boundary',
    sourceOrganization: 'Test Benchmark',
    sourceTitle: 'Section 14 Acceptance Criteria Specification',
    publicationDate: '2024-01-01',
    derivationMethod: 'Synthetic baseline for deterministic acceptance tests (1,000 kWh @ 0.5 = 0.5 tCO2e)',
    reviewStatus: 'reviewed',
    provenance: 'synthetic_test'
  },

  // ==========================================
  // SCOPE 3: COMMUTING MODES (BANGLADESH CONTEXT)
  // ==========================================
  {
    id: 'EF-COMMUTE-WALK',
    version: '1.0',
    activityType: 'student_commuting',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2020-2030',
    value: 0.0,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'passenger-km',
    gasOrCO2e: 'CO2e',
    gwpBasis: 'AR6',
    boundary: 'Operational zero emissions',
    sourceOrganization: 'GHG Protocol',
    sourceTitle: 'Scope 3 Technical Guidance',
    publicationDate: '2013-01-01',
    derivationMethod: 'Non-motorized zero operational combustion emission',
    reviewStatus: 'reviewed',
    provenance: 'international_proxy'
  },
  {
    id: 'EF-COMMUTE-BICYCLE',
    version: '1.0',
    activityType: 'student_commuting',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2020-2030',
    value: 0.0,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'passenger-km',
    gasOrCO2e: 'CO2e',
    gwpBasis: 'AR6',
    boundary: 'Operational zero emissions',
    sourceOrganization: 'GHG Protocol',
    sourceTitle: 'Scope 3 Technical Guidance',
    publicationDate: '2013-01-01',
    derivationMethod: 'Non-motorized zero operational combustion emission',
    reviewStatus: 'reviewed',
    provenance: 'international_proxy'
  },
  {
    id: 'EF-COMMUTE-RICKSHAW-MANUAL',
    version: '1.0',
    activityType: 'student_commuting',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2020-2030',
    value: 0.0,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'passenger-km',
    gasOrCO2e: 'CO2e',
    gwpBasis: 'AR6',
    boundary: 'Operational zero emissions',
    sourceOrganization: 'Research Study',
    sourceTitle: 'ULAB Assessment Table 10',
    publicationDate: '2025-09-02',
    derivationMethod: 'Human-powered cycle rickshaw has zero direct tailpipe emissions',
    reviewStatus: 'reviewed',
    provenance: 'bangladesh_research_derived'
  },
  {
    id: 'EF-COMMUTE-BATTERY-RICKSHAW-ULAB',
    version: '1.0',
    activityType: 'student_commuting',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2020-2025',
    value: 0.05083755, // kg CO2e / km (= 50.83755 gCO2e/km)
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'km',
    gasOrCO2e: 'CO2e',
    gwpBasis: 'composite',
    boundary: 'Charging electricity consumption',
    sourceOrganization: 'ULAB Research / Rahman et al.',
    sourceTitle: 'Scope3!J53 / Table 10',
    publicationDate: '2025-09-02',
    derivationMethod: '0.0797 kWh/km specific consumption multiplied by Bangladesh grid factor (637.86 g/kWh)',
    reviewStatus: 'reviewed',
    provenance: 'bangladesh_research_derived'
  },
  {
    id: 'EF-COMMUTE-CNG-AUTORICKSHAW',
    version: '1.0',
    activityType: 'student_commuting',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2020-2025',
    value: 0.075, // kg CO2 / km (= 75 g/km)
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'km',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Direct tailpipe',
    sourceOrganization: 'ULAB Research / CASE Project Dhaka',
    sourceTitle: 'Scope3!G40 / Table 10',
    publicationDate: '2025-09-02',
    derivationMethod: 'Dhaka 4-stroke CNG auto-rickshaw fleet average (75 g CO2/km, 1.41 g CH4/km, 0.0025 g N2O/km)',
    reviewStatus: 'reviewed',
    provenance: 'bangladesh_research_derived'
  },
  {
    id: 'EF-COMMUTE-MOTORCYCLE',
    version: '1.0',
    activityType: 'student_commuting',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2020-2025',
    value: 0.040, // kg CO2 / km (= 40 g/km)
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'km',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Direct tailpipe',
    sourceOrganization: 'ULAB Research / EPA Hub',
    sourceTitle: 'Scope3!G42 / Table 10',
    publicationDate: '2025-09-02',
    derivationMethod: '4-stroke small displacement motorcycle (40 g CO2/km, 0.08 g CH4/km, 0.00516 g N2O/km)',
    reviewStatus: 'reviewed',
    provenance: 'bangladesh_research_derived'
  },
  {
    id: 'EF-COMMUTE-PUBLIC-BUS',
    version: '1.0',
    activityType: 'student_commuting',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2020-2025',
    value: 0.01705769, // kg CO2 / passenger-km (887 g/km divided by 52 passengers = 17.058 g/p-km)
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'passenger-km',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Direct tailpipe per passenger',
    sourceOrganization: 'ULAB Research / Table 10',
    sourceTitle: 'Scope3!G39',
    publicationDate: '2025-09-02',
    derivationMethod: 'Diesel city bus (887 g CO2/km) allocated over average occupancy of 52 passengers',
    reviewStatus: 'reviewed',
    provenance: 'bangladesh_research_derived'
  },
  {
    id: 'EF-COMMUTE-LEGUNA',
    version: '1.0',
    activityType: 'student_commuting',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2020-2025',
    value: 0.02770833, // kg CO2 / passenger-km (332.5 g/km divided by 12 passengers = 27.708 g/p-km)
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'passenger-km',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Direct tailpipe per passenger',
    sourceOrganization: 'ULAB Research / Table 10',
    sourceTitle: 'Scope3!G43',
    publicationDate: '2025-09-02',
    derivationMethod: 'Diesel human-hauler leguna (332.5 g CO2/km) allocated over average occupancy of 12 passengers',
    reviewStatus: 'reviewed',
    provenance: 'bangladesh_research_derived'
  },
  {
    id: 'EF-COMMUTE-CAR-WEIGHTED-ULAB',
    version: '1.0',
    activityType: 'employee_commuting',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2020-2025',
    value: 0.280897, // kg CO2 / km (= 280.897 g/km)
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'km',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Direct tailpipe',
    sourceOrganization: 'ULAB Commuter Survey Analysis',
    sourceTitle: 'Scope3!G38 / Table 10',
    publicationDate: '2025-09-02',
    derivationMethod: 'Survey fleet weighted mix of Sedan (71.6%, 255.7 g/km), SUV (11.9%, 324.4 g/km), Ride-sharing CNG (11.9%, 237 g/km), and Minibus (4.5%, 685.3 g/km)',
    reviewStatus: 'reviewed',
    provenance: 'institution_specific'
  },

  // ==========================================
  // WATER CONSUMPTION (OPTIONAL SCOPE 3)
  // ==========================================
  {
    id: 'EF-WATER-SUPPLY-BD-ADB2022',
    version: '1.0',
    activityType: 'water_supply_treatment',
    geography: 'BD',
    referenceYear: 2022,
    validPeriod: '2020-2025',
    value: 0.00026446, // kg CO2 / L (= 0.26446 g/L = 264.46 g/m3)
    numeratorUnit: 'kgCO2',
    denominatorUnit: 'L',
    gasOrCO2e: 'CO2',
    gwpBasis: 'AR6',
    boundary: 'Pumping & distribution energy',
    sourceOrganization: 'Asian Development Bank / Shimizu et al.',
    sourceTitle: 'ADB Climate Change Assessment / Water Sheet Row 8',
    publicationDate: '2022-01-01',
    derivationMethod: '0.406 kWh/m3 specific energy for DWASA municipal pumping multiplied by 651.38 gCO2/kWh grid factor',
    reviewStatus: 'reviewed',
    provenance: 'bangladesh_research_derived'
  }
];

export function getEmissionFactorById(id: string): EmissionFactor | undefined {
  return EMISSION_FACTOR_REGISTRY.find(f => f.id === id);
}

export const getFactorById = getEmissionFactorById;

export function getFactorForActivity(activityType: string, provenancePreference: string[] = ['bangladesh_official', 'bangladesh_research_derived', 'international_proxy']): EmissionFactor | undefined {
  const matches = EMISSION_FACTOR_REGISTRY.filter(f => f.activityType === activityType && f.reviewStatus === 'reviewed');
  for (const prov of provenancePreference) {
    const found = matches.find(m => m.provenance === prov);
    if (found) return found;
  }
  return matches[0];
}
