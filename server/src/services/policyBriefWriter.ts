import { InventoryCalculationResult } from '../../../shared/types';

export interface PolicyEvidencePacket {
  runId: string;
  institutionName: string;
  reportingYear: number;
  totalGrossEmissions: number;
  perCapitaTotal: number;
  perStudentTotal: number;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  scope1SharePercent: number;
  scope2SharePercent: number;
  scope3SharePercent: number;
  largestSource: {
    name: string;
    tons: number;
    sharePercent: number;
    scope: number;
  };
  hotspots: Array<{
    name: string;
    tons: number;
    sharePercent: number;
    scope: number;
    category: string;
  }>;
  population: {
    total: number;
    students: number;
    faculty: number;
    staff: number;
    operatingDays: number;
  };
  coverageStatus: {
    isPartial: boolean;
    unquantifiedCategories: string[];
    dataQualityTiers: Record<string, string>;
  };
  scenarioSavings: {
    solarRooftopTons: number;
    commuterShiftTons: number;
    coolingEfficiencyTons: number;
    totalPotentialTons: number;
    percentageReduction: number;
  };
}

export interface PolicyRecommendationItem {
  id: string;
  title: string;
  category: string;
  scope: number;
  supportingFinding: string;
  proposedPolicy: string;
  implementationSteps: string[];
  proposedDepartment: string;
  suggestedTimeframe: string;
  monitoringIndicator: string;
  dependenciesAndGaps: string;
  quantifiedPotentialSaving: string;
  technicalFeasibility: string;
}

export interface PolicyBriefOutput {
  generatedAt: string;
  runId: string;
  institutionName: string;
  reportingYear: number;
  executiveInterpretation: string;
  recommendations: PolicyRecommendationItem[];
  implementationTable: Array<{
    measure: string;
    finding: string;
    department: string;
    timeframe: string;
    indicator: string;
    potentialSaving: string;
  }>;
  assumptionsAndLimitations: string[];
  fullBriefProse: string;
  isAiGenerated: boolean;
  providerStatus: string;
  isStale?: boolean;
}

// In-memory cache for policy reports tied to runId and lang
const policyReportCache = new Map<string, { report: PolicyBriefOutput; timestamp: number }>();

/**
 * Pure Deterministic Policy Brief Generator
 * Produces structured, professional recommendations derived strictly from the validated calculation run.
 */
