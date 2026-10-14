/**
 * Global Warming Potentials (100-year time horizon)
 * Primary reference: IPCC Sixth Assessment Report (AR6) WG1 Chapter 7
 */

export interface GWPSet {
  name: 'AR6' | 'AR5' | 'AR4';
  description: string;
  co2: number;
  ch4_fossil: number;
  ch4_non_fossil: number;
  n2o: number;
  r410a: number;
  r22: number;
  r32: number;
  r134a: number;
  r290: number; // Propane
}

export const GWP_SETS: Record<string, GWPSet> = {
  AR6: {
    name: 'AR6',
    description: 'IPCC Sixth Assessment Report (2021) 100-year GWP values',
    co2: 1,
    ch4_fossil: 27.9, // As cited in the study and IPCC AR6 Chapter 7
    ch4_non_fossil: 27.2,
    n2o: 273,
    r410a: 2255.5, // 50% R32 (771) + 50% R125 (3740)
    r22: 1960,     // HCFC-22 (ODS - Montreal Protocol)
    r32: 771,      // Pure difluoromethane
    r134a: 1530,
    r290: 0.02
  },
  AR5: {
    name: 'AR5',
    description: 'IPCC Fifth Assessment Report (2013) 100-year GWP values',
    co2: 1,
    ch4_fossil: 28,
    ch4_non_fossil: 28,
    n2o: 265,
    r410a: 2088,
    r22: 1810,
    r32: 677,
    r134a: 1430,
    r290: 3
  },
  AR4: {
    name: 'AR4',
    description: 'IPCC Fourth Assessment Report (2007) 100-year GWP values',
    co2: 1,
    ch4_fossil: 25,
    ch4_non_fossil: 25,
    n2o: 298,
    r410a: 2088,
    r22: 1810,
    r32: 675,
    r134a: 1430,
    r290: 3
  }
};

export const DEFAULT_GWP_SET = GWP_SETS.AR6;

export function getGWP(gas: string, version: 'AR6' | 'AR5' | 'AR4' = 'AR6'): number {
  const gwpSet = GWP_SETS[version] || GWP_SETS.AR6;
  const key = gas.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key === 'ch4' || key === 'methane') return gwpSet.ch4_fossil;
  if (key === 'n2o' || key === 'nitrousoxide') return gwpSet.n2o;
  if (key === 'co2' || key === 'carbondioxide') return 1;
  if (key === 'r22' || key === 'hcfc22') return gwpSet.r22;
  if (key === 'r32') return gwpSet.r32;
  if (key === 'r410a') return gwpSet.r410a;
  if (key === 'r134a') return gwpSet.r134a;
  if (key === 'r290') return gwpSet.r290;
  return 1;
}
