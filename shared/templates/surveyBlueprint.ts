/**
 * Campus Carbon Bangladesh — Survey Question Blueprint & Google Forms Specification
 *
 * Defines canonical data collection instruments for:
 * 1. Commuter Travel Survey (Individual students, faculty, and administrative staff)
 * 2. Institutional Facilities & Administration Records (Scope 1 fuels & Scope 2 electricity)
 */

export type SurveyInstrumentType = 'commuter_survey' | 'facilities_records';
export type SurveyResponseType = 'multiple_choice' | 'number' | 'text' | 'scale' | 'checkbox';

export interface SurveyQuestionSpec {
  stableFieldId: string;
  questionText: string;
  questionTextBn?: string;
  instrument: SurveyInstrumentType;
  scope: 1 | 2 | 3 | 0; // 0 = administrative / contextual
  responseType: SurveyResponseType;
  unit?: string;
  isRequired: boolean;
  validationRules?: string;
  options?: string[];
  optionsBn?: string[];
  exampleResponse: string;
  destinationCalculationField: string;
  helpText?: string;
  helpTextBn?: string;
}

/**
 * Instrument A: Campus Commuter Travel Survey Blueprint
 * Distributed to students, teachers, and staff.
 */
export const COMMUTER_SURVEY_BLUEPRINT: SurveyQuestionSpec[] = [
  {
    stableFieldId: 'commuter_role',
    questionText: '1. What is your primary affiliation or role at the university?',
    questionTextBn: '১. বিশ্ববিদ্যালয়ে আপনার প্রধান পরিচয় বা পদবী কী?',
    instrument: 'commuter_survey',
    scope: 3,
    responseType: 'multiple_choice',
    isRequired: true,
    options: ['Student', 'Faculty Member / Teacher', 'Administrative Staff'],
    optionsBn: ['শিক্ষার্থী', 'শিক্ষক / ফ্যাকাল্টি মেম্বার', 'কর্মকর্তা / কর্মচারী'],
    exampleResponse: 'Student',
    destinationCalculationField: 'CommuterSurveyResponse.role',
    helpText: 'Used to stratify commuter populations and calculate per-role emissions accurately.'
  },
  {
    stableFieldId: 'reporting_period',
    questionText: '2. Which academic semester or reporting year are you reporting travel for?',
    questionTextBn: '২. আপনি কোন শিক্ষাবর্ষের যাতায়াতের তথ্য প্রদান করছেন?',
    instrument: 'commuter_survey',
    scope: 0,
    responseType: 'multiple_choice',
    isRequired: true,
    options: ['Current Academic Year (2024–2025)', 'Previous Academic Year (2023–2024)', 'Past Year (2022)'],
    exampleResponse: 'Current Academic Year',
    destinationCalculationField: 'CommuterSurveyResponse.reportingYear',
    helpText: 'Ensures survey responses are mapped to the designated baseline inventory period.'
  },
  {
    stableFieldId: 'origin_area',
    questionText: '3. Which metropolitan zone or area do you commute from?',
    questionTextBn: '৩. আপনি মহানগরের কোন এলাকা থেকে ক্যাম্পাসে যাতায়াত করেন?',
    instrument: 'commuter_survey',
    scope: 3,
    responseType: 'multiple_choice',
    isRequired: true,
    options: [
      'Mohammadpur', 'Dhanmondi', 'Mirpur (Sec 1–14)', 'Uttara', 'Farmgate', 
      'Kallyanpur / Shyamoli', 'Adabar', 'Gulshan / Banani / Badda', 'Old Dhaka', 
      'Motijheel / Paltan', 'Rampura / Khilgaon', 'Bashundhara / Kuril', 
      'Savar / Ashulia', 'Gazipur / Narayanganj', 'Other Area'
    ],
    exampleResponse: 'Dhanmondi',
    destinationCalculationField: 'CommuterSurveyResponse.originArea',
    helpText: 'Origin data is privacy-screened (k ≥ 5) before spatial clustering.'
  },
  {
    stableFieldId: 'weekly_days',
    questionText: '4. On average, how many days per week do you commute to campus?',
    questionTextBn: '৪. সপ্তাহে সাধারণত কতদিন ক্যাম্পাসে যাতায়াত করেন?',
    instrument: 'commuter_survey',
    scope: 3,
    responseType: 'scale',
    unit: 'days/week',
    isRequired: true,
    validationRules: 'Integer between 1 and 7',
    options: ['1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days'],
    exampleResponse: '5 days',
    destinationCalculationField: 'CommuterSurveyResponse.annualAttendanceDays',
    helpText: 'Mapped to annual operating days (e.g. 5 days/wk * 49 wks = 245 annual days).'
  },
  {
    stableFieldId: 'primary_mode',
    questionText: '5. What is your primary mode of transportation to campus?',
    questionTextBn: '৫. ক্যাম্পাসে যাতায়াতে আপনার প্রধান যানবাহন মাধ্যম কোনটি?',
    instrument: 'commuter_survey',
    scope: 3,
    responseType: 'multiple_choice',
    isRequired: true,
    options: [
      'Walking',
      'Bicycle',
      'Rickshaw (Human-powered cycle)',
      'Battery-operated Auto-Rickshaw / Easybike',
      'CNG Auto-Rickshaw',
      'Motorcycle',
      'Private Car',
      'Ridesharing (Uber/Pathao Car or CNG)',
      'Public City Bus',
      'Leguna (Human hauler)',
      'University-provided Shuttle Bus',
      'Train / Metro Rail (MRT Line 6)'
    ],
    exampleResponse: 'Public City Bus',
    destinationCalculationField: 'CommuterSurveyResponse.primaryMode',
    helpText: 'Each mode links directly to a peer-reviewed Bangladesh commuter emission factor.'
  },
  {
    stableFieldId: 'is_multimodal',
    questionText: '6. Do you use multiple transportation modes during your typical one-way commute?',
    questionTextBn: '৬. আপনার একমুখী যাতায়াতে কি একাধিক যানবাহন মাধ্যম ব্যবহার করেন?',
    instrument: 'commuter_survey',
    scope: 3,
    responseType: 'multiple_choice',
    isRequired: true,
    options: ['No (Single mode only)', 'Yes (Multimodal trip)'],
    exampleResponse: 'Yes (Multimodal trip)',
    destinationCalculationField: 'CommuterSurveyResponse.isMultimodal',
    helpText: 'Identifies transfer journeys such as Rickshaw to Metro Rail or Bus to Walking.'
  },
  {
    stableFieldId: 'one_way_km',
    questionText: '7. What is your approximate one-way travel distance to campus in kilometers (km)?',
    questionTextBn: '৭. ক্যাম্পাস পর্যন্ত আপনার আনুমানিক একমুখী দূরত্ব কত কিলোমিটার (কিমি)?',
    instrument: 'commuter_survey',
    scope: 3,
    responseType: 'number',
    unit: 'km',
    isRequired: true,
    validationRules: 'Decimal number between 0.1 and 100.0',
    exampleResponse: '8.5',
    destinationCalculationField: 'CommuterSurveyResponse.totalOneWayKm',
    helpText: 'One-way distance is automatically doubled for round-trip calculations.'
  },
  {
    stableFieldId: 'car_fuel_type',
    questionText: '8. If you travel by Private Car, what fuel type does the vehicle use?',
    questionTextBn: '৮. ব্যক্তিগত গাড়ি ব্যবহার করলে জ্বালানির ধরন কোনটি?',
    instrument: 'commuter_survey',
    scope: 3,
    responseType: 'multiple_choice',
    isRequired: false,
    options: ['Octane / Gasoline', 'CNG (Compressed Natural Gas)', 'Diesel', 'Hybrid (Octane/Electric)', 'Not Applicable / Do not use private car'],
    exampleResponse: 'Octane / Gasoline',
    destinationCalculationField: 'CommuterSurveyResponse.carFuelType',
    helpText: 'Applies specific fuel carbon intensity (e.g. 280.9 gCO2/km for Octane cars).'
  },
  {
    stableFieldId: 'car_occupancy',
    questionText: '9. If you travel by Private Car, how many passengers (including driver) typically share the vehicle?',
    questionTextBn: '৯. গাড়িতে চালকসহ মোট কতজন যাত্রী যাতায়াত করেন?',
    instrument: 'commuter_survey',
    scope: 3,
    responseType: 'number',
    unit: 'passengers',
    isRequired: false,
    validationRules: 'Integer between 1 and 6',
    exampleResponse: '1',
    destinationCalculationField: 'CommuterSurveyResponse.carOccupancy',
    helpText: 'Vehicle emissions are divided by occupancy to calculate individual passenger emissions.'
  },
  {
    stableFieldId: 'uses_institutional_fleet',
    questionText: '10. Do you commute using official university-owned buses or vans?',
    questionTextBn: '১০. আপনি কি বিশ্ববিদ্যালয় পরিচালিত অফিসিয়াল বাস বা শাটল ব্যবহার করেন?',
    instrument: 'commuter_survey',
    scope: 3,
    responseType: 'multiple_choice',
    isRequired: true,
    options: ['No', 'Yes'],
    exampleResponse: 'No',
    destinationCalculationField: 'CommuterSurveyResponse.usesInstitutionalFleet',
    helpText: 'CRITICAL SAFEGUARD: University bus fuel is accounted for in Scope 1 fleet fuel. Marking Yes avoids double-counting fleet trips in Scope 3.'
  }
];