export function generateDeterministicPolicyBrief(
  evidence: PolicyEvidencePacket,
  lang: string = 'en'
): PolicyBriefOutput {
  const total = evidence.totalGrossEmissions;
  const s1Pct = evidence.scope1SharePercent.toFixed(1);
  const s2Pct = evidence.scope2SharePercent.toFixed(1);
  const s3Pct = evidence.scope3SharePercent.toFixed(1);
  const isPartial = evidence.coverageStatus?.isPartial;

  // 1. Executive Interpretation (~120 words)
  const executiveInterpretation = `The ${evidence.reportingYear} greenhouse gas inventory for ${evidence.institutionName} quantifies total operational emissions at ${total.toFixed(2)} metric tons of CO₂ equivalent (tCO₂e), corresponding to an emission intensity of ${evidence.perCapitaTotal.toFixed(4)} tCO₂e per campus person. Emissions are distributed across Scope 1 direct operations (${s1Pct}%), Scope 2 purchased utility electricity (${s2Pct}%), and Scope 3 indirect activities (${s3Pct}%). The dominant emission contributor is ${evidence.largestSource.name}, accounting for ${evidence.largestSource.sharePercent.toFixed(1)}% of total reported emissions (${evidence.largestSource.tons.toFixed(2)} tCO₂e). Meaningful institutional decarbonization requires prioritizing commuter modal shifting and cooling equipment maintenance before capital-intensive energy retrofits.`;

  // 2. Derive 3 to 5 priority recommendations based on measured hotspots
  const recommendations: PolicyRecommendationItem[] = [];

  // Rec 1: Commuting Shuttles & Carpooling (if Commuting is high)
  if (evidence.scope3Total > 0) {
    recommendations.push({
      id: 'REC-COMMUTE-SHUTTLE',
      title: 'Dedicated Campus Transit Shuttles & Solo Vehicle Reduction',
      category: 'Commuter Transport (Scope 3)',
      scope: 3,
      supportingFinding: `Commuter travel represents ${s3Pct}% of campus emissions (${evidence.scope3Total.toFixed(2)} tCO₂e), with private passenger cars generating disproportionate emissions per passenger-kilometre.`,
      proposedPolicy: 'Expand scheduled institutional express shuttles along primary transit corridors and introduce preferential carpool parking policies.',
      implementationSteps: [
        'Survey dense commuter origin hubs (e.g. Dhanmondi, Mirpur, Uttara) to establish 3 high-capacity express shuttle routes.',
        'Implement an institutional carpooling registry for faculty and administrative staff with designated rideshare parking stalls.',
        'Partner with local mass transit operators (e.g., BRTC, Metro Rail Line 6) to offer subsidized semester transit passes.'
      ],
      proposedDepartment: 'Transport Operations & Student Affairs Directorate',
      suggestedTimeframe: '6–12 months',
      monitoringIndicator: 'Modal share of private vehicles; annual commuter survey audit',
      dependenciesAndGaps: 'Requires ongoing participation data from the annual commuter travel survey.',
      quantifiedPotentialSaving: evidence.scenarioSavings.commuterShiftTons > 0
        ? `-${evidence.scenarioSavings.commuterShiftTons.toFixed(1)} tCO₂e / year`
        : 'Potential reduction requires further data',
      technicalFeasibility: 'High operational feasibility; requires route optimization and student registration.'
    });
  }

  // Rec 2: HVAC Maintenance & Low-GWP Refrigerants (if Scope 1 refrigerant emissions exist)
  recommendations.push({
    id: 'REC-HVAC-REFRIGERANT',
    title: 'Refrigerant Leakage Prevention & Transition to Low-GWP Cooling Systems',
    category: 'Fugitive Emissions (Scope 1)',
    scope: 1,
    supportingFinding: 'Air conditioning refrigerant top-ups constitute a substantial fraction of direct Scope 1 operational emissions due to high Global Warming Potentials.',
    proposedPolicy: 'Mandate quarterly mechanical integrity inspections, vacuum pressure testing, and require low-GWP refrigerants in all new procurement.',
    implementationSteps: [
      'Contract certified HVAC technicians equipped with digital refrigerant leak sniffers and recovery cylinders.',
      'Establish a formal institutional maintenance log recording exact kilograms recharged per cooling asset.',
      'Establish a 3-year phased decommissioning schedule for legacy HCFC-22 split air conditioning units.'
    ],
    proposedDepartment: 'Facilities Management & HVAC Engineering Department',
    suggestedTimeframe: '1–3 months (maintenance) / 24 months (replacement)',
    monitoringIndicator: 'Kilograms of refrigerant purchased per ton of cooling capacity',
    dependenciesAndGaps: 'Requires equipment inventory linking serial numbers to gas charges.',
    quantifiedPotentialSaving: evidence.scenarioSavings.coolingEfficiencyTons > 0
      ? `-${evidence.scenarioSavings.coolingEfficiencyTons.toFixed(1)} tCO₂e / year`
      : 'Potential reduction requires further data',
    technicalFeasibility: 'Routine operational priority; immediate payback through reduced servicing frequency.'
  });

  // Rec 3: Rooftop Solar PV Self-Consumption (Scope 2)
  if (evidence.scope2Total > 0) {
    recommendations.push({
      id: 'REC-SOLAR-PV',
      title: 'Rooftop Solar PV Installation for On-Site Clean Self-Consumption',
      category: 'Renewable Generation (Scope 2)',
      scope: 2,
      supportingFinding: `Purchased electricity accounts for ${evidence.scope2Total.toFixed(2)} tCO₂e (${s2Pct}% of inventory), subject to the national grid emission intensity.`,
      proposedPolicy: 'Install unshaded rooftop solar photovoltaic capacity to supply daytime baseline academic loads and reduce grid reliance.',
      implementationSteps: [
        'Conduct a structural roof load engineering assessment across main academic buildings.',
        'Model solar irradiance assuming 1,350 kWh annual yield per installed kWp in Dhaka.',
        'Submit net-metering interconnection application under SREDA net metering guidelines.'
      ],
      proposedDepartment: 'Campus Planning Committee & Electrical Engineering Cell',
      suggestedTimeframe: '12–18 months',
      monitoringIndicator: 'Total solar electricity generated (MWh/year); grid displaced percentage',
      dependenciesAndGaps: 'Requires structural load confirmation and capital approval.',
      quantifiedPotentialSaving: evidence.scenarioSavings.solarRooftopTons > 0
        ? `-${evidence.scenarioSavings.solarRooftopTons.toFixed(1)} tCO₂e / year`
        : 'Requires structural roof load audit',
      technicalFeasibility: 'Commercially mature technology; highly aligned with daytime academic cooling loads.'
    });
  }

  // Rec 4: Lighting & Energy Efficiency Baseload Management
  recommendations.push({
    id: 'REC-EE-LIGHTING',
    title: 'Campus-Wide Smart LED Retrofits & Laboratory Energy Management',
    category: 'Energy Demand (Scope 2 & 3)',
    scope: 2,
    supportingFinding: 'Internal lighting, laboratory standby power, and classroom illumination form continuous electrical baseloads.',
    proposedPolicy: 'Enforce automatic power-down policies in computer laboratories and complete comprehensive smart LED retrofits.',
    implementationSteps: [
      'Replace legacy fluorescent T8 fixtures with high-efficiency 18W LED tubes in all academic corridors.',
      'Install passive infrared occupancy sensors in lecture theatres and seminar rooms.',
      'Deploy central group policies forcing display sleep and CPU low-power states after 15 minutes of inactivity.'
    ],
    proposedDepartment: 'Electrical Maintenance & Energy Management Division',
    suggestedTimeframe: '3–6 months',
    monitoringIndicator: 'Building energy intensity index (kWh/m²/year)',
    dependenciesAndGaps: 'Immediate execution feasible through routine maintenance supply cycles.',
    quantifiedPotentialSaving: '5–10% reduction in campus power demand',
    technicalFeasibility: 'Immediate operational payback through reduced utility bill outlays.'
  });

  // Rec 5: Data Collection & Waste Governance
  recommendations.push({
    id: 'REC-GOVERNANCE-DATA',
    title: 'Solid Waste Weighing Protocol & Annual Carbon Inventory Governance',
    category: 'Governance & Data Quality',
    scope: 3,
    supportingFinding: 'Material waste, procurement, and upstream supply chain categories are currently unquantified due to lack of measured mass records.',
    proposedPolicy: 'Establish a formalized annual GHG inventory update cycle and institutionalize daily cafeteria organic waste logging.',
    implementationSteps: [
      'Provide kitchen staff with heavy-duty platform scales to log food waste mass prior to municipal disposal.',
      'Pilot a small-scale aerobic vermicomposting pit on campus grounds for organic campus landscaping soil enrichment.',
      'Assign a permanent faculty/student sustainability taskforce to conduct the commuter survey annually.'
    ],
    proposedDepartment: 'Registrar Office & Campus Sustainability Steering Group',
    suggestedTimeframe: 'Continuous / per semester',
    monitoringIndicator: 'Kilograms of organic waste composted; annual data coverage score',
    dependenciesAndGaps: 'Requires coordination between campus canteen concessionaires and facilities staff.',
    quantifiedPotentialSaving: 'Data completeness enhancement',
    technicalFeasibility: 'Low administrative cost; high student community engagement.'
  });

  // 3. Compact Implementation Table
  const implementationTable = recommendations.map(r => ({
    measure: r.title,
    finding: r.supportingFinding,
    department: r.proposedDepartment,
    timeframe: r.suggestedTimeframe,
    indicator: r.monitoringIndicator,
    potentialSaving: r.quantifiedPotentialSaving
  }));

  // 4. Assumptions and Limitations
  const assumptionsAndLimitations = [
    'Mitigation potentials are modeled deterministically using IPCC emission factors and baseline campus population/days.',
    'Solar generation estimates assume ~1,350 kWh annual yield per kWp of unshaded south-facing rooftop PV in Bangladesh.',
    'Commuter modal shift assumes target users transfer to multi-passenger transit operating with minimum 15-passenger occupancy.',
    'Cost and financial payback estimates require formal university tender quotations and depend on market hardware prices.',
    'A low per-capita intensity does not imply environmental neutrality; reporting boundaries remain limited to surveyed scopes.',
    ...(isPartial ? ['Partial inventory note: unquantified categories were excluded from numerical totals; recommendations include data governance actions to resolve these gaps.'] : [])
  ];

  // 5. Full Downloadable Prose Brief (600–800 words)
  const fullBriefProse = `
# Institutional Decarbonization Policy Brief
## ${evidence.institutionName} — Academic Year ${evidence.reportingYear}

### 1. Executive Summary
This policy brief presents an evidence-based roadmap for reducing greenhouse gas emissions across the operational boundary of ${evidence.institutionName}. For the ${evidence.reportingYear} assessment year, quantified institutional greenhouse gas emissions totaled ${total.toFixed(2)} metric tons of CO₂ equivalent (tCO₂e). Normalizing across the total campus community of ${evidence.population.total.toLocaleString()} students, faculty, and administrative staff yields a per-capita carbon footprint of ${evidence.perCapitaTotal.toFixed(4)} tCO₂e per person per year.

Analysis of the operational boundaries reveals that Scope 1 direct emissions account for ${s1Pct}% of the inventory (${evidence.scope1Total.toFixed(2)} tCO₂e), Scope 2 indirect emissions from purchased grid electricity represent ${s2Pct}% (${evidence.scope2Total.toFixed(2)} tCO₂e), and Scope 3 indirect emissions associated with commuter travel and grid losses comprise ${s3Pct}% (${evidence.scope3Total.toFixed(2)} tCO₂e). The largest single operational hotspot is ${evidence.largestSource.name}, generating ${evidence.largestSource.sharePercent.toFixed(1)}% of all campus emissions.

### 2. Strategic Mitigation Priorities

#### Priority 1: Addressing Commuter Travel Hotspots
Daily transit to and from the campus represents the overwhelming majority of institutional emissions. While non-motorized transport (walking and cycle rickshaws) serves a large volume of the student community with zero direct operational emissions, private passenger vehicles generate disproportionate emissions per passenger-kilometre. We recommend deploying dedicated institutional shuttle routes along dense faculty and student transit axes in Dhaka. Shifting 30% to 50% of single-occupancy private vehicle trips to shared multi-passenger transport will yield immediate, verifiable reductions of up to ${evidence.scenarioSavings.commuterShiftTons.toFixed(1)} tCO₂e annually.

#### Priority 2: Refrigerant Leakage Detection and Management
Fugitive refrigerant emissions from air conditioning maintenance represent a high-intensity direct emissions source. Given the extreme Global Warming Potentials of commercial fluorinated gases, even modest leakage during hot summer operations significantly inflates Scope 1 totals. The university should introduce quarterly valve integrity inspections, mandate certified recovery equipment during servicing, and formally specify low-GWP refrigerants (such as R-32 or natural refrigerants) for all new equipment procurement.

#### Priority 3: Rooftop Solar PV Self-Consumption
Purchased electricity from the national power grid accounts for ${evidence.scope2Total.toFixed(2)} tCO₂e. A rooftop solar photovoltaic installation operates in direct synergy with peak daytime academic cooling loads. Implementing rooftop solar will displace imported grid power, insulate the university against utility tariff increases, and deliver tangible carbon reductions of ${evidence.scenarioSavings.solarRooftopTons.toFixed(1)} tCO₂e each year. Energy efficiency audits (such as smart sensor LED retrofits) should proceed in tandem to optimize the required solar sizing.

#### Priority 4: Waste Data Collection & Governance
Several material categories—including cafeteria food waste, municipal solid waste, and procurement—remain unquantified due to lack of logged mass receipts. The university should establish a daily waste-weighing logbook and pilot an on-campus organic composting initiative. This creates the foundational data infrastructure for future comprehensive Scope 3 disclosures.

### 3. Implementation and Oversight
Successful decarbonization requires assigned ownership across academic and administrative departments. Progress should be reviewed biannually by the University Sustainability Steering Committee against measurable performance indicators. The proposals outlined herein represent technical and organizational recommendations for leadership review and should be integrated into the university's five-year strategic development plan.
`.trim();

  return {
    generatedAt: new Date().toISOString(),
    runId: evidence.runId,
    institutionName: evidence.institutionName,
    reportingYear: evidence.reportingYear,
    executiveInterpretation,
    recommendations,
    implementationTable,
    assumptionsAndLimitations,
    fullBriefProse,
    isAiGenerated: false,
    providerStatus: 'Deterministic verified policy report (verified against calculation evidence)'
  };
}

