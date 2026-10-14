import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Flame, 
  Zap, 
  Car, 
  ClipboardCheck, 
  BarChart3, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  FileSpreadsheet, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Upload, 
  HelpCircle, 
  ChevronRight,
  Eye,
  Trash2,
  Plus,
  FileCode,
  FileText,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  Institution, 
  PopulationRecord, 
  CampusBoundary, 
  ActivityRecord, 
  CommuterSurveyResponse, 
  InventoryCalculationResult 
} from '../../../shared/types';
import { calculateInventory } from '../../../shared/engine/calculator';
import { LEGACY_ULAB_2022_FIXTURE } from '../../../shared/engine/legacy-reproduction';
import { 
  COMMUTER_SURVEY_BLUEPRINT, 
  FACILITIES_RECORDS_BLUEPRINT, 
  FULL_SURVEY_BLUEPRINT, 
  generateGoogleFormsAppsScript, 
  parseGoogleFormsExportCsv,
  CommuterImportResult 
} from '../../../shared/templates/surveyBlueprint';
import { AssessmentReport } from './AssessmentReport';
import { Language, t } from '../../../shared/i18n';

interface AssessmentFlowProps {
  lang: Language;
  onExploreExampleReport?: () => void;
  initialMode?: 'landing' | 'active' | 'example';
}

export type AssessmentRoute = 'templates' | 'manual';
export type SourceDataStatus = 'reported' | 'confirmed_zero' | 'not_applicable' | 'not_collected';