/**
 * Instrument B: Institutional Facilities Records Blueprint
 * Distributed to Engineering, Accounts, and Facilities Managers.
 */
export const FACILITIES_RECORDS_BLUEPRINT: SurveyQuestionSpec[] = [
  {
    stableFieldId: 's1_gen_diesel',
    questionText: 'Emergency Backup Generator Fuel Consumption',
    instrument: 'facilities_records',
    scope: 1,
    responseType: 'number',
    unit: 'Liters (L)',
    isRequired: true,
    validationRules: 'Number ≥ 0',
    exampleResponse: '9112.8',
    destinationCalculationField: 'ActivityRecord.quantity (category: stationary_combustion_generator)',
    helpText: 'Total commercial diesel fuel consumed across all on-campus backup generators during grid outages.'
  },
  {
    stableFieldId: 's1_fleet_octane',
    questionText: 'Official University Vehicle Fleet Fuel — Octane',
    instrument: 'facilities_records',
    scope: 1,
    responseType: 'number',
    unit: 'Liters (L)',
    isRequired: true,
    validationRules: 'Number ≥ 0',
    exampleResponse: '8593.2',
    destinationCalculationField: 'ActivityRecord.quantity (category: mobile_combustion_fleet, fuel: Octane)',
    helpText: 'Octane fuel purchased for university administration sedans, ambulances, and vans.'
  },
  {
    stableFieldId: 's1_fleet_diesel',
    questionText: 'University Transport Shuttles Fuel — Diesel',
    instrument: 'facilities_records',
    scope: 1,
    responseType: 'number',
    unit: 'Liters (L)',
    isRequired: true,
    validationRules: 'Number ≥ 0',
    exampleResponse: '19128.8',
    destinationCalculationField: 'ActivityRecord.quantity (category: mobile_combustion_fleet, fuel: Diesel)',
    helpText: 'Diesel purchased for university-owned campus buses and shuttle vehicles.'
  },
  {
    stableFieldId: 's1_cafeteria_lpg',
    questionText: 'Campus Cafeteria Cooking Gas (Commercial LPG)',
    instrument: 'facilities_records',
    scope: 1,
    responseType: 'number',
    unit: 'Kilograms (kg)',
    isRequired: true,
    validationRules: 'Number ≥ 0',
    exampleResponse: '12720.0',
    destinationCalculationField: 'ActivityRecord.quantity (category: cooking_combustion_cafeteria)',
    helpText: 'Total mass of commercial LPG cylinders consumed in campus cafeterias (e.g. 1060 cylinders of 12 kg = 12,720 kg).'
  },
  {
    stableFieldId: 's1_refrig_r410a',
    questionText: 'Air Conditioning Refrigerant Top-Up (R-410A HFC)',
    instrument: 'facilities_records',
    scope: 1,
    responseType: 'number',
    unit: 'Kilograms (kg)',
    isRequired: true,
    validationRules: 'Number ≥ 0',
    exampleResponse: '136.0',
    destinationCalculationField: 'ActivityRecord.quantity (category: refrigerant_fugitive_ac, fuel: R-410A)',
    helpText: 'Annual top-up mass replaced during servicing of split AC and central VRF systems.'
  },
  {
    stableFieldId: 's1_refrig_r22',
    questionText: 'Legacy Refrigerant Top-Up (R-22 / HCFC-22 — Montreal Protocol ODS)',
    instrument: 'facilities_records',
    scope: 1,
    responseType: 'number',
    unit: 'Kilograms (kg)',
    isRequired: false,
    validationRules: 'Number ≥ 0',
    exampleResponse: '163.0',
    destinationCalculationField: 'ActivityRecord.quantity (category: refrigerant_fugitive_ac, fuel: R-22)',
    helpText: 'Reported separately under Montreal Protocol Out-of-Scope Disclosures in standard accounting.'
  },
  {
    stableFieldId: 's2_grid_electricity',
    questionText: 'Purchased National Grid Utility Electricity',
    instrument: 'facilities_records',
    scope: 2,
    responseType: 'number',
    unit: 'Kilowatt-Hours (kWh)',
    isRequired: true,
    validationRules: 'Number > 0',
    exampleResponse: '641412.0',
    destinationCalculationField: 'ActivityRecord.quantity (category: purchased_electricity_grid)',
    helpText: 'Sum of 12 monthly electric utility bills (DPDC, DESCO, BREB, WZPDCL).'
  }
];

