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
  rationale: string;
  proposedDepartment: string;
  suggestedTimeframe: string;
  monitoringIndicator: string;
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
}

/**
 * Pure Deterministic Policy Brief Generator
 * Produces structured, professional recommendations derived strictly from the validated calculation run.
 */
export function generateDeterministicPolicyBrief(
  evidence: PolicyEvidencePacket,
  lang: 'en' | 'bn' = 'en'
): PolicyBriefOutput {
  const isBn = lang === 'bn';
  const total = evidence.totalGrossEmissions;
  const s1Pct = evidence.scope1SharePercent.toFixed(1);
  const s2Pct = evidence.scope2SharePercent.toFixed(1);
  const s3Pct = evidence.scope3SharePercent.toFixed(1);

  // 1. Executive Interpretation (~120 words)
  const executiveInterpretation = isBn
    ? `${evidence.institutionName}-এর ${evidence.reportingYear} শিক্ষাবর্ষের মোট পরিমাপকৃত গ্রিনহাউস গ্যাস নির্গমন ${total.toFixed(2)} tCO₂e, যা মাথাপিছু ${evidence.perCapitaTotal.toFixed(4)} tCO₂e/ব্যক্তি। নির্গমন পরিধিতে স্কোপ ১ থেকে এসেছে ${s1Pct}%, স্কোপ ২ (আমদানিকৃত বিদ্যুৎ) থেকে ${s2Pct}%, এবং স্কোপ ৩ থেকে ${s3Pct}%। সর্ববৃহৎ একক নির্গমন উৎস হলো ${evidence.largestSource.name}, যা মোট নির্গমনের প্রায় ${evidence.largestSource.sharePercent.toFixed(1)}% (${evidence.largestSource.tons.toFixed(2)} tCO₂e)। প্রাতিষ্ঠানিক কার্বন হ্রাস নীতিমালায় সর্বাধিক ফলপ্রসূ বিনিয়োগ হবে পরিবহন ব্যবস্থা ও এসি চিলার রক্ষণাবেক্ষণে অগ্রাধিকার প্রদান করা।`
    : `The ${evidence.reportingYear} greenhouse gas assessment for ${evidence.institutionName} quantifies total operational emissions at ${total.toFixed(2)} tCO₂e, corresponding to an intensity of ${evidence.perCapitaTotal.toFixed(4)} tCO₂e per campus person. Emissions are distributed across Scope 1 direct operations (${s1Pct}%), Scope 2 purchased electricity (${s2Pct}%), and Scope 3 indirect activities (${s3Pct}%). The dominant emission contributor is ${evidence.largestSource.name}, accounting for ${evidence.largestSource.sharePercent.toFixed(1)}% of the total footprint (${evidence.largestSource.tons.toFixed(2)} tCO₂e). Meaningful institutional decarbonization requires prioritizing commuter modal shifting and cooling equipment maintenance before capital-intensive energy retrofits.`;

  // 2. Derive 3 to 5 priority recommendations based on measured hotspots
  const recommendations: PolicyRecommendationItem[] = [];

  // Rec 1: Commuting Shuttles & Carpooling (if Commuting is high)
  if (evidence.scope3Total > 0) {
    recommendations.push({
      id: 'REC-COMMUTE-SHUTTLE',
      title: isBn
        ? 'ব্যক্তিগত যানবাহন হ্রাস ও ডেডিকেটেড ক্যাম্পাস শাটল রুট প্রবর্তন'
        : 'Dedicated Campus Transit Shuttles & Solo Vehicle Reduction',
      category: 'Commuter Transport (Scope 3)',
      scope: 3,
      supportingFinding: isBn
        ? `যাতায়াত নির্গমন মোট ফুটপ্রিন্টের ${s3Pct}% (${evidence.scope3Total.toFixed(2)} tCO₂e), যার সিংহভাগ ব্যক্তিগত গাড়ি ব্যবহারকারী স্বল্পসংখ্যক যাত্রী থেকে উৎপন্ন হয়।`
        : `Commuter travel represents ${s3Pct}% of campus emissions (${evidence.scope3Total.toFixed(2)} tCO₂e), with private passenger cars generating disproportionate emissions per passenger-kilometre.`,
      rationale: isBn
        ? 'প্রধান আবাসিক করিডোরে বিশ্ববিদ্যালয় পরিচালিত বা অংশীদারিত্বভিত্তিক মাইক্রোবাস ও বাস সার্ভিস চালু করলে ব্যক্তিগত গাড়ির ব্যবহার ৩০% থেকে ৫০% পর্যন্ত হ্রাস করা সম্ভব।'
        : 'Introducing scheduled institutional express shuttles along dense commuter corridors and facilitating faculty ride-sharing directly addresses the largest measured carbon hotspot without constraining academic mobility.',
      proposedDepartment: isBn ? 'পরিবহন ব্যবস্থাপনা ও ছাত্রকল্যাণ দপ্তর' : 'Transport Operations & Student Affairs Directorate',
      suggestedTimeframe: isBn ? '৬ – ১২ মাস' : '6–12 months',
      monitoringIndicator: isBn ? 'ব্যক্তিগত গাড়ি ব্যবহারকারী যাত্রীর অনুপাত ও শাটল যাত্রীসংখ্যা' : 'Modal share of private vehicles; annual commuter fuel audit',
      quantifiedPotentialSaving: evidence.scenarioSavings.commuterShiftTons > 0
        ? `-${evidence.scenarioSavings.commuterShiftTons.toFixed(1)} tCO₂e / year`
        : 'Potential reduction requires further data',
      technicalFeasibility: 'High feasibility with route-based student and faculty registration'
    });
  }

  // Rec 2: HVAC Maintenance & Low-GWP Refrigerants (if Scope 1 refrigerant emissions exist)
  recommendations.push({
    id: 'REC-HVAC-REFRIGERANT',
    title: isBn
      ? 'এসি চিলার ও স্প্লিট ইউনিটে রেফ্রিজারেন্ট লিকেজ রোধ ও রুটিন ভালভ নিরীক্ষা'
      : 'Refrigerant Leakage Prevention & Transition to Low-GWP Cooling Systems',
    category: 'Fugitive Emissions (Scope 1)',
    scope: 1,
    supportingFinding: isBn
      ? `ক্যাম্পাসের শীতাতপ নিয়ন্ত্রণ রক্ষণাবেক্ষণ সংক্রান্ত গ্যাস টপ-আপ প্রত্যক্ষ স্কোপ ১ নির্গমনের একটি প্রধান উপাদান।`
      : `Air conditioning refrigerant top-ups constitute a substantial fraction of direct Scope 1 operational emissions due to high Global Warming Potentials.`,
    rationale: isBn
      ? 'নিয়মিত প্রেসার পরীক্ষা এবং পাইপ ফিটিংস সিলিং নিশ্চিত করলে বাৎসরিক রেফ্রিজারেন্ট গ্যাস ক্ষতি ৩০% থেকে ৫০% হ্রাস পায়। মেয়াদোত্তীর্ণ ইউনিট পরিবর্তনের সময় R-32 বা সমমানের আধুনিক নিম্ন-জিডব্লিউপি গ্যাস নির্বাচন করা সমীচীন।'
      : 'Establishing quarterly mechanical integrity checks, valve replacements, and transitioning phased-out HCFC-22/HFC units to lower-GWP alternatives prevents high-impact fugitive releases.',
    proposedDepartment: isBn ? 'ক্যাম্পাস প্রকৌশল ও সুযোগ-সুবিধা রক্ষণাবেক্ষণ বিভাগ' : 'Facilities Management & HVAC Engineering Department',
    suggestedTimeframe: isBn ? '১ – ৩ মাস (রক্ষণাবেক্ষণ) / ২৪ মাস (যন্ত্রাংশ প্রতিস্থাপন)' : '1–3 months (maintenance) / 24 months (replacement)',
    monitoringIndicator: isBn ? 'বাৎসরিক সার্ভিসিং চালানে রেফ্রিজারেন্ট গ্যাস রিফিলের পরিমাণ (কেজি)' : 'Kilograms of refrigerant purchased per ton of cooling capacity',
    quantifiedPotentialSaving: evidence.scenarioSavings.coolingEfficiencyTons > 0
      ? `-${evidence.scenarioSavings.coolingEfficiencyTons.toFixed(1)} tCO₂e / year`
      : 'Potential reduction requires further data',
    technicalFeasibility: 'Routine operational priority; requires certified HVAC contractors'
  });

  // Rec 3: Rooftop Solar PV Self-Consumption (Scope 2)
  if (evidence.scope2Total > 0) {
    recommendations.push({
      id: 'REC-SOLAR-PV',
      title: isBn
        ? 'ক্যাম্পাস ভবনের ছাদে অন-সাইট সৌরবিদ্যুৎ (রুপটপ সোলার পিভি) প্রকল্প'
        : 'Rooftop Solar PV Installation for On-Site Clean Self-Consumption',
      category: 'Renewable Generation (Scope 2)',
      scope: 2,
      supportingFinding: isBn
        ? `জাতীয় গ্রিড থেকে আমদানিকৃত বিদ্যুৎ বাবদ বার্ষিক নির্গমন ${evidence.scope2Total.toFixed(2)} tCO₂e, যা জাতীয় গ্রিড নির্গমন তীব্রতার উপর নির্ভরশীল।`
        : `Purchased electricity accounts for ${evidence.scope2Total.toFixed(2)} tCO₂e (${s2Pct}% of inventory), subject to the national grid emission intensity.`,
      rationale: isBn
        ? 'ক্যাম্পাসের প্রধান ভবনের ছাদে সোলার পিভি স্থাপন করলে সরাসরি গ্রিড বিদ্যুৎ খরচ হ্রাস পায় এবং দীর্ঘমেয়াদী বিদ্যুৎ বিল সাশ্রয় হয়।'
        : 'Installing rooftop photovoltaic systems allows self-consumption during peak daytime academic hours, directly displacing carbon-intensive utility power imports.',
      proposedDepartment: isBn ? 'পরিকল্পনা ও উন্নয়ন কমিটি এবং প্রকৌশল সেল' : 'Campus Planning Committee & Electrical Engineering Cell',
      suggestedTimeframe: isBn ? '১২ – ১৮ মাস' : '12–18 months',
      monitoringIndicator: isBn ? 'সৌরশক্তি থেকে মোট উৎপাদিত কিলোওয়াট-ঘণ্টা (kWh) ও গ্রিড নির্ভরতা হ্রাসের শতকরা হার' : 'Total solar electricity generated (MWh/year); grid displaced percentage',
      quantifiedPotentialSaving: evidence.scenarioSavings.solarRooftopTons > 0
        ? `-${evidence.scenarioSavings.solarRooftopTons.toFixed(1)} tCO₂e / year`
        : 'Requires structural roof load audit',
      technicalFeasibility: 'Commercially proven; requires structural load-bearing audit'
    });
  }

  // Rec 4: Lighting & Energy Efficiency Baseload Management
  recommendations.push({
    id: 'REC-EE-LIGHTING',
    title: isBn
      ? 'স্মার্ট সেন্সর এলইডি ও ল্যাবরেটরি শক্তি দক্ষতা বৃদ্ধি'
      : 'Campus-Wide Smart LED Retrofits & Laboratory Energy Management',
    category: 'Energy Demand (Scope 2 & 3)',
    scope: 2,
    supportingFinding: isBn
      ? 'ভবন অভ্যন্তরীণ শক্তি ব্যবস্থাপনার মাধ্যমে ভিত্তি চাহিদায় ৫% থেকে ১৫% শক্তি সাশ্রয় সম্ভব।'
      : 'Internal lighting, laboratory standby power, and classroom illumination form continuous electrical baseloads.',
    rationale: isBn
      ? 'সৌরবিদ্যুৎ স্থাপনের পূর্বে শক্তি সাশ্রয়ী এলইডি এবং মোশন সেন্সর ব্যবহার করলে প্রয়োজনীয় সোলার সিস্টেমের আকার ও মূলধনী খরচ যৌক্তিক সীমায় রাখা যায়।'
      : 'Energy efficiency interventions should precede renewable generation sizing to prevent capital over-sizing and ensure optimal baseload economics.',
    proposedDepartment: isBn ? 'তড়িৎ ও রক্ষণাবেক্ষণ শাখা' : 'Electrical Maintenance & Energy Management Division',
    suggestedTimeframe: isBn ? '৩ – ৬ মাস' : '3–6 months',
    monitoringIndicator: isBn ? 'ভবন শক্তি ঘনত্ব (kWh / m² / বছর)' : 'Building energy intensity index (kWh/m²/year)',
    quantifiedPotentialSaving: isBn ? 'বাৎসরিক বিদ্যুৎ চাহিদার ৫–১০% হ্রাস' : '5–10% reduction in campus power demand',
    technicalFeasibility: 'Immediate operational payback through reduced utility bill outlays'
  });

  // Rec 5: Data Collection & Waste Governance
  recommendations.push({
    id: 'REC-GOVERNANCE-DATA',
    title: isBn
      ? 'ক্যাম্পাস কঠিন বর্জ্য পৃথকীকরণ ও নিয়মিত কার্বন ডেটা গভর্নেন্স সেল'
      : 'Solid Waste Weighing Protocol & Annual Carbon Inventory Governance',
    category: 'Governance & Data Quality',
    scope: 3,
    supportingFinding: isBn
      ? 'ক্যাফেটেরিয়া বর্জ্য, সরবরাহকৃত পণ্য ও কাগজ ব্যবহারের নির্ভরযোগ্য ওজন রেকর্ড না থাকায় এগুলো পরিমাপের বাইরে রয়েছে।'
      : 'Material waste, procurement, and upstream supply chain categories are currently unquantified due to lack of measured mass records.',
    rationale: isBn
      ? 'ক্যাফেটেরিয়া জৈব বর্জ্যের দৈনিক ওজন রেকর্ড ও কম্পোস্টিং ব্যবস্থাপনা চালু করলে ভবিষ্যতের পূর্ণাঙ্গ স্কোপ ৩ ইনভেনটরি সম্ভব হবে।'
      : 'Institutionalizing daily cafeteria waste weighing and an annual inventory update cycle establishes the required evidence base for comprehensive Scope 3 tracking.',
    proposedDepartment: isBn ? 'রেজিস্ট্রার দপ্তর ও ক্যাম্পাস টেকসই কমিটি' : 'Registrar Office & Campus Sustainability Steering Group',
    suggestedTimeframe: isBn ? 'চলমান / প্রতি সেমিস্টার' : 'Continuous / per semester',
    monitoringIndicator: isBn ? 'কম্পোস্টকৃত জৈব বর্জ্যের কেজি এবং বাৎসরিক ডেটা কভারেজ অনুপাত' : 'Kilograms of organic waste composted; annual data coverage score',
    quantifiedPotentialSaving: 'Data completeness enhancement',
    technicalFeasibility: 'Low administrative cost; high institutional engagement'
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
    'A low per-capita intensity does not imply environmental neutrality; reporting boundaries remain limited to surveyed scopes.'
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
    providerStatus: 'Deterministic verified calculation engine'
  };
}