export const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ lang, initialMode }) => {
  const isBn = lang === 'bn';

  // Master Mode: 'landing' (choose route or example) | 'active' (stepper 1..6) | 'example' (ULAB 2022 report)
  const [masterMode, setMasterMode] = useState<'landing' | 'active' | 'example'>(() => {
    if (initialMode) return initialMode;
    if (typeof window !== 'undefined' && (window.location.hash.includes('example') || window.location.hash.includes('demo'))) {
      return 'example';
    }
    return 'landing';
  });

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.includes('example') || window.location.hash.includes('demo')) {
        setMasterMode('example');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [route, setRoute] = useState<AssessmentRoute>('manual');
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Blueprint Preview Modal
  const [previewBlueprintInstrument, setPreviewBlueprintInstrument] = useState<'commuter' | 'facilities' | null>(null);

  // -------------------------------------------------------------
  // STEP 1: Institution Details (Starts blank and unknown)
  // -------------------------------------------------------------
  const [institutionName, setInstitutionName] = useState<string>('');
  const [institutionNameBn, setInstitutionNameBn] = useState<string>('');
  const [institutionType, setInstitutionType] = useState<'private' | 'public' | 'international'>('private');
  const [division, setDivision] = useState<string>('Dhaka');
  const [district, setDistrict] = useState<string>('Dhaka');
  const [address, setAddress] = useState<string>('');
  const [reportingYear, setReportingYear] = useState<number>(new Date().getFullYear() - 1);
  const [periodStart, setPeriodStart] = useState<string>(`${new Date().getFullYear() - 1}-01-01`);
  const [periodEnd, setPeriodEnd] = useState<string>(`${new Date().getFullYear() - 1}-12-31`);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState<boolean>(false);

  // Operational Control Boundary
  const [hasOperationalControl, setHasOperationalControl] = useState<boolean>(true);

  // Population Denominator (Starts unknown / blank, NOT zero, NOT ULAB numbers)
  const [studentHeadcount, setStudentHeadcount] = useState<string>('');
  const [facultyHeadcount, setFacultyHeadcount] = useState<string>('');
  const [staffHeadcount, setStaffHeadcount] = useState<string>('');
  const [operatingDays, setOperatingDays] = useState<string>('');

  // Physical campus metrics
  const [floorAreaM2, setFloorAreaM2] = useState<string>('');
  const [landAreaAcres, setLandAreaAcres] = useState<string>('');

  // -------------------------------------------------------------
  // STEP 2: Scope 1 Quantities & Statuses (Reported | Confirmed Zero | N/A | Not Collected)
  // -------------------------------------------------------------
  const [genDieselStatus, setGenDieselStatus] = useState<SourceDataStatus>('reported');
  const [genDieselLitres, setGenDieselLitres] = useState<string>('');

  const [fleetOctaneStatus, setFleetOctaneStatus] = useState<SourceDataStatus>('reported');
  const [fleetOctaneLitres, setFleetOctaneLitres] = useState<string>('');

  const [fleetDieselStatus, setFleetDieselStatus] = useState<SourceDataStatus>('reported');
  const [fleetDieselLitres, setFleetDieselLitres] = useState<string>('');

  const [cafeteriaLpgStatus, setCafeteriaLpgStatus] = useState<SourceDataStatus>('reported');
  const [cafeteriaLpgKg, setCafeteriaLpgKg] = useState<string>('');

  const [acR410AStatus, setAcR410AStatus] = useState<SourceDataStatus>('reported');
  const [acR410AKg, setAcR410AKg] = useState<string>('');

  const [acR22Status, setAcR22Status] = useState<SourceDataStatus>('confirmed_zero');
  const [acR22Kg, setAcR22Kg] = useState<string>('');

  // -------------------------------------------------------------
  // STEP 3: Scope 2 Quantities & Statuses
  // -------------------------------------------------------------
  const [gridElectricityStatus, setGridElectricityStatus] = useState<SourceDataStatus>('reported');
  const [gridElectricityKWh, setGridElectricityKWh] = useState<string>('');

  // -------------------------------------------------------------
  // STEP 4: Scope 3 Quantities & Commuting
  // -------------------------------------------------------------
  const [commuterSurveyStatus, setCommuterSurveyStatus] = useState<SourceDataStatus>('reported');
  const [surveySampleSize, setSurveySampleSize] = useState<string>('300');
  const [avgOneWayKm, setAvgOneWayKm] = useState<string>('8.5');
  const [avgWeeklyDays, setAvgWeeklyDays] = useState<string>('4.5');
  const [carSharePct, setCarSharePct] = useState<string>('8.5');
  const [busSharePct, setBusSharePct] = useState<string>('25.0');
  const [cngSharePct, setCngSharePct] = useState<string>('8.0');
  const [motorcycleSharePct, setMotorcycleSharePct] = useState<string>('8.0');
  const [rickshawSharePct, setRickshawSharePct] = useState<string>('25.0');
  const [walkSharePct, setWalkSharePct] = useState<string>('25.5');

  // Imported Commuters from Google Forms CSV
  const [importedCommuters, setImportedCommuters] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<CommuterImportResult | null>(null);
  const [importErrorDetails, setImportErrorDetails] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STEP 6: Calculated Run Result
  // -------------------------------------------------------------
  const [userCalculationRun, setUserCalculationRun] = useState<InventoryCalculationResult | null>(null);

  // -------------------------------------------------------------
  // Pre-calculated ULAB 2022 Benchmark Fixture
  // -------------------------------------------------------------
  const [ulabBenchmarkResult] = useState<InventoryCalculationResult>(() => {
    return calculateInventory(
      LEGACY_ULAB_2022_FIXTURE.activities,
      LEGACY_ULAB_2022_FIXTURE.population,
      LEGACY_ULAB_2022_FIXTURE.commuters,
      { tier: 'legacy_study_reproduction', includeOdsInScope1: true, separateTdLosses: false }
    );
  });

  const stepContainerRef = useRef<HTMLDivElement>(null);

  // Helper trigger downloads in browser
  const triggerDownload = (filename: string, content: string, mime: string = 'text/plain') => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save / Load Draft to LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('CC_ASSESSMENT_DRAFT');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.institutionName) setInstitutionName(parsed.institutionName);
        if (parsed.institutionNameBn) setInstitutionNameBn(parsed.institutionNameBn);
        if (parsed.studentHeadcount) setStudentHeadcount(parsed.studentHeadcount);
        if (parsed.facultyHeadcount) setFacultyHeadcount(parsed.facultyHeadcount);
        if (parsed.staffHeadcount) setStaffHeadcount(parsed.staffHeadcount);
        if (parsed.operatingDays) setOperatingDays(parsed.operatingDays);
        if (parsed.genDieselLitres) setGenDieselLitres(parsed.genDieselLitres);
        if (parsed.fleetOctaneLitres) setFleetOctaneLitres(parsed.fleetOctaneLitres);
        if (parsed.fleetDieselLitres) setFleetDieselLitres(parsed.fleetDieselLitres);
        if (parsed.cafeteriaLpgKg) setCafeteriaLpgKg(parsed.cafeteriaLpgKg);
        if (parsed.acR410AKg) setAcR410AKg(parsed.acR410AKg);
        if (parsed.gridElectricityKWh) setGridElectricityKWh(parsed.gridElectricityKWh);
        if (parsed.activeStep && parsed.activeStep > 1) {
          setActiveStep(parsed.activeStep);
          setMasterMode('active');
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved draft from localStorage:', e);
    }
  }, []);

  const handleSaveDraft = () => {
    const draft = {
      institutionName,
      institutionNameBn,
      institutionType,
      division,
      district,
      address,
      reportingYear,
      studentHeadcount,
      facultyHeadcount,
      staffHeadcount,
      operatingDays,
      floorAreaM2,
      landAreaAcres,
      genDieselLitres,
      genDieselStatus,
      fleetOctaneLitres,
      fleetDieselLitres,
      cafeteriaLpgKg,
      cafeteriaLpgStatus,
      acR410AKg,
      acR410AStatus,
      gridElectricityKWh,
      gridElectricityStatus,
      commuterSurveyStatus,
      activeStep,
      route,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('CC_ASSESSMENT_DRAFT', JSON.stringify(draft));
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 3000);
    } catch (e) {
      console.error('Failed to save draft to localStorage:', e);
    }
  };

  // Helper validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!institutionName.trim()) {
        errs.institutionName = isBn ? 'প্রতিষ্ঠানের নাম প্রদান আবশ্যক।' : 'Institution official name is required.';
      }
      if (!studentHeadcount || Number(studentHeadcount) < 0) {
        errs.studentHeadcount = isBn ? 'শিক্ষার্থী সংখ্যা উল্লেখ করুন।' : 'Please enter student headcount.';
      }
      if (!facultyHeadcount || Number(facultyHeadcount) < 0) {
        errs.facultyHeadcount = isBn ? 'শিক্ষক সংখ্যা উল্লেখ করুন।' : 'Please enter faculty headcount.';
      }
      if (!staffHeadcount || Number(staffHeadcount) < 0) {
        errs.staffHeadcount = isBn ? 'কর্মকর্তা/কর্মচারী সংখ্যা উল্লেখ করুন।' : 'Please enter staff headcount.';
      }
      if (!operatingDays || Number(operatingDays) <= 0 || Number(operatingDays) > 366) {
        errs.operatingDays = isBn ? 'বাৎসরিক কার্যকর দিন (১–৩৬৫) লিখুন।' : 'Please enter campus operating days per year (e.g. 250–300).';
      }
    } else if (step === 2) {
      if (genDieselStatus === 'reported' && (!genDieselLitres || Number(genDieselLitres) < 0)) {
        errs.genDieselLitres = 'Please specify generator fuel in liters, or choose Confirmed zero / N/A.';
      }
      if (cafeteriaLpgStatus === 'reported' && (!cafeteriaLpgKg || Number(cafeteriaLpgKg) < 0)) {
        errs.cafeteriaLpgKg = 'Please enter cafeteria LPG in kg, or choose Confirmed zero / N/A.';
      }
    } else if (step === 3) {
      if (gridElectricityStatus === 'reported' && (!gridElectricityKWh || Number(gridElectricityKWh) <= 0)) {
        errs.gridElectricityKWh = 'Purchased grid electricity (kWh) must be greater than zero.';
      }
    }

    setValidationErrors(errs);
    if (Object.keys(errs).length > 0) {
      stepContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setValidationErrors({});
      setActiveStep(prev => Math.min(prev + 1, 6));
      stepContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevStep = () => {
    setValidationErrors({});
    setActiveStep(prev => Math.max(prev - 1, 1));
    stepContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Google Forms Response CSV Upload Handler
  const handleGoogleFormCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const opDays = Number(operatingDays) || 294;
      const parsed = parseGoogleFormsExportCsv(text, 'INST-USER', opDays);
      setImportSummary(parsed);
      if (parsed.validCommuters.length > 0) {
        setImportedCommuters(parsed.validCommuters);
        setCommuterSurveyStatus('reported');
        setSurveySampleSize(String(parsed.validCommuters.length));
      }
    };
    reader.readAsText(file);
  };

  // Execute Calculation for Step 6
  const executeCalculation = () => {
    const s = Number(studentHeadcount) || 0;
    const f = Number(facultyHeadcount) || 0;
    const st = Number(staffHeadcount) || 0;
    const days = Number(operatingDays) || 294;
    const totalPop = s + f + st;

    const population: PopulationRecord = {
      id: 'POP-USER',
      institutionId: 'INST-USER',
      year: reportingYear,
      studentHeadcount: s,
      facultyHeadcount: f,
      staffHeadcount: st,
      totalHeadcount: totalPop || 1,
      campusOperatingDaysPerYear: days,
      sourceCitation: 'Self-Reported Institutional Census'
    };

    const activities: ActivityRecord[] = [];
    const unquantified: string[] = [];

    // Scope 1: Generator
    if (genDieselStatus === 'reported' && Number(genDieselLitres) > 0) {
      activities.push({
        id: 'ACT-S1-GEN',
        institutionId: 'INST-USER',
        campusId: 'CAMPUS-1',
        inventoryId: 'INV-USER',
        scope: 1,
        category: 'stationary_combustion_generator',
        name: 'Emergency Backup Generator (Diesel)',
        quantity: Number(genDieselLitres),
        unit: 'L',
        fuelOrGasType: 'Diesel',
        isMonthly: false,
        dataQualityTier: 'billed',
        createdAt: new Date().toISOString()
      });
    } else if (genDieselStatus === 'not_collected') {
      unquantified.push('Backup generator diesel fuel');
    }

    // Scope 1: Fleet Octane
    if (fleetOctaneStatus === 'reported' && Number(fleetOctaneLitres) > 0) {
      activities.push({
        id: 'ACT-S1-OCT',
        institutionId: 'INST-USER',
        campusId: 'CAMPUS-1',
        inventoryId: 'INV-USER',
        scope: 1,
        category: 'mobile_combustion_fleet',
        name: 'Official University Vehicles (Octane)',
        quantity: Number(fleetOctaneLitres),
        unit: 'L',
        fuelOrGasType: 'Octane',
        isMonthly: false,
        dataQualityTier: 'billed',
        createdAt: new Date().toISOString()
      });
    }

    // Scope 1: Fleet Diesel
    if (fleetDieselStatus === 'reported' && Number(fleetDieselLitres) > 0) {
      activities.push({
        id: 'ACT-S1-DSL',
        institutionId: 'INST-USER',
        campusId: 'CAMPUS-1',
        inventoryId: 'INV-USER',
        scope: 1,
        category: 'mobile_combustion_fleet',
        name: 'Campus Shuttles & Transport (Diesel)',
        quantity: Number(fleetDieselLitres),
        unit: 'L',
        fuelOrGasType: 'Diesel',
        isMonthly: false,
        dataQualityTier: 'billed',
        createdAt: new Date().toISOString()
      });
    }

    // Scope 1: Cafeteria LPG
    if (cafeteriaLpgStatus === 'reported' && Number(cafeteriaLpgKg) > 0) {
      activities.push({
        id: 'ACT-S1-LPG',
        institutionId: 'INST-USER',
        campusId: 'CAMPUS-1',
        inventoryId: 'INV-USER',
        scope: 1,
        category: 'cooking_combustion_cafeteria',
        name: 'Campus Cafeteria Cooking (LPG)',
        quantity: Number(cafeteriaLpgKg),
        unit: 'kg',
        fuelOrGasType: 'LPG',
        isMonthly: false,
        dataQualityTier: 'billed',
        createdAt: new Date().toISOString()
      });
    } else if (cafeteriaLpgStatus === 'not_collected') {
      unquantified.push('Cafeteria cooking LPG');
    }

    // Scope 1: AC R-410A
    if (acR410AStatus === 'reported' && Number(acR410AKg) > 0) {
      activities.push({
        id: 'ACT-S1-R410A',
        institutionId: 'INST-USER',
        campusId: 'CAMPUS-1',
        inventoryId: 'INV-USER',
        scope: 1,
        category: 'refrigerant_fugitive_ac',
        name: 'HVAC Air Conditioning Top-Up (R-410A)',
        quantity: Number(acR410AKg),
        unit: 'kg',
        fuelOrGasType: 'R-410A',
        isMonthly: false,
        dataQualityTier: 'estimated',
        createdAt: new Date().toISOString()
      });
    } else if (acR410AStatus === 'not_collected') {
      unquantified.push('Air conditioning refrigerant top-ups');
    }

    // Scope 1: AC R-22
    if (acR22Status === 'reported' && Number(acR22Kg) > 0) {
      activities.push({
        id: 'ACT-S1-R22',
        institutionId: 'INST-USER',
        campusId: 'CAMPUS-1',
        inventoryId: 'INV-USER',
        scope: 1,
        category: 'refrigerant_fugitive_ac',
        name: 'HVAC Air Conditioning Top-Up (R-22)',
        quantity: Number(acR22Kg),
        unit: 'kg',
        fuelOrGasType: 'R-22',
        isMonthly: false,
        dataQualityTier: 'estimated',
        createdAt: new Date().toISOString()
      });
    }

    // Scope 2: Grid Electricity
    if (gridElectricityStatus === 'reported' && Number(gridElectricityKWh) > 0) {
      activities.push({
        id: 'ACT-S2-GRID',
        institutionId: 'INST-USER',
        campusId: 'CAMPUS-1',
        inventoryId: 'INV-USER',
        scope: 2,
        category: 'purchased_electricity_grid',
        name: 'Purchased Utility Grid Electricity',
        quantity: Number(gridElectricityKWh),
        unit: 'kWh',
        isMonthly: false,
        dataQualityTier: 'billed',
        createdAt: new Date().toISOString()
      });
    } else if (gridElectricityStatus === 'not_collected') {
      unquantified.push('Purchased utility electricity');
    }

    // Scope 3: Commuter Responses (from real Google Form import OR guided survey synthesis)
    let commuterResponses: CommuterSurveyResponse[] = [];
    if (importedCommuters.length > 0) {
      commuterResponses = importedCommuters.map(c => ({
        id: c.id,
        institutionId: 'INST-USER',
        campusId: 'CAMPUS-1',
        role: c.role,
        originArea: c.originArea,
        annualAttendanceDays: c.annualAttendanceDays,
        primaryMode: c.primaryMode,
        totalOneWayKm: c.totalOneWayKm,
        distanceBasis: 'one_way',
        usesInstitutionalFleet: c.usesInstitutionalFleet,
        carFuelType: c.carFuelType,
        carOccupancy: c.carOccupancy
      }));
    } else if (commuterSurveyStatus === 'reported') {
      const sampleN = Number(surveySampleSize) || 100;
      const km = Number(avgOneWayKm) || 8.0;
      const attDays = Number(avgWeeklyDays) ? Number(avgWeeklyDays) * (days / 6) : 200;

      const nCar = Math.round(sampleN * ((Number(carSharePct) || 10) / 100));
      const nBus = Math.round(sampleN * ((Number(busSharePct) || 25) / 100));
      const nCng = Math.round(sampleN * ((Number(cngSharePct) || 10) / 100));
      const nBike = Math.round(sampleN * ((Number(motorcycleSharePct) || 10) / 100));
      const nRick = Math.round(sampleN * ((Number(rickshawSharePct) || 25) / 100));
      const nWalk = Math.max(0, sampleN - (nCar + nBus + nCng + nBike + nRick));

      for (let i = 0; i < nCar; i++) {
        commuterResponses.push({
          id: `COMM-CAR-${i}`,
          institutionId: 'INST-USER',
          campusId: 'CAMPUS-1',
          role: i % 3 === 0 ? 'faculty' : 'student',
          originArea: 'Metropolitan Zone',
          primaryMode: 'private_car',
          totalOneWayKm: km * 1.2,
          annualAttendanceDays: attDays,
          distanceBasis: 'one_way',
          usesInstitutionalFleet: false,
          carFuelType: 'octane',
          carOccupancy: 1.2
        });
      }
      for (let i = 0; i < nBus; i++) {
        commuterResponses.push({
          id: `COMM-BUS-${i}`,
          institutionId: 'INST-USER',
          campusId: 'CAMPUS-1',
          role: 'student',
          originArea: 'Metropolitan Zone',
          primaryMode: 'public_bus',
          totalOneWayKm: km,
          annualAttendanceDays: attDays,
          distanceBasis: 'one_way',
          usesInstitutionalFleet: false
        });
      }
      for (let i = 0; i < nCng; i++) {
        commuterResponses.push({
          id: `COMM-CNG-${i}`,
          institutionId: 'INST-USER',
          campusId: 'CAMPUS-1',
          role: 'student',
          originArea: 'Metropolitan Zone',
          primaryMode: 'cng_auto_rickshaw',
          totalOneWayKm: km * 0.9,
          annualAttendanceDays: attDays,
          distanceBasis: 'one_way',
          usesInstitutionalFleet: false
        });
      }
      for (let i = 0; i < nBike; i++) {
        commuterResponses.push({
          id: `COMM-MTR-${i}`,
          institutionId: 'INST-USER',
          campusId: 'CAMPUS-1',
          role: 'student',
          originArea: 'Metropolitan Zone',
          primaryMode: 'motorcycle',
          totalOneWayKm: km,
          annualAttendanceDays: attDays,
          distanceBasis: 'one_way',
          usesInstitutionalFleet: false
        });
      }
      for (let i = 0; i < nRick; i++) {
        commuterResponses.push({
          id: `COMM-RCK-${i}`,
          institutionId: 'INST-USER',
          campusId: 'CAMPUS-1',
          role: 'student',
          originArea: 'Campus Neighborhood',
          primaryMode: 'rickshaw',
          totalOneWayKm: km * 0.4,
          annualAttendanceDays: attDays,
          distanceBasis: 'one_way',
          usesInstitutionalFleet: false
        });
      }
      for (let i = 0; i < nWalk; i++) {
        commuterResponses.push({
          id: `COMM-WLK-${i}`,
          institutionId: 'INST-USER',
          campusId: 'CAMPUS-1',
          role: 'student',
          originArea: 'Campus Neighborhood',
          primaryMode: 'walking',
          totalOneWayKm: km * 0.2,
          annualAttendanceDays: attDays,
          distanceBasis: 'one_way',
          usesInstitutionalFleet: false
        });
      }
    } else if (commuterSurveyStatus === 'not_collected') {
      unquantified.push('Commuter travel');
    }

    const result = calculateInventory(activities, population, commuterResponses, {
      tier: 'current_inventory_method',
      includeOdsInScope1: false,
      separateTdLosses: true
    });

    if (unquantified.length > 0) {
      result.unquantifiedCategories = unquantified;
    }

    setUserCalculationRun(result);
    setActiveStep(6);
  };

  // Helper objects for Step 6 report view
  const activeUserInstitution: Institution = {
    id: 'INST-USER',
    name: institutionName.trim() || 'Institutional Assessment',
    nameBn: institutionNameBn.trim() || undefined,
    type: institutionType,
    division,
    district,
    address,
    consolidationMethod: 'operational_control',
    reportingYear,
    periodStart,
    periodEnd,
    periodType: 'calendar_year',
    optInPublicComparison: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const activeUserPopulation: PopulationRecord = {
    id: 'POP-USER',
    institutionId: 'INST-USER',
    year: reportingYear,
    studentHeadcount: Number(studentHeadcount) || 0,
    facultyHeadcount: Number(facultyHeadcount) || 0,
    staffHeadcount: Number(staffHeadcount) || 0,
    totalHeadcount: (Number(studentHeadcount) || 0) + (Number(facultyHeadcount) || 0) + (Number(staffHeadcount) || 0),
    campusOperatingDaysPerYear: Number(operatingDays) || 294,
    sourceCitation: 'Institutional Census'
  };

  const activeUserBoundary: CampusBoundary = {
    id: 'CAMPUS-USER',
    institutionId: 'INST-USER',
    name: 'Main Campus',
    isMainCampus: true,
    centerCoordinates: [23.7547, 90.3582],
    grossFloorAreaM2: Number(floorAreaM2) || 0,
    landAreaAcres: Number(landAreaAcres) || 0,
    numberOfBuildings: 2,
    geometrySource: 'drawn',
    confirmedByInstitution: true
  };

  // -------------------------------------------------------------
  // RENDERING: MODE = 'example' (ULAB 2022 Fixture)
  // -------------------------------------------------------------
  if (masterMode === 'example') {
    return (
      <AssessmentReport
        institution={{
          id: 'INST-ULAB',
          name: 'University of Liberal Arts Bangladesh',
          nameBn: 'ইউনিভার্সিটি অব লিবারেল আর্টস বাংলাদেশ',
          type: 'private',
          division: 'Dhaka',
          district: 'Dhaka',
          address: 'Permanent Campus, Mohammadpur, Dhaka 1207, Bangladesh',
          consolidationMethod: 'operational_control',
          reportingYear: 2022,
          periodStart: '2022-01-01',
          periodEnd: '2022-12-31',
          periodType: 'calendar_year',
          optInPublicComparison: true,
          createdAt: '2022-01-01T00:00:00Z',
          updatedAt: '2025-09-02T10:00:00Z'
        }}
        population={LEGACY_ULAB_2022_FIXTURE.population}
        boundary={{
          id: 'CAMPUS-ULAB-PERMANENT',
          institutionId: 'INST-ULAB',
          name: 'Permanent Campus',
          isMainCampus: true,
          centerCoordinates: [23.7547, 90.3582],
          grossFloorAreaM2: 24500,
          landAreaAcres: 5.5,
          numberOfBuildings: 3,
          geometrySource: 'drawn',
          confirmedByInstitution: true
        }}
        result={ulabBenchmarkResult}
        isExample={true}
        onReturnToAssessment={() => {
          window.location.hash = 'assessment';
          setMasterMode(activeStep > 1 || institutionName ? 'active' : 'landing');
        }}
        lang={lang}
      />
    );
  }

  // -------------------------------------------------------------
  // RENDERING: MODE = 'landing' (Two Choices + Example Entry Point)
  // -------------------------------------------------------------
  if (masterMode === 'landing') {
    return (
      <div className="space-y-12 max-w-5xl mx-auto py-6 pb-20">
        {/* Landing Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 border border-navy-200 text-xs font-semibold text-navy-800">
            <span>{isBn ? 'প্রাতিষ্ঠানিক কার্বন মূল্যায়ন' : 'Institutional Carbon Assessment'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            {isBn ? 'আপনার বিশ্ববিদ্যালয়ের মূল্যায়ন পদ্ধতি বেছে নিন' : 'Choose how you want to supply your data'}
          </h1>
          <p className="text-sm text-navy-600">
            {isBn
              ? 'বিদ্যমান নথি ও বিল সরাসরি প্রবেশ করান অথবা আমাদের নির্ধারিত টেমপ্লেট ডাউনলোড করে তথ্য সংগ্রহ করুন।'
              : 'Select your preferred data entry route to calculate your campus greenhouse gas inventory.'}
          </p>
        </div>

        {/* Two Clear Choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Choice 1: Collect data using survey templates */}
          <div 
            onClick={() => {
              setRoute('templates');
              setMasterMode('active');
            }}
            className="group bg-white p-8 rounded-3xl border-2 border-navy-100 hover:border-cobalt transition duration-200 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-navy-900 group-hover:text-cobalt transition">
                  {isBn ? 'জরিপ টেমপ্লেট ব্যবহার করে তথ্য সংগ্রহ' : 'Collect data using survey templates'}
                </h3>
                <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
                  {isBn
                    ? 'প্রমিত স্প্রেডশিট ডাউনলোড করুন, ক্যাম্পাসের বিভিন্ন বিভাগ থেকে জ্বালানি রেকর্ড ও জরিপের তথ্য সংগ্রহ করে আপলোড করুন।'
                    : 'Download structured survey blueprints, auto-generate Google Forms, gather campus records across departments, then upload response files.'}
                </p>
              </div>
              <div className="text-xs text-navy-500 space-y-1.5 pt-2 border-t border-navy-50">
                <div className="flex items-center gap-1.5">• <span>Complete Google Forms creation script (Apps Script)</span></div>
                <div className="flex items-center gap-1.5">• <span>Downloadable Question Blueprint (JSON / CSV)</span></div>
                <div className="flex items-center gap-1.5">• <span>Direct Google Forms response CSV importer</span></div>
              </div>
            </div>

            <button className="w-full py-3 px-4 rounded-xl bg-navy-50 group-hover:bg-cobalt text-navy-800 group-hover:text-white font-bold text-xs transition flex items-center justify-center gap-2">
              <span>{isBn ? 'টেমপ্লেট সংগ্রহ রুট চালু করুন' : 'Start with survey templates'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Choice 2: Enter existing data */}
          <div 
            onClick={() => {
              setRoute('manual');
              setMasterMode('active');
            }}
            className="group bg-white p-8 rounded-3xl border-2 border-navy-100 hover:border-cobalt transition duration-200 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cobalt/10 text-cobalt flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-navy-900 group-hover:text-cobalt transition">
                  {isBn ? 'বিদ্যমান তথ্য সরাসরি প্রবেশ করান' : 'Enter existing data'}
                </h3>
                <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
                  {isBn
                    ? 'আপনার কাছে ইতিমধ্যে থাকা বার্ষিক বিদ্যুৎ বিল, জেনারেটরের রসিদ ও যাতায়াতের হিসাব দিয়ে ধাপে ধাপে মূল্যায়ন সম্পন্ন করুন।'
                    : 'Use institutional records you already have to complete the assessment step by step using structured online entry forms.'}
                </p>
              </div>
              <div className="text-xs text-navy-500 space-y-1.5 pt-2 border-t border-navy-50">
                <div className="flex items-center gap-1.5">• <span>Step-by-step guided entry for each emission scope</span></div>
                <div className="flex items-center gap-1.5">• <span>Live emission formula previews and unit conversions</span></div>
                <div className="flex items-center gap-1.5">• <span>Distinguish Confirmed zero, N/A, and Not collected</span></div>
              </div>
            </div>

            <button className="w-full py-3 px-4 rounded-xl bg-navy-50 group-hover:bg-cobalt text-navy-800 group-hover:text-white font-bold text-xs transition flex items-center justify-center gap-2">
              <span>{isBn ? 'সরাসরি তথ্য প্রবেশ রুট চালু করুন' : 'Enter existing data step by step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The ONLY Prominent Example Entry Point */}
        <div className="pt-4 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-4 sm:px-6 rounded-2xl bg-white border border-navy-100 shadow-2xs">
            <span className="text-xs text-navy-600 font-medium">
              {isBn ? 'আগে দেখতে চান সম্পূর্ণ প্রতিবেদন কেমন হবে?' : 'Want to see what an official assessment report looks like?'}
            </span>
            <button
              onClick={() => setMasterMode('example')}
              className="text-xs font-bold text-cobalt hover:text-cobalt-700 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{isBn ? 'ইউল্যাব ২০২২ উদাহরণ মূল্যায়ন প্রতিবেদন দেখুন' : 'See what your assessment report will look like'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDERING: STEPPER WORKFLOW (Steps 1 to 6)
  // -------------------------------------------------------------
  const steps = [
    { num: 1, label: isBn ? 'প্রতিষ্ঠান ও সময়কাল' : 'Institution & Period', icon: Building2 },
    { num: 2, label: isBn ? 'স্কোপ ১' : 'Scope 1', icon: Flame },
    { num: 3, label: isBn ? 'স্কোপ ২' : 'Scope 2', icon: Zap },
    { num: 4, label: isBn ? 'স্কোপ ৩' : 'Scope 3', icon: Car },
    { num: 5, label: isBn ? 'পর্যালোচনা' : 'Review', icon: ClipboardCheck },
    { num: 6, label: isBn ? 'ফলাফল' : 'Results', icon: BarChart3 }
  ];

  return (
    <div ref={stepContainerRef} className="space-y-8 max-w-5xl mx-auto pb-20 font-sans">
      {/* 1. Persistent Numbered Stepper & Selected Route Indicator */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-navy-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-50 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-navy-800">
              {institutionName.trim() ? institutionName : (isBn ? 'নতুন মূল্যায়ন খসড়া' : 'New Assessment Draft')}
            </span>
            <span className="text-navy-300">•</span>
            <span className="text-xs text-navy-500">
              {route === 'templates' ? 'Route: Survey templates & Google Forms' : 'Route: Enter existing data'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRoute(route === 'templates' ? 'manual' : 'templates')}
              className="text-[11px] font-semibold text-cobalt hover:underline cursor-pointer"
            >
              Switch to {route === 'templates' ? 'manual entry' : 'template collection'}
            </button>
            <span className="text-navy-300">•</span>
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-700 hover:text-navy-900 bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-200 cursor-pointer"
            >
              <Save className="w-3 h-3 text-navy-500" />
              <span>{draftSavedToast ? 'Draft saved!' : 'Save draft'}</span>
            </button>
            <span className="text-navy-300">•</span>
            <button
              onClick={() => setMasterMode('example')}
              className="text-[11px] font-medium text-navy-500 hover:text-cobalt cursor-pointer"
            >
              View ULAB 2022 example
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {steps.map((st) => {
            const isCurrent = activeStep === st.num;
            const isCompleted = activeStep > st.num;

            return (
              <button
                key={st.num}
                onClick={() => {
                  if (st.num < activeStep || validateStep(activeStep)) {
                    setActiveStep(st.num);
                  }
                }}
                className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer border ${
                  isCurrent
                    ? 'bg-cobalt text-white border-cobalt shadow-2xs'
                    : isCompleted
                    ? 'bg-emerald-50/60 text-emerald-900 border-emerald-200 hover:bg-emerald-100/50'
                    : 'bg-navy-50/50 text-navy-400 border-transparent'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-extrabold ${
                  isCurrent ? 'bg-white text-cobalt' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-navy-200 text-navy-600'
                }`}>
                  {isCompleted ? '✓' : st.num}
                </div>
                <span className="truncate">{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Step Views */}

      {/* STEP 1: Institution Details */}
      {activeStep === 1 && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-navy-100 shadow-2xs space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">Step 1 of 5</span>
            <h2 className="text-2xl font-bold text-navy-900">
              {isBn ? 'প্রতিষ্ঠান ও হিসাবরক্ষণ সময়কাল' : 'Institution & Reporting Period'}
            </h2>
            <p className="text-xs text-navy-600">
              {isBn
                ? 'আপনার বিশ্ববিদ্যালয়ের প্রাতিষ্ঠানিক নাম এবং হিসাবের জন্য জনসংখ্যার ভিত্তি প্রদান করুন।'
                : 'Enter your institution official name, designated 12-month reporting period, and campus community population.'}
            </p>
          </div>

          <div className="space-y-5">
            {/* Single Official Name Field (Initially blank, Unicode accepted) */}
            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                {isBn ? 'প্রতিষ্ঠানের নাম (বাংলা বা ইংরেজিতে) *' : 'Institution Official Name (English or বাংলা) *'}
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => {
                  setInstitutionName(e.target.value);
                  if (validationErrors.institutionName) {
                    setValidationErrors(prev => ({ ...prev, institutionName: '' }));
                  }
                }}
                placeholder="Enter your institution's official name"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-navy-900 placeholder-navy-300 focus:outline-none ${
                  validationErrors.institutionName ? 'border-coral-500 bg-coral-50/20' : 'border-navy-200 focus:border-cobalt'
                }`}
              />
              {validationErrors.institutionName && (
                <p className="text-[11px] text-coral-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{validationErrors.institutionName}</span>
                </p>
              )}
            </div>

            {/* Reporting Period & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">Reporting Calendar Year *</label>
                <input
                  type="number"
                  value={reportingYear}
                  onChange={(e) => setReportingYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">Period Start Date</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs text-navy-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">Period End Date</label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs text-navy-900"
                />
              </div>
            </div>

            {/* Population Denominator (Starts blank/unknown) */}
            <div className="bg-navy-50/40 p-5 rounded-2xl border border-navy-100 space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-navy-800">
                  {isBn ? 'ক্যাম্পাস জনসংখ্যা ও কার্যকর দিন (মাথাপিছু সূচকের জন্য) *' : 'Campus Community Population & Operating Days *'}
                </h3>
                <p className="text-[11px] text-navy-500">
                  Used as the official denominator for per-capita intensity metrics. Inputs begin empty, not prefilled.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-navy-700 mb-1">Students *</label>
                  <input
                    type="number"
                    value={studentHeadcount}
                    onChange={(e) => setStudentHeadcount(e.target.value)}
                    placeholder="e.g. 4000"
                    className={`w-full px-3 py-2 rounded-xl border text-xs text-navy-900 font-mono ${
                      validationErrors.studentHeadcount ? 'border-coral-500 bg-coral-50/20' : 'border-navy-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy-700 mb-1">Faculty *</label>
                  <input
                    type="number"
                    value={facultyHeadcount}
                    onChange={(e) => setFacultyHeadcount(e.target.value)}
                    placeholder="e.g. 200"
                    className={`w-full px-3 py-2 rounded-xl border text-xs text-navy-900 font-mono ${
                      validationErrors.facultyHeadcount ? 'border-coral-500 bg-coral-50/20' : 'border-navy-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy-700 mb-1">Staff *</label>
                  <input
                    type="number"
                    value={staffHeadcount}
                    onChange={(e) => setStaffHeadcount(e.target.value)}
                    placeholder="e.g. 150"
                    className={`w-full px-3 py-2 rounded-xl border text-xs text-navy-900 font-mono ${
                      validationErrors.staffHeadcount ? 'border-coral-500 bg-coral-50/20' : 'border-navy-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy-700 mb-1">Operating Days *</label>
                  <input
                    type="number"
                    value={operatingDays}
                    onChange={(e) => setOperatingDays(e.target.value)}
                    placeholder="e.g. 280"
                    className={`w-full px-3 py-2 rounded-xl border text-xs text-navy-900 font-mono ${
                      validationErrors.operatingDays ? 'border-coral-500 bg-coral-50/20' : 'border-navy-200'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Operational Boundary & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-navy-100 bg-white space-y-2">
                <span className="text-xs font-bold text-navy-800">Campus Physical Footprint (Separate units)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-navy-600">Building Floor Area (m²)</label>
                    <input
                      type="number"
                      value={floorAreaM2}
                      onChange={(e) => setFloorAreaM2(e.target.value)}
                      placeholder="e.g. 22000"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-navy-600">Campus Land Area (acres)</label>
                    <input
                      type="number"
                      value={landAreaAcres}
                      onChange={(e) => setLandAreaAcres(e.target.value)}
                      placeholder="e.g. 5.0"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-navy-100 bg-white space-y-2">
                <span className="text-xs font-bold text-navy-800">Operational Control Confirmation</span>
                <p className="text-[11px] text-navy-500">
                  Does your university exercise full operational authority over campus facilities and policies?
                </p>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-navy-700 cursor-pointer">
                    <input
                      type="radio"
                      checked={hasOperationalControl}
                      onChange={() => setHasOperationalControl(true)}
                    />
                    <span>Yes (Operational Control)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-navy-700 cursor-pointer">
                    <input
                      type="radio"
                      checked={!hasOperationalControl}
                      onChange={() => setHasOperationalControl(false)}
                    />
                    <span>Financial / Equity Share</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Scope 1 (Direct Operations) */}
      {activeStep === 2 && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-navy-100 shadow-2xs space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase">Step 2 of 5</span>
            <h2 className="text-2xl font-bold text-navy-900">
              Scope 1 — Direct Campus Emissions
            </h2>
            <p className="text-xs text-navy-600 leading-relaxed bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60">
              <strong>Scope 1 direct emissions:</strong> fuel combustion from sources the university owns or controls (emergency generators, official administration vehicles, cafeteria cooking gas) and eligible air conditioning refrigerant leakage. Collate monthly fuel requisition slips, logbooks, and HVAC servicing invoices.
            </p>
          </div>

          <div className="space-y-4">
            {/* Generator Diesel */}
            <div className="p-4 rounded-2xl border border-navy-100 bg-navy-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-900">Emergency Backup Generator (Diesel)</span>
                <div className="text-[11px] text-navy-500">Factor: 2.676 kg CO₂/L (EPA 2024 / IPCC)</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={genDieselStatus}
                  onChange={(e: any) => setGenDieselStatus(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white"
                >
                  <option value="reported">Reported value</option>
                  <option value="confirmed_zero">Confirmed zero</option>
                  <option value="not_applicable">Not applicable</option>
                  <option value="not_collected">Not collected</option>
                </select>
                {genDieselStatus === 'reported' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={genDieselLitres}
                      onChange={(e) => setGenDieselLitres(e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                    />
                    <span className="text-xs text-navy-500">Liters</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fleet Octane */}
            <div className="p-4 rounded-2xl border border-navy-100 bg-navy-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-900">Official Vehicles — Octane Fuel</span>
                <div className="text-[11px] text-navy-500">Factor: 2.308 kg CO₂/L</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={fleetOctaneStatus}
                  onChange={(e: any) => setFleetOctaneStatus(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white"
                >
                  <option value="reported">Reported value</option>
                  <option value="confirmed_zero">Confirmed zero</option>
                  <option value="not_applicable">Not applicable</option>
                  <option value="not_collected">Not collected</option>
                </select>
                {fleetOctaneStatus === 'reported' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={fleetOctaneLitres}
                      onChange={(e) => setFleetOctaneLitres(e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                    />
                    <span className="text-xs text-navy-500">Liters</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fleet Diesel */}
            <div className="p-4 rounded-2xl border border-navy-100 bg-navy-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-900">University Transport Shuttles — Diesel</span>
                <div className="text-[11px] text-navy-500">Factor: 2.687 kg CO₂/L</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={fleetDieselStatus}
                  onChange={(e: any) => setFleetDieselStatus(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white"
                >
                  <option value="reported">Reported value</option>
                  <option value="confirmed_zero">Confirmed zero</option>
                  <option value="not_applicable">Not applicable</option>
                  <option value="not_collected">Not collected</option>
                </select>
                {fleetDieselStatus === 'reported' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={fleetDieselLitres}
                      onChange={(e) => setFleetDieselLitres(e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                    />
                    <span className="text-xs text-navy-500">Liters</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cafeteria LPG */}
            <div className="p-4 rounded-2xl border border-navy-100 bg-navy-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-900">Campus Cafeteria Cooking (Commercial LPG)</span>
                <div className="text-[11px] text-navy-500">Factor: 3.00 kg CO₂/kg LPG (IPCC Mass Factor)</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={cafeteriaLpgStatus}
                  onChange={(e: any) => setCafeteriaLpgStatus(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white"
                >
                  <option value="reported">Reported value</option>
                  <option value="confirmed_zero">Confirmed zero</option>
                  <option value="not_applicable">Not applicable</option>
                  <option value="not_collected">Not collected</option>
                </select>
                {cafeteriaLpgStatus === 'reported' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={cafeteriaLpgKg}
                      onChange={(e) => setCafeteriaLpgKg(e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                    />
                    <span className="text-xs text-navy-500">kg</span>
                  </div>
                )}
              </div>
            </div>

            {/* AC R-410A */}
            <div className="p-4 rounded-2xl border border-navy-100 bg-navy-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-900">AC Refrigerant Fugitives (R-410A HFC Top-Up)</span>
                <div className="text-[11px] text-navy-500">GWP: 2,255.5 kg CO₂e/kg (IPCC AR6 100-year)</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={acR410AStatus}
                  onChange={(e: any) => setAcR410AStatus(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white"
                >
                  <option value="reported">Reported value</option>
                  <option value="confirmed_zero">Confirmed zero</option>
                  <option value="not_applicable">Not applicable</option>
                  <option value="not_collected">Not collected</option>
                </select>
                {acR410AStatus === 'reported' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={acR410AKg}
                      onChange={(e) => setAcR410AKg(e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                    />
                    <span className="text-xs text-navy-500">kg added</span>
                  </div>
                )}
              </div>
            </div>

            {/* AC R-22 */}
            <div className="p-4 rounded-2xl border border-navy-100 bg-navy-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-navy-900">Legacy AC Units (R-22 / HCFC-22 Top-Up)</span>
                <div className="text-[11px] text-navy-500">Montreal Protocol ODS • Separately disclosed memo item</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={acR22Status}
                  onChange={(e: any) => setAcR22Status(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white"
                >
                  <option value="confirmed_zero">Confirmed zero (No R-22 units)</option>
                  <option value="reported">Reported value</option>
                  <option value="not_applicable">Not applicable</option>
                  <option value="not_collected">Not collected</option>
                </select>
                {acR22Status === 'reported' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={acR22Kg}
                      onChange={(e) => setAcR22Kg(e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                    />
                    <span className="text-xs text-navy-500">kg added</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Scope 2 (Purchased Electricity) */}
      {activeStep === 3 && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-navy-100 shadow-2xs space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">Step 3 of 5</span>
            <h2 className="text-2xl font-bold text-navy-900">
              Scope 2 — Purchased Electricity
            </h2>
            <p className="text-xs text-navy-600 leading-relaxed bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200/60">
              <strong>Scope 2 emissions:</strong> emissions associated with purchased electricity imported and consumed by campus facilities. Enter total kilowatt-hours (kWh) summed across 12 monthly utility billing statements (e.g. DPDC, DESCO, BREB).
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-navy-100 bg-navy-50/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-navy-900">National Grid Utility Electricity Consumption</span>
                  <div className="text-[11px] text-navy-500">
                    SREDA Grid Factor: 0.637861 kg CO₂e/kWh • 11% T&D grid losses allocated to Scope 3 Category 3
                  </div>
                </div>

                <select
                  value={gridElectricityStatus}
                  onChange={(e: any) => setGridElectricityStatus(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white"
                >
                  <option value="reported">Reported value</option>
                  <option value="confirmed_zero">Confirmed zero (100% off-grid)</option>
                  <option value="not_collected">Not collected</option>
                </select>
              </div>

              {gridElectricityStatus === 'reported' && (
                <div className="space-y-2 pt-2 border-t border-navy-100">
                  <label className="block text-xs font-semibold text-navy-700">
                    Annual Purchased Grid Electricity (kWh) *
                  </label>
                  <div className="flex items-center gap-2 max-w-sm">
                    <input
                      type="number"
                      value={gridElectricityKWh}
                      onChange={(e) => {
                        setGridElectricityKWh(e.target.value);
                        if (validationErrors.gridElectricityKWh) {
                          setValidationErrors(prev => ({ ...prev, gridElectricityKWh: '' }));
                        }
                      }}
                      placeholder="e.g. 641412"
                      className={`w-full px-3 py-2 rounded-xl border text-sm font-mono text-navy-900 ${
                        validationErrors.gridElectricityKWh ? 'border-coral-500 bg-coral-50/20' : 'border-navy-200'
                      }`}
                    />
                    <span className="text-xs text-navy-500 font-bold">kWh</span>
                  </div>
                  {validationErrors.gridElectricityKWh && (
                    <p className="text-[11px] text-coral-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{validationErrors.gridElectricityKWh}</span>
                    </p>
                  )}
                  {Number(gridElectricityKWh) > 0 && (
                    <div className="text-xs text-navy-600 bg-white p-3 rounded-xl border border-navy-100 font-mono">
                      Estimated generation emissions: <strong>{((Number(gridElectricityKWh) * 0.637861) / 1000).toFixed(2)} tCO₂e</strong>
                      <span className="text-[11px] text-navy-400 block">+ 11% T&D grid loss (Scope 3 Category 3)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Scope 3 (Commuting & Google Forms Package) */}
      {activeStep === 4 && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-navy-100 shadow-2xs space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-purple-600 uppercase">Step 4 of 5</span>
            <h2 className="text-2xl font-bold text-navy-900">
              Scope 3 — Commuting & Indirect Activities
            </h2>
            <p className="text-xs text-navy-600 leading-relaxed bg-purple-50/50 p-3.5 rounded-2xl border border-purple-200/60">
              <strong>Scope 3 indirect emissions:</strong> passenger travel by students, faculty, and administrative staff, plus upstream grid transmission and distribution losses. Other value chain categories (e.g. procurement, solid waste) remain outside boundary unless surveyed.
            </p>
          </div>

          {/* Section 2: Complete Google Forms Template Package */}
          <div className="p-6 rounded-3xl border-2 border-navy-100 bg-navy-50/30 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-cobalt" />
                  <span>Google Forms Commuter Survey Package</span>
                </h3>
                <p className="text-xs text-navy-600 mt-0.5">
                  Generate your university Google Form in one click, collect anonymous student responses, and import the export CSV directly.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPreviewBlueprintInstrument('commuter')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-navy-100 border border-navy-200 text-navy-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cobalt" />
                  <span>Preview questions</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerDownload('survey_question_blueprint.json', JSON.stringify(FULL_SURVEY_BLUEPRINT, null, 2), 'application/json')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-navy-100 border border-navy-200 text-navy-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-navy-600" />
                  <span>Blueprint (.json)</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerDownload('CampusCarbon_CommuterSurvey_GoogleFormsGenerator.gs', generateGoogleFormsAppsScript(), 'text/plain')}
                  className="px-3 py-1.5 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Download Google Apps Script (.gs)</span>
                </button>
              </div>
            </div>

            {/* Workflow Banner: Download -> Create Form -> Collect -> Export -> Upload -> Review -> Calculate */}
            <div className="p-4 rounded-2xl bg-white border border-navy-100 space-y-2">
              <span className="text-[11px] font-bold text-navy-700 uppercase tracking-wider block">Standard Collection Workflow:</span>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">1. Download Script</div>
                <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">2. Run in Apps Script</div>
                <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">3. Collect Responses</div>
                <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">4. Export CSV</div>
                <div className="p-2 rounded-xl bg-cobalt/10 font-bold text-cobalt border border-cobalt/20">5. Upload Below</div>
                <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">6. Review</div>
                <div className="p-2 rounded-xl bg-emerald-50 font-semibold text-emerald-800">7. Calculate</div>
              </div>
            </div>

            {/* Google Forms Response CSV Upload Area */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-navy-200 bg-white text-center space-y-3">
              <Upload className="w-8 h-8 text-cobalt mx-auto" />
              <div>
                <label className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs cursor-pointer inline-block shadow-2xs transition">
                  <span>Upload Google Forms Responses CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGoogleFormCsvUpload(file);
                    }}
                  />
                </label>
                <p className="text-[11px] text-navy-400 mt-1">Accepts standard Google Forms response export sheets.</p>
              </div>

              {importSummary && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Successfully mapped {importSummary.validCommuters.length} of {importSummary.totalRows} survey rows!</span>
                    </span>
                    <span>Ready for calculation</span>
                  </div>

                  {importSummary.errors.length > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-coral-200 text-coral-800 space-y-1">
                      <span className="font-bold block">Validation notices ({importSummary.errors.length} rows required adjustments):</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {importSummary.errors.slice(0, 5).map((err, eIdx) => (
                          <li key={eIdx}>Row {err.rowNumber}: {err.field} — {err.error} (raw: "{err.rawValue}")</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fallback Guided Sample Entry (if no Google Forms CSV uploaded yet) */}
          {importedCommuters.length === 0 && (
            <div className="p-5 rounded-2xl border border-navy-100 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-50 pb-2">
                <div>
                  <span className="text-xs font-bold text-navy-900">Alternative: Guided Aggregate Sample Entry</span>
                  <p className="text-[11px] text-navy-500">If you already have survey summary percentages, enter them directly below.</p>
                </div>

                <select
                  value={commuterSurveyStatus}
                  onChange={(e: any) => setCommuterSurveyStatus(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white"
                >
                  <option value="reported">Survey available</option>
                  <option value="not_collected">Not collected / Outside boundary</option>
                </select>
              </div>

              {commuterSurveyStatus === 'reported' && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-700 mb-1">Survey Sample Size (n)</label>
                      <input
                        type="number"
                        value={surveySampleSize}
                        onChange={(e) => setSurveySampleSize(e.target.value)}
                        placeholder="e.g. 350"
                        className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-700 mb-1">Average One-Way Distance (km)</label>
                      <input
                        type="number"
                        value={avgOneWayKm}
                        onChange={(e) => setAvgOneWayKm(e.target.value)}
                        placeholder="e.g. 8.5"
                        className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-700 mb-1">Campus Days / Week</label>
                      <input
                        type="number"
                        value={avgWeeklyDays}
                        onChange={(e) => setAvgWeeklyDays(e.target.value)}
                        placeholder="e.g. 4.5"
                        className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-navy-50 space-y-2">
                    <span className="text-xs font-bold text-navy-800">Commuting Modal Split (% of respondents)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-navy-600">Solo Car (%):</label>
                        <input
                          type="number"
                          value={carSharePct}
                          onChange={(e) => setCarSharePct(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-navy-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-navy-600">Public Bus (%):</label>
                        <input
                          type="number"
                          value={busSharePct}
                          onChange={(e) => setBusSharePct(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-navy-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-navy-600">CNG Rickshaw (%):</label>
                        <input
                          type="number"
                          value={cngSharePct}
                          onChange={(e) => setCngSharePct(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-navy-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-navy-600">Motorcycle (%):</label>
                        <input
                          type="number"
                          value={motorcycleSharePct}
                          onChange={(e) => setMotorcycleSharePct(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-navy-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-navy-600">Cycle Rickshaw (%):</label>
                        <input
                          type="number"
                          value={rickshawSharePct}
                          onChange={(e) => setRickshawSharePct(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-navy-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-navy-600">Walking / Bicycle (%):</label>
                        <input
                          type="number"
                          value={walkSharePct}
                          onChange={(e) => setWalkSharePct(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-navy-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 5: Review & Confirm Inventory Before Calculation */}
      {activeStep === 5 && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-navy-100 shadow-2xs space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-cobalt uppercase">Step 5 of 5</span>
            <h2 className="text-2xl font-bold text-navy-900">
              Review Inventory & Boundary Coverage
            </h2>
            <p className="text-xs text-navy-600">
              Verify your operational records, emission factors, and population denominator before calculating the official inventory report.
            </p>
          </div>

          {/* Denominator Summary Card */}
          <div className="bg-ivory p-4 rounded-2xl border border-navy-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-navy-900">{institutionName}</span>
              <div className="text-navy-600">
                Reporting Year: <strong>{reportingYear}</strong> • Total Population: <strong>{(Number(studentHeadcount) || 0) + (Number(facultyHeadcount) || 0) + (Number(staffHeadcount) || 0)} headcount</strong> ({operatingDays || 294} campus operating days)
              </div>
            </div>
            <button
              onClick={() => setActiveStep(1)}
              className="text-cobalt hover:underline font-bold text-xs cursor-pointer shrink-0"
            >
              Edit Step 1
            </button>
          </div>

          {/* Master Review Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-navy-100 bg-navy-50 text-navy-700 font-semibold">
                  <th className="p-3">Source / Category</th>
                  <th className="p-3">Scope</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Factor & Version</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50 text-navy-700">
                {/* Generator */}
                <tr>
                  <td className="p-3 font-semibold text-navy-900">Backup Emergency Generator</td>
                  <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">Scope 1</span></td>
                  <td className="p-3 font-mono">{genDieselStatus === 'reported' ? `${Number(genDieselLitres).toLocaleString()} L` : '—'}</td>
                  <td className="p-3 text-navy-500">2.676 kg CO₂/L (EPA 2024)</td>
                  <td className="p-3 font-medium capitalize">{genDieselStatus.replace('_', ' ')}</td>
                  <td className="p-3 text-right"><button onClick={() => setActiveStep(2)} className="text-cobalt hover:underline font-semibold cursor-pointer">Edit</button></td>
                </tr>
                {/* Fleet */}
                <tr>
                  <td className="p-3 font-semibold text-navy-900">University Vehicle Fleet</td>
                  <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">Scope 1</span></td>
                  <td className="p-3 font-mono">{(Number(fleetOctaneLitres) || 0) + (Number(fleetDieselLitres) || 0)} L</td>
                  <td className="p-3 text-navy-500">2.308 / 2.687 kg CO₂/L</td>
                  <td className="p-3 font-medium capitalize">{fleetOctaneStatus.replace('_', ' ')}</td>
                  <td className="p-3 text-right"><button onClick={() => setActiveStep(2)} className="text-cobalt hover:underline font-semibold cursor-pointer">Edit</button></td>
                </tr>
                {/* Cafeteria */}
                <tr>
                  <td className="p-3 font-semibold text-navy-900">Cafeteria Cooking (LPG)</td>
                  <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">Scope 1</span></td>
                  <td className="p-3 font-mono">{cafeteriaLpgStatus === 'reported' ? `${Number(cafeteriaLpgKg).toLocaleString()} kg` : '—'}</td>
                  <td className="p-3 text-navy-500">3.00 kg CO₂/kg (IPCC Mass)</td>
                  <td className="p-3 font-medium capitalize">{cafeteriaLpgStatus.replace('_', ' ')}</td>
                  <td className="p-3 text-right"><button onClick={() => setActiveStep(2)} className="text-cobalt hover:underline font-semibold cursor-pointer">Edit</button></td>
                </tr>
                {/* Refrigerants */}
                <tr>
                  <td className="p-3 font-semibold text-navy-900">AC Fugitive Refrigerant (R-410A)</td>
                  <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">Scope 1</span></td>
                  <td className="p-3 font-mono">{acR410AStatus === 'reported' ? `${Number(acR410AKg).toLocaleString()} kg` : '—'}</td>
                  <td className="p-3 text-navy-500">2,255.5 GWP (AR6)</td>
                  <td className="p-3 font-medium capitalize">{acR410AStatus.replace('_', ' ')}</td>
                  <td className="p-3 text-right"><button onClick={() => setActiveStep(2)} className="text-cobalt hover:underline font-semibold cursor-pointer">Edit</button></td>
                </tr>
                {/* Electricity */}
                <tr>
                  <td className="p-3 font-semibold text-navy-900">Purchased Grid Electricity</td>
                  <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">Scope 2</span></td>
                  <td className="p-3 font-mono">{gridElectricityStatus === 'reported' ? `${Number(gridElectricityKWh).toLocaleString()} kWh` : '—'}</td>
                  <td className="p-3 text-navy-500">0.637861 kg CO₂e/kWh</td>
                  <td className="p-3 font-medium capitalize">{gridElectricityStatus.replace('_', ' ')}</td>
                  <td className="p-3 text-right"><button onClick={() => setActiveStep(3)} className="text-cobalt hover:underline font-semibold cursor-pointer">Edit</button></td>
                </tr>
                {/* Commuting */}
                <tr>
                  <td className="p-3 font-semibold text-navy-900">Commuter Travel (Students & Staff)</td>
                  <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px]">Scope 3</span></td>
                  <td className="p-3 font-mono">
                    {importedCommuters.length > 0 
                      ? `${importedCommuters.length} verified responses (Google Form)` 
                      : (commuterSurveyStatus === 'reported' ? `n = ${surveySampleSize} survey sample` : '—')}
                  </td>
                  <td className="p-3 text-navy-500">Multi-modal Bangladesh factors</td>
                  <td className="p-3 font-medium capitalize">{commuterSurveyStatus.replace('_', ' ')}</td>
                  <td className="p-3 text-right"><button onClick={() => setActiveStep(4)} className="text-cobalt hover:underline font-semibold cursor-pointer">Edit</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-navy-100">
            <button
              onClick={handlePrevStep}
              className="px-5 py-2.5 rounded-xl border border-navy-200 text-navy-700 font-bold text-xs hover:bg-navy-50 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={executeCalculation}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Calculate results & generate report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Analytical Results Report */}
      {activeStep === 6 && userCalculationRun && (
        <AssessmentReport
          institution={activeUserInstitution}
          population={activeUserPopulation}
          boundary={activeUserBoundary}
          result={userCalculationRun}
          isExample={false}
          onReturnToAssessment={() => setActiveStep(5)}
          lang={lang}
        />
      )}

      {/* 3. Bottom Stepper Controls (For Steps 1-4) */}
      {activeStep < 5 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              if (activeStep === 1) {
                setMasterMode('landing');
              } else {
                handlePrevStep();
              }
            }}
            className="px-5 py-2.5 rounded-xl border border-navy-200 text-navy-700 font-bold text-xs hover:bg-navy-50 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{activeStep === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2.5 rounded-xl text-navy-700 bg-white border border-navy-200 hover:bg-navy-50 font-bold text-xs cursor-pointer shadow-2xs"
            >
              {draftSavedToast ? 'Draft saved!' : 'Save draft'}
            </button>

            <button
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* BLUEPRINT PREVIEW MODAL */}
      {previewBlueprintInstrument && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-navy-100 overflow-hidden">
            <div className="p-6 border-b border-navy-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-cobalt uppercase tracking-wider">Survey Specification</span>
                <h3 className="text-lg font-bold text-navy-900">
                  {previewBlueprintInstrument === 'commuter' ? 'Commuter Survey Question Blueprint' : 'Facilities Records Blueprint'}
                </h3>
              </div>
              <button
                onClick={() => setPreviewBlueprintInstrument(null)}
                className="p-2 rounded-xl hover:bg-navy-50 text-navy-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {(previewBlueprintInstrument === 'commuter' ? COMMUTER_SURVEY_BLUEPRINT : FACILITIES_RECORDS_BLUEPRINT).map((q, qIdx) => (
                <div key={q.stableFieldId} className="p-4 rounded-2xl bg-navy-50/50 border border-navy-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900 text-sm">{q.questionText}</span>
                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-navy-200 text-navy-600">
                      ID: {q.stableFieldId}
                    </span>
                  </div>

                  {q.helpText && <p className="text-navy-500 text-[11px]">{q.helpText}</p>}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-navy-600 border-t border-navy-100">
                    <div><strong>Type:</strong> {q.responseType}</div>
                    <div><strong>Required:</strong> {q.isRequired ? 'Yes' : 'No'}</div>
                    <div><strong>Unit:</strong> {q.unit || 'N/A'}</div>
                    <div><strong>Destination:</strong> <span className="font-mono text-[10px]">{q.destinationCalculationField}</span></div>
                  </div>

                  {q.options && (
                    <div className="pt-1 text-[11px]">
                      <span className="font-semibold text-navy-700">Available Choices:</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <span key={oIdx} className="bg-white px-2 py-0.5 rounded border border-navy-200 text-navy-700 text-[10px]">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-navy-50 border-t border-navy-100 flex justify-end gap-2">
              <button
                onClick={() => triggerDownload('survey_question_blueprint.json', JSON.stringify(FULL_SURVEY_BLUEPRINT, null, 2), 'application/json')}
                className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Blueprint JSON</span>
              </button>
              <button
                onClick={() => setPreviewBlueprintInstrument(null)}
                className="px-4 py-2 rounded-xl bg-white border border-navy-200 text-navy-800 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