export const FULL_SURVEY_BLUEPRINT: SurveyQuestionSpec[] = [
  ...COMMUTER_SURVEY_BLUEPRINT,
  ...FACILITIES_RECORDS_BLUEPRINT
];

/**
 * Generates an executable Google Apps Script file (.gs) that programmatically
 * creates the Commuter Survey Google Form in the user's Google Drive.
 */
export function generateGoogleFormsAppsScript(): string {
  return `/**
 * =========================================================================
 * Campus Carbon Bangladesh — Automated Google Forms Survey Generator
 * =========================================================================
 * 
 * Purpose:
 * Creates a structured, standardized Commuter Carbon Survey in Google Forms
 * with built-in validation, role stratification, and privacy protection.
 *
 * How to Run:
 * 1. Open Google Drive (drive.google.com).
 * 2. Click "+ New" -> "More" -> "Google Apps Script".
 * 3. Delete any default code in Code.gs, paste this entire script, and click Save.
 * 4. At the top toolbar, select "createCampusCommuterSurvey" and click "Run".
 * 5. Review the permissions dialog (Authorizes Google Forms creation only).
 * 6. The script creates the form and logs the Edit URL and Public Share URL!
 * 
 * Privacy & Ethical Safeguards:
 * - "setCollectEmail(false)" is explicitly enforced.
 * - No respondent names, student IDs, or street addresses are collected.
 * - Results map directly to the Campus Carbon Bangladesh importer.
 */

function createCampusCommuterSurvey() {
  var form = FormApp.create('Campus Commuter Carbon & Travel Survey');
  
  form.setDescription(
    'Welcome to our university carbon assessment survey.\\n\\n' +
    'This anonymous survey gathers daily travel data to quantify greenhouse gas emissions ' +
    'and design sustainable campus transportation policies. It takes about 2 to 3 minutes to complete.\\n\\n' +
    'Privacy Notice: No personal names, email addresses, or phone numbers are collected.'
  );
  
  form.setIsQuiz(false);
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false);

  // Section 1: Affiliation
  var roleItem = form.addMultipleChoiceItem();
  roleItem.setTitle('1. What is your primary affiliation or role at the university?')
    .setHelpText('Please select the primary capacity in which you attend campus.')
    .setChoiceValues([
      'Student',
      'Faculty Member / Teacher',
      'Administrative Staff'
    ])
    .setRequired(true);

  // Section 2: Origin Neighborhood
  var originItem = form.addListItem();
  originItem.setTitle('2. Which metropolitan zone or area do you commute from?')
    .setHelpText('Select the neighborhood where your daily journey begins.')
    .setChoiceValues([
      'Mohammadpur',
      'Dhanmondi',
      'Mirpur (Sec 1–14)',
      'Uttara',
      'Farmgate',
      'Kallyanpur / Shyamoli',
      'Adabar',
      'Gulshan / Banani / Badda',
      'Old Dhaka',
      'Motijheel / Paltan',
      'Rampura / Khilgaon',
      'Bashundhara / Kuril',
      'Savar / Ashulia',
      'Gazipur / Narayanganj',
      'Other Metropolitan Area'
    ])
    .setRequired(true);

  // Section 3: Attendance Frequency
  var daysItem = form.addScaleItem();
  daysItem.setTitle('3. On average, how many days per week do you commute to campus?')
    .setBounds(1, 7)
    .setLabels('1 day / week', '7 days / week')
    .setRequired(true);

  // Section 4: Primary Transportation Mode
  var modeItem = form.addMultipleChoiceItem();
  modeItem.setTitle('4. What is your primary mode of transportation to campus?')
    .setHelpText('Choose the mode that covers the largest portion of your daily travel distance.')
    .setChoiceValues([
      'Walking',
      'Bicycle',
      'Rickshaw (Human-powered cycle)',
      'Battery-operated Auto-Rickshaw / Easybike',
      'CNG Auto-Rickshaw',
      'Motorcycle',
      'Private Car',
      'Ridesharing (Uber/Pathao Car or CNG)',
      'Public City Bus',
      'Leguna (Human hauler)',
      'University-provided Shuttle Bus',
      'Train / Metro Rail (MRT Line 6)'
    ])
    .setRequired(true);

  // Section 5: Multimodal Journey
  var multiItem = form.addMultipleChoiceItem();
  multiItem.setTitle('5. Do you use multiple transportation modes during your typical one-way commute?')
    .setChoiceValues([
      'No (Single mode only)',
      'Yes (Multimodal trip)'
    ])
    .setRequired(true);

  // Section 6: One-Way Travel Distance
  var distanceItem = form.addTextItem();
  distanceItem.setTitle('6. What is your approximate one-way travel distance to campus in kilometers (km)?')
    .setHelpText('Enter a numeric distance (e.g. 5, 8.5, 12). If unsure, use Google Maps to check the route distance.')
    .setRequired(true);
  
  // Set numeric validation (greater than 0)
  var textValidation = FormApp.createTextValidation()
    .setHelpText('Please enter a valid positive number for distance in kilometers.')
    .requireNumberGreaterThan(0)
    .build();
  distanceItem.setValidation(textValidation);

  // Section 7: Private Car Details (Conditional)
  var carFuelItem = form.addMultipleChoiceItem();
  carFuelItem.setTitle('7. If you travel by Private Car, what fuel type does the vehicle use?')
    .setChoiceValues([
      'Octane / Gasoline',
      'CNG (Compressed Natural Gas)',
      'Diesel',
      'Hybrid (Octane/Electric)',
      'Not Applicable / Do not use private car'
    ])
    .setRequired(false);

  var carOccItem = form.addTextItem();
  carOccItem.setTitle('8. If you travel by Private Car, how many passengers (including driver) typically share the vehicle?')
    .setHelpText('Enter average headcount (e.g. 1 if solo driver, 2 if carpooling). Leave blank if not applicable.')
    .setRequired(false);

  // Section 8: Institutional Fleet Double-Counting Prevention
  var fleetItem = form.addMultipleChoiceItem();
  fleetItem.setTitle('9. Do you commute using official university-owned buses or vans?')
    .setHelpText('Important: Official university bus fuel is accounted for separately under university direct operations.')
    .setChoiceValues([
      'No',
      'Yes'
    ])
    .setRequired(true);

  // Log outputs
  Logger.log('====================================================');
  Logger.log('FORM CREATED SUCCESSFULLY!');
  Logger.log('Edit URL (Form Admin): ' + form.getEditUrl());
  Logger.log('Public Survey Share URL: ' + form.getPublishedUrl());
  Logger.log('====================================================');
}
`;
}