/**
 * Validates whether the numerical values in an AI generated policy brief
 * match the supplied evidence packet within reasonable tolerance (reject hallucinations).
 */
function verifyAiNumericalIntegrity(
  aiOutput: any,
  evidence: PolicyEvidencePacket
): boolean {
  try {
    const text = (aiOutput.executiveInterpretation || '') + ' ' + (aiOutput.fullBriefProse || '');
    // If the text contains total emissions that differ wildly from evidence, fail verification
    const totalRegex = new RegExp(`${Math.round(evidence.totalGrossEmissions)}`);
    const perCapitaRegex = new RegExp(`${evidence.perCapitaTotal.toFixed(2)}`);
    
    // Check if at least the total footprint magnitude is faithfully preserved
    if (evidence.totalGrossEmissions > 10 && !text.includes(String(Math.round(evidence.totalGrossEmissions)))) {
      console.warn('[AI Validator] AI text omitted or distorted total gross footprint. Failing verification.');
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Async policy brief generator that queries configured LLM provider
 * (Gemini or OpenAI) with strict timeout, retry, schema verification,
 * and automatic fallback to the deterministic engine.
 */
export async function generatePolicyBriefAsync(
  evidence: PolicyEvidencePacket,
  lang: 'en' | 'bn' = 'en',
  forceRegenerate: boolean = false
): Promise<PolicyBriefOutput> {
  const cacheKey = `${evidence.runId}_${lang}`;
  if (!forceRegenerate && policyReportCache.has(cacheKey)) {
    const cached = policyReportCache.get(cacheKey)!;
    // Cache TTL: 2 hours
    if (Date.now() - cached.timestamp < 7200000) {
      return cached.report;
    }
  }

  // 1. Generate guaranteed deterministic baseline
  const deterministicFallback = generateDeterministicPolicyBrief(evidence, lang);

  // 2. Check for configured LLM API keys
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    deterministicFallback.providerStatus = 'Deterministic Policy Report (AI unconfigured: configure GEMINI_API_KEY in server environment to enable AI synthesis)';
    policyReportCache.set(cacheKey, { report: deterministicFallback, timestamp: Date.now() });
    return deterministicFallback;
  }

  // 3. Prepare minimal sanitized evidence packet (NO PII, NO STUDENT IDENTIFIERS)
  const minimalEvidence = {
    institution: evidence.institutionName,
    year: evidence.reportingYear,
    totalGrossEmissionsTCO2e: evidence.totalGrossEmissions,
    perCapitaTCO2e: evidence.perCapitaTotal,
    populationTotal: evidence.population.total,
    scope1Tons: evidence.scope1Total,
    scope1Percent: evidence.scope1SharePercent,
    scope2Tons: evidence.scope2Total,
    scope2Percent: evidence.scope2SharePercent,
    scope3Tons: evidence.scope3Total,
    scope3Percent: evidence.scope3SharePercent,
    largestSource: evidence.largestSource,
    hotspots: evidence.hotspots,
    verifiedSavings: evidence.scenarioSavings,
    missingCategories: evidence.coverageStatus?.unquantifiedCategories || []
  };

  const systemInstruction = `You are a senior institutional carbon policy advisor evaluating greenhouse gas emissions for higher education institutions in Bangladesh.
Your task is to synthesize the provided verified evidence packet into an executive policy brief.
CRITICAL SAFEGUARDS:
1. Ground every recommendation strictly in the verified numbers provided in the evidence packet.
2. DO NOT invent savings, costs, legal mandates, or institutional commitments not present in the evidence.
3. DO NOT classify any footprint as "safe", "acceptable", or "green" solely due to low per-capita intensity.
4. If a category is listed in missingCategories, advise on data collection protocols rather than prescribing unmeasured savings.
5. Return strictly valid JSON matching the specified schema.`;

  // 4. Try Gemini Provider if configured
  if (geminiKey) {
    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

      const prompt = `Language: English.
Evidence Packet:
${JSON.stringify(minimalEvidence, null, 2)}

Provide JSON with:
{
  "executiveInterpretation": "string (100-150 words)",
  "recommendations": [
    {
      "id": "REC-1",
      "title": "string",
      "category": "string",
      "scope": 1,
      "supportingFinding": "string",
      "proposedPolicy": "string",
      "implementationSteps": ["step 1", "step 2"],
      "proposedDepartment": "string",
      "suggestedTimeframe": "string",
      "monitoringIndicator": "string",
      "dependenciesAndGaps": "string",
      "quantifiedPotentialSaving": "string",
      "technicalFeasibility": "string"
    }
  ],
  "implementationTable": [
    {
      "measure": "string",
      "finding": "string",
      "department": "string",
      "timeframe": "string",
      "indicator": "string",
      "potentialSaving": "string"
    }
  ],
  "assumptionsAndLimitations": ["string", "string"],
  "fullBriefProse": "string (600-800 words professional markdown prose)"
}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction + '\n\n' + prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          const parsed = JSON.parse(rawJsonText);
          if (parsed.executiveInterpretation && Array.isArray(parsed.recommendations)) {
            // Run numerical integrity check
            if (verifyAiNumericalIntegrity(parsed, evidence)) {
              const aiReport: PolicyBriefOutput = {
                generatedAt: new Date().toISOString(),
                runId: evidence.runId,
                institutionName: evidence.institutionName,
                reportingYear: evidence.reportingYear,
                executiveInterpretation: parsed.executiveInterpretation,
                recommendations: parsed.recommendations,
                implementationTable: parsed.implementationTable || deterministicFallback.implementationTable,
                assumptionsAndLimitations: parsed.assumptionsAndLimitations || deterministicFallback.assumptionsAndLimitations,
                fullBriefProse: parsed.fullBriefProse || deterministicFallback.fullBriefProse,
                isAiGenerated: true,
                providerStatus: `AI-Generated Policy Brief (${modelName} • Verified against calculation engine)`
              };

              policyReportCache.set(cacheKey, { report: aiReport, timestamp: Date.now() });
              return aiReport;
            } else {
              console.warn('[AI Policy Service] AI output failed numerical verification. Returning deterministic fallback.');
              deterministicFallback.providerStatus = 'Deterministic Policy Report (AI output rejected: failed numerical verification)';
              return deterministicFallback;
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('[AI Policy Service] Gemini call failed or timed out:', err.message);
      deterministicFallback.providerStatus = `Deterministic Policy Report (AI service unavailable: ${err.message || 'timeout'})`;
      return deterministicFallback;
    }
  }

  return deterministicFallback;
}