/**
 * Normalizes an imported Google Forms responses CSV into canonical CommuterSurveyResponse objects.
 * Handles messy headers, variations in naming, and returns row-level validation errors.
 */
export interface CommuterImportResult {
  totalRows: number;
  validCommuters: Array<{
    id: string;
    role: 'student' | 'faculty' | 'staff';
    originArea: string;
    primaryMode: string;
    totalOneWayKm: number;
    annualAttendanceDays: number;
    distanceBasis: 'one_way';
    usesInstitutionalFleet: boolean;
    carFuelType?: string;
    carOccupancy?: number;
  }>;
  errors: Array<{
    rowNumber: number;
    field: string;
    error: string;
    rawValue: string;
  }>;
  warnings: string[];
}

export function parseGoogleFormsExportCsv(
  csvText: string, 
  institutionId: string = 'INST-USER',
  annualOperatingDays: number = 294
): CommuterImportResult {
  const result: CommuterImportResult = {
    totalRows: 0,
    validCommuters: [],
    errors: [],
    warnings: []
  };

  if (!csvText || !csvText.trim()) {
    result.errors.push({ rowNumber: 0, field: 'file', error: 'CSV file is empty', rawValue: '' });
    return result;
  }

  // Parse CSV lines handling quoted fields
  const parseCsvLine = (line: string): string[] => {
    const entries: string[] = [];
    let current = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        entries.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    entries.push(current.trim());
    return entries;
  };

  const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) {
    result.errors.push({ rowNumber: 1, field: 'header', error: 'File contains header only, no survey responses found', rawValue: '' });
    return result;
  }

  const header = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Detect column indexes flexibly based on keywords
  const findCol = (keywords: string[]): number => {
    return header.findIndex(h => keywords.some(kw => h.includes(kw)));
  };

  const colRole = findCol(['role', 'affiliation', 'identity', 'designation', 'status']);
  const colOrigin = findCol(['origin', 'area', 'neighborhood', 'zone', 'living', 'from']);
  const colMode = findCol(['mode', 'transportation', 'transport', 'vehicle', 'travelby']);
  const colDistance = findCol(['distance', 'km', 'kilometer', 'onewaykm']);
  const colDays = findCol(['days', 'perweek', 'frequency', 'weekly']);
  const colFleet = findCol(['fleet', 'universitybus', 'officialbus', 'institutional']);
  const colFuel = findCol(['fuel', 'carfuel', 'octane', 'cng']);
  const colOcc = findCol(['occupancy', 'passenger', 'sharing', 'sharethevehicle']);

  result.totalRows = lines.length - 1;

  for (let idx = 1; idx < lines.length; idx++) {
    const rowNum = idx + 1;
    const cols = parseCsvLine(lines[idx]);
    if (cols.length === 0 || cols.every(c => c === '')) continue;

    // 1. Role
    const rawRole = colRole >= 0 && cols[colRole] ? cols[colRole].toLowerCase() : 'student';
    let role: 'student' | 'faculty' | 'staff' = 'student';
    if (rawRole.includes('teach') || rawRole.includes('facult') || rawRole.includes('prof')) {
      role = 'faculty';
    } else if (rawRole.includes('staff') || rawRole.includes('admin') || rawRole.includes('offic')) {
      role = 'staff';
    } else if (rawRole.includes('stud')) {
      role = 'student';
    }

    // 2. Origin
    const originArea = colOrigin >= 0 && cols[colOrigin] ? cols[colOrigin] : 'Dhaka Metropolitan';

    // 3. Mode normalization
    const rawMode = colMode >= 0 && cols[colMode] ? cols[colMode].toLowerCase() : '';
    let primaryMode = 'walking';
    if (rawMode.includes('car') || rawMode.includes('automobile') || rawMode.includes('uber')) {
      primaryMode = 'private_car';
    } else if (rawMode.includes('bus') && !rawMode.includes('university') && !rawMode.includes('shuttle')) {
      primaryMode = 'public_bus';
    } else if (rawMode.includes('cng') || rawMode.includes('auto-rickshaw') || rawMode.includes('autorickshaw')) {
      primaryMode = 'cng_auto_rickshaw';
    } else if (rawMode.includes('motorcycle') || rawMode.includes('bike') || rawMode.includes('scooter')) {
      primaryMode = 'motorcycle';
    } else if (rawMode.includes('battery') || rawMode.includes('easybike') || rawMode.includes('easy')) {
      primaryMode = 'battery_rickshaw';
    } else if (rawMode.includes('rickshaw') && !rawMode.includes('cng') && !rawMode.includes('battery')) {
      primaryMode = 'rickshaw';
    } else if (rawMode.includes('leguna') || rawMode.includes('hauler') || rawMode.includes('human')) {
      primaryMode = 'leguna';
    } else if (rawMode.includes('bicycle') || rawMode.includes('cycle')) {
      primaryMode = 'bicycle';
    } else if (rawMode.includes('walk')) {
      primaryMode = 'walking';
    } else if (rawMode.includes('shuttle') || rawMode.includes('institutional') || rawMode.includes('university')) {
      primaryMode = 'institutional_bus';
    } else if (rawMode.includes('metro') || rawMode.includes('train') || rawMode.includes('mrt')) {
      primaryMode = 'public_bus'; // mapped to mass transit factor
    } else {
      if (rawMode) {
        result.warnings.push(`Row ${rowNum}: Mode "${cols[colMode]}" unrecognized, defaulted to Walking.`);
      }
    }

    // 4. Distance validation
    const rawDist = colDistance >= 0 ? cols[colDistance] : '5.0';
    const cleanedDist = rawDist.replace(/[^0-9.-]/g, '').trim();
    const numDist = parseFloat(cleanedDist);
    if (isNaN(numDist) || numDist <= 0 || numDist > 120) {
      result.errors.push({
        rowNumber: rowNum,
        field: 'Distance (km)',
        error: 'Distance must be a positive number between 0.1 and 120 km',
        rawValue: rawDist
      });
      continue;
    }

    // 5. Weekly Days / Attendance
    const rawDays = colDays >= 0 ? cols[colDays] : '5';
    let daysPerWk = parseInt(rawDays.replace(/[^0-9]/g, ''), 10);
    if (isNaN(daysPerWk) || daysPerWk < 1 || daysPerWk > 7) {
      daysPerWk = 5;
    }
    const annualAttendanceDays = Math.round(daysPerWk * (annualOperatingDays / 6));

    // 6. Fleet double counting check
    const rawFleet = colFleet >= 0 ? cols[colFleet].toLowerCase() : '';
    const usesInstitutionalFleet = rawFleet.includes('yes') || rawFleet === 'true' || rawFleet === '1' || primaryMode === 'institutional_bus';

    // 7. Car Fuel & Occupancy
    let carFuelType: string | undefined = undefined;
    if (colFuel >= 0 && cols[colFuel]) {
      const f = cols[colFuel].toLowerCase();
      if (f.includes('octane') || f.includes('gasoline')) carFuelType = 'octane';
      else if (f.includes('cng')) carFuelType = 'cng';
      else if (f.includes('diesel')) carFuelType = 'diesel';
      else if (f.includes('hybrid')) carFuelType = 'hybrid';
    }

    let carOccupancy: number | undefined = undefined;
    if (colOcc >= 0 && cols[colOcc]) {
      const occ = parseInt(cols[colOcc].replace(/[^0-9]/g, ''), 10);
      if (!isNaN(occ) && occ >= 1 && occ <= 6) {
        carOccupancy = occ;
      }
    }

    result.validCommuters.push({
      id: `COMM-IMPORT-${rowNum}`,
      role,
      originArea,
      primaryMode,
      totalOneWayKm: numDist,
      annualAttendanceDays,
      distanceBasis: 'one_way',
      usesInstitutionalFleet,
      carFuelType,
      carOccupancy
    });
  }

  return result;
}
