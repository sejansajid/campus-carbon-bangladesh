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
  Info,
  Search,
  Navigation,
  Loader2,
  RotateCcw
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

const COMMUTER_CSV_TEMPLATE_TEXT = `Timestamp,Campus Role,Origin Neighborhood / Thana,Primary Commute Mode,Multimodal Trip,One-Way Distance (km),Weekly Campus Days,Uses University Shuttle / Bus,Car Fuel Type (if car),Car Occupancy (if car)
2026-03-15 09:30:00,Student,Dhanmondi,Public City Bus,No (Single mode only),8.5,5,No,,
2026-03-15 09:32:15,Faculty,Mirpur (Sec 1-12),Private Car,No (Single mode only),12.0,4,No,Octane / Gasoline,2
2026-03-15 09:35:40,Staff,Mohammadpur,Rickshaw (Human-powered cycle),No (Single mode only),3.2,6,No,,
2026-03-15 09:41:22,Student,Uttara,Train / Metro Rail (MRT Line 6),Yes (Multimodal trip),16.5,5,No,,
2026-03-15 09:50:11,Student,Adabar,Walking,No (Single mode only),1.0,5,No,,`;

const FACILITIES_CSV_TEMPLATE_TEXT = `Scope,Emission Source Category,Activity Record Name,Quantity,Unit,Activity Year,Data Status,Source Citation
Scope 1,stationary_combustion_generator,Diesel Generator Fuel (Emergency Backup),9112.8,L,2024,reported,Facilities logbook & fuel vouchers
Scope 1,mobile_combustion_fleet,University Sedans & Ambulances (Octane),8593.2,L,2024,reported,Transport department pump slips
Scope 1,mobile_combustion_fleet,University Shuttle Buses (Diesel),19128.8,L,2024,reported,Transport fleet logs
Scope 1,cooking_combustion_cafeteria,Commercial Cafeteria Cooking Gas (LPG),12720.0,kg,2024,reported,Cafeteria cylinder invoices
Scope 1,fugitive_refrigerants_ac,Air Conditioning Refrigerant Top-Up (R-410A),240.0,kg,2024,reported,HVAC maintenance work orders
Scope 1,fugitive_refrigerants_ac,Air Conditioning Refrigerant Top-Up (R-22),0.0,kg,2024,confirmed_zero,HVAC audit (no R-22 units)
Scope 2,purchased_electricity_grid,Utility Grid Electricity (DPDC / DESCO / REB),777977.0,kWh,2024,reported,Monthly utility electricity bills`;

interface AssessmentFlowProps {
  onExploreExampleReport?: () => void;
  initialMode?: 'landing' | 'active' | 'example';
}

export type AssessmentRoute = 'templates' | 'manual';
export type SourceDataStatus = 'reported' | 'confirmed_zero' | 'not_applicable' | 'not_collected';

export const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ initialMode }) => {

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
  const [draftResetToast, setDraftResetToast] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftMeta, setSavedDraftMeta] = useState<{ name: string; step: number; updatedAt?: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Blueprint Preview Modal
  const [previewBlueprintInstrument, setPreviewBlueprintInstrument] = useState<'commuter' | 'facilities' | null>(null);

  // -------------------------------------------------------------
  // STEP 1: Institution Details (Starts blank and unknown)
  // -------------------------------------------------------------
  const [institutionName, setInstitutionName] = useState<string>('');
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

  // Physical campus metrics & Spatial Location (starts blank, not prefilled)
  const [floorAreaM2, setFloorAreaM2] = useState<string>('');
  const [landAreaAcres, setLandAreaAcres] = useState<string>('');
  const [campusLat, setCampusLat] = useState<string>('');
  const [campusLng, setCampusLng] = useState<string>('');
  const [campusSearchQuery, setCampusSearchQuery] = useState<string>('');
  const [campusSearching, setCampusSearching] = useState<boolean>(false);
  const [campusSearchResults, setCampusSearchResults] = useState<any[]>([]);
  const [campusSearchError, setCampusSearchError] = useState<string | null>(null);

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

  // Check Saved Draft in LocalStorage (DO NOT auto-jump without user confirmation)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('CC_ASSESSMENT_DRAFT');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHasSavedDraft(true);
        setSavedDraftMeta({
          name: parsed.institutionName || 'Untitled Assessment',
          step: parsed.activeStep || 1,
          updatedAt: parsed.updatedAt
        });

        // Preload fields so they are ready if resumed
        if (parsed.institutionName) setInstitutionName(parsed.institutionName);
        if (parsed.institutionType) setInstitutionType(parsed.institutionType);
        if (parsed.division) setDivision(parsed.division);
        if (parsed.district) setDistrict(parsed.district);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.reportingYear) setReportingYear(parsed.reportingYear);
        if (parsed.studentHeadcount) setStudentHeadcount(parsed.studentHeadcount);
        if (parsed.facultyHeadcount) setFacultyHeadcount(parsed.facultyHeadcount);
        if (parsed.staffHeadcount) setStaffHeadcount(parsed.staffHeadcount);
        if (parsed.operatingDays) setOperatingDays(parsed.operatingDays);
        if (parsed.campusLat) setCampusLat(parsed.campusLat);
        if (parsed.campusLng) setCampusLng(parsed.campusLng);
        if (parsed.floorAreaM2) setFloorAreaM2(parsed.floorAreaM2);
        if (parsed.landAreaAcres) setLandAreaAcres(parsed.landAreaAcres);
        if (parsed.genDieselLitres) setGenDieselLitres(parsed.genDieselLitres);
        if (parsed.genDieselStatus) setGenDieselStatus(parsed.genDieselStatus);
        if (parsed.fleetOctaneLitres) setFleetOctaneLitres(parsed.fleetOctaneLitres);
        if (parsed.fleetDieselLitres) setFleetDieselLitres(parsed.fleetDieselLitres);
        if (parsed.cafeteriaLpgKg) setCafeteriaLpgKg(parsed.cafeteriaLpgKg);
        if (parsed.cafeteriaLpgStatus) setCafeteriaLpgStatus(parsed.cafeteriaLpgStatus);
        if (parsed.acR410AKg) setAcR410AKg(parsed.acR410AKg);
        if (parsed.acR410AStatus) setAcR410AStatus(parsed.acR410AStatus);
        if (parsed.gridElectricityKWh) setGridElectricityKWh(parsed.gridElectricityKWh);
        if (parsed.gridElectricityStatus) setGridElectricityStatus(parsed.gridElectricityStatus);
        if (parsed.route) setRoute(parsed.route);
        // User stays on landing view or whatever initial view requested
      }
    } catch (e) {
      console.warn('Failed to parse saved draft from localStorage:', e);
    }
  }, []);

  const handleResumeSavedDraft = () => {
    if (savedDraftMeta && savedDraftMeta.step) {
      setActiveStep(savedDraftMeta.step);
    }
    setMasterMode('active');
  };

  const handleResetAssessment = () => {
    try {
      localStorage.removeItem('CC_ASSESSMENT_DRAFT');
    } catch (e) {}

    // Reset all institution and activity fields to clean slate
    setInstitutionName('');
    setInstitutionType('private');
    setDivision('Dhaka');
    setDistrict('Dhaka');
    setAddress('');
    setReportingYear(new Date().getFullYear() - 1);
    setPeriodStart(`${new Date().getFullYear() - 1}-01-01`);
    setPeriodEnd(`${new Date().getFullYear() - 1}-12-31`);
    setShowAdditionalDetails(false);
    setHasOperationalControl(true);

    setStudentHeadcount('');
    setFacultyHeadcount('');
    setStaffHeadcount('');
    setOperatingDays('');

    setFloorAreaM2('');
    setLandAreaAcres('');
    setCampusLat('');
    setCampusLng('');
    setCampusSearchQuery('');
    setCampusSearchResults([]);
    setCampusSearchError(null);

    setGenDieselStatus('reported');
    setGenDieselLitres('');
    setFleetOctaneStatus('reported');
    setFleetOctaneLitres('');
    setFleetDieselStatus('reported');
    setFleetDieselLitres('');
    setCafeteriaLpgStatus('reported');
    setCafeteriaLpgKg('');
    setAcR410AStatus('reported');
    setAcR410AKg('');
    setAcR22Status('confirmed_zero');
    setAcR22Kg('');

    setGridElectricityStatus('reported');
    setGridElectricityKWh('');

    setCommuterSurveyStatus('reported');
    setImportedCommuters([]);
    setImportSummary(null);
    setImportErrorDetails(null);

    setUserCalculationRun(null);
    setActiveStep(1);
    setRoute('manual');
    setValidationErrors({});
    setHasSavedDraft(false);
    setSavedDraftMeta(null);
    setShowResetConfirm(false);
    setMasterMode('landing');

    setDraftResetToast(true);
    setTimeout(() => setDraftResetToast(false), 3500);
  };

  // Global listener for navbar reset action
  useEffect(() => {
    const handleGlobalResetEvent = () => {
      handleResetAssessment();
    };
    window.addEventListener('cc_reset_draft', handleGlobalResetEvent);
    return () => window.removeEventListener('cc_reset_draft', handleGlobalResetEvent);
  }, []);

  const handleSaveDraft = () => {
    const draft = {
      institutionName,
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
      campusLat,
      campusLng,
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
      setHasSavedDraft(true);
      setSavedDraftMeta({
        name: institutionName || 'Untitled Assessment',
        step: activeStep,
        updatedAt: draft.updatedAt
      });
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
        errs.institutionName = 'Institution official name is required.';
      }
      if (!studentHeadcount || Number(studentHeadcount) < 0) {
        errs.studentHeadcount = 'Please enter student headcount.';
      }
      if (!facultyHeadcount || Number(facultyHeadcount) < 0) {
        errs.facultyHeadcount = 'Please enter faculty headcount.';
      }
      if (!staffHeadcount || Number(staffHeadcount) < 0) {
        errs.staffHeadcount = 'Please enter staff headcount.';
      }
      if (!operatingDays || Number(operatingDays) <= 0 || Number(operatingDays) > 366) {
        errs.operatingDays = 'Please enter campus operating days per year (e.g. 250–300).';
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
    nameBn: undefined,
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

  const parsedLat = parseFloat(campusLat);
  const parsedLng = parseFloat(campusLng);
  const hasValidCoords = !isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat >= 20 && parsedLat <= 27 && parsedLng >= 88 && parsedLng <= 93;

  const activeUserBoundary: CampusBoundary = {
    id: 'CAMPUS-USER',
    institutionId: 'INST-USER',
    name: `${institutionName.trim() || 'Main'} Campus`,
    isMainCampus: true,
    centerCoordinates: hasValidCoords ? [parsedLat, parsedLng] : undefined,
    grossFloorAreaM2: Number(floorAreaM2) || 0,
    landAreaAcres: Number(landAreaAcres) || 0,
    numberOfBuildings: 2,
    geometrySource: hasValidCoords ? 'drawn' : undefined,
    confirmedByInstitution: hasValidCoords
  };

  // Helper renderer: Survey Templates & Google Forms Automation Package
  // Positioned right at the start with disclaimer for manual analysis and inline non-blocking blueprint preview
  const renderTemplatePackage = (isStep1: boolean = false) => (
    <div className="p-6 sm:p-7 rounded-3xl border-2 border-navy-100 bg-navy-50/40 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-100 text-navy-800 text-xs font-bold uppercase tracking-wider mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-cobalt" />
            <span>Survey Templates & Google Forms Automation Package</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900">
            Data Collection Blueprint & Direct CSV Templates
          </h3>
          <p className="text-xs sm:text-sm text-navy-600 mt-1 max-w-2xl">
            Everything your institution needs to collect primary commuter responses from students and staff, or organize departmental energy and fuel records before calculation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setPreviewBlueprintInstrument(previewBlueprintInstrument ? null : 'commuter')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-navy-100 border border-navy-200 text-navy-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-cobalt" />
            <span>{previewBlueprintInstrument ? 'Hide Questions Blueprint' : 'Preview Questions (Inline)'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex items-start gap-3 leading-relaxed shadow-2xs">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-950 font-bold block text-sm">
            Data Collection & Manual Entry Guidance:
          </strong>
          <span className="block">
            If your university already possesses institutional activity records (such as utility electricity bills, generator fuel receipts, vehicle logbooks, and commuter sample surveys) and you want to analyze data manually, you can use these sources directly and proceed through the guided assessment entry steps below.
          </span>
          <span className="text-amber-900 block font-medium">
            If your institution needs to collect fresh primary commuter records from students and faculty or activity logs from campus facilities first, download our ready-to-run Google Forms automation script and matching CSV templates below.
          </span>
        </div>
      </div>

      {/* 4 Usable Artifact Downloads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* 1. Google Forms Script */}
        <div className="p-4 rounded-2xl bg-white border border-navy-100 hover:border-cobalt transition shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-cobalt uppercase tracking-wider block">Google Workspace</span>
            <h4 className="text-xs font-bold text-navy-900">Google Forms Creation Script</h4>
            <p className="text-[11px] text-navy-500">
              Generates a full 10-question Commuter Travel Survey with sections, choices, and input validation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => triggerDownload('CampusCarbon_CommuterSurvey_GoogleFormsGenerator.gs', generateGoogleFormsAppsScript(), 'text/plain')}
            className="w-full py-2 px-3 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Download .gs Script</span>
          </button>
        </div>

        {/* 2. Commuter CSV Template */}
        <div className="p-4 rounded-2xl bg-white border border-navy-100 hover:border-cobalt transition shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Scope 3 Commuting</span>
            <h4 className="text-xs font-bold text-navy-900">Commuter Survey CSV Template</h4>
            <p className="text-[11px] text-navy-500">
              Standard format for student and staff travel responses with verified mode codes and distance fields.
            </p>
          </div>
          <button
            type="button"
            onClick={() => triggerDownload('commuter_survey_template.csv', COMMUTER_CSV_TEMPLATE_TEXT, 'text/csv')}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-navy-600" />
            <span>Download Commuter CSV</span>
          </button>
        </div>

        {/* 3. Facilities CSV Template */}
        <div className="p-4 rounded-2xl bg-white border border-navy-100 hover:border-cobalt transition shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Scope 1 & Scope 2</span>
            <h4 className="text-xs font-bold text-navy-900">Facilities Activity CSV Template</h4>
            <p className="text-[11px] text-navy-500">
              Spreadsheet layout for generator diesel, vehicle fuel, cafeteria LPG, AC gases, and electricity bills.
            </p>
          </div>
          <button
            type="button"
            onClick={() => triggerDownload('facilities_records_template.csv', FACILITIES_CSV_TEMPLATE_TEXT, 'text/csv')}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-navy-600" />
            <span>Download Facilities CSV</span>
          </button>
        </div>

        {/* 4. Technical Blueprint JSON */}
        <div className="p-4 rounded-2xl bg-white border border-navy-100 hover:border-cobalt transition shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wider block">Specification</span>
            <h4 className="text-xs font-bold text-navy-900">Question Blueprint JSON</h4>
            <p className="text-[11px] text-navy-500">
              Machine-readable schema containing stable field IDs, validation rules, units, and calculation destinations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => triggerDownload('survey_question_blueprint.json', JSON.stringify(FULL_SURVEY_BLUEPRINT, null, 2), 'application/json')}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-navy-600" />
            <span>Download Blueprint (.json)</span>
          </button>
        </div>
      </div>

      {/* Setup & Import Guide */}
      <div className="p-4 rounded-2xl bg-white border border-navy-100 space-y-2">
        <span className="text-[11px] font-bold text-navy-700 uppercase tracking-wider block">Standard Collection & Calculation Workflow:</span>
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">1. Download Script</div>
          <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">2. Run in Apps Script</div>
          <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">3. Collect Responses</div>
          <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">4. Export CSV</div>
          <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">5. Upload to Step 4</div>
          <div className="p-2 rounded-xl bg-navy-50 font-semibold text-navy-800">6. Review In Step 5</div>
          <div className="p-2 rounded-xl bg-emerald-50 font-semibold text-emerald-800">7. Calculate</div>
        </div>
      </div>

      {/* INLINE Question Blueprint Viewer (NO MODAL, NO SCREEN OVERLAP!) */}
      {previewBlueprintInstrument && (
        <div className="p-5 rounded-2xl bg-white border-2 border-cobalt/30 shadow-md space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-100 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewBlueprintInstrument('commuter')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  previewBlueprintInstrument === 'commuter' ? 'bg-cobalt text-white shadow-2xs' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
                }`}
              >
                Student / Staff Commuter Survey (10 Questions)
              </button>
              <button
                type="button"
                onClick={() => setPreviewBlueprintInstrument('facilities')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  previewBlueprintInstrument === 'facilities' ? 'bg-cobalt text-white shadow-2xs' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
                }`}
              >
                Facilities Records Blueprint (6 Categories)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPreviewBlueprintInstrument(null)}
              className="px-3 py-1 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Collapse Preview</span>
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {(previewBlueprintInstrument === 'commuter' ? COMMUTER_SURVEY_BLUEPRINT : FACILITIES_RECORDS_BLUEPRINT).map((q) => (
              <div key={q.stableFieldId} className="p-3.5 rounded-xl bg-navy-50/50 border border-navy-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-900 text-xs sm:text-sm">{q.questionText}</span>
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
                    <span className="font-semibold text-navy-700">Options: </span>
                    <span className="text-navy-600">{q.options.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // -------------------------------------------------------------
  // RENDERING: MODE = 'example' (ULAB 2022 Fixture)
  // -------------------------------------------------------------
  if (masterMode === 'example') {
    return (
      <AssessmentReport
        institution={{
          id: 'INST-ULAB',
          name: 'University of Liberal Arts Bangladesh',
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
      />
    );
  }

  const renderResetModalAndToast = () => (
    <>
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-navy-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 text-red-600">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900 leading-tight">Reset Assessment Draft?</h3>
                <p className="text-xs text-navy-500">This action will clear all entered data.</p>
              </div>
            </div>

            <p className="text-xs text-navy-600 leading-relaxed bg-navy-50/60 p-4 rounded-2xl border border-navy-100">
              Resetting will completely wipe all institution details, campus GPS coordinates, Scope 1-3 activity entries, uploaded commuter records, and calculated figures stored in your browser so you can start from a clean slate.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAssessment}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Yes, Reset Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Success Toast */}
      {draftResetToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-navy-700 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Assessment draft reset. Starting clean.</span>
        </div>
      )}
    </>
  );

  // -------------------------------------------------------------
  // RENDERING: MODE = 'landing' (Two Choices + Example Entry Point)
  // -------------------------------------------------------------
  if (masterMode === 'landing') {
    return (
      <div className="space-y-12 max-w-5xl mx-auto py-6 pb-20">
        {/* Landing Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 border border-navy-200 text-xs font-semibold text-navy-800">
            <span>Institutional Carbon Assessment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Choose how you want to supply your data
          </h1>
          <p className="text-sm text-navy-600">
            Select your preferred data entry route to calculate your campus greenhouse gas inventory.
          </p>
        </div>

        {/* Saved Draft Banner with Resume & Reset Options */}
        {hasSavedDraft && savedDraftMeta && (
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800">
                <Save className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                    Saved Draft Found
                  </span>
                  {savedDraftMeta.updatedAt && (
                    <span className="text-[11px] text-amber-700">
                      Saved {new Date(savedDraftMeta.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-navy-950">
                  {savedDraftMeta.name || 'Untitled Assessment'}
                </h3>
                <p className="text-xs text-navy-700">
                  You have an in-progress draft at <strong>Step {savedDraftMeta.step} of 6</strong>. Would you like to resume where you left off, or reset and start fresh?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={handleResumeSavedDraft}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Resume Draft (Step {savedDraftMeta.step})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset & Start Fresh</span>
              </button>
            </div>
          </div>
        )}

        {/* Survey Templates & Google Forms Automation Package with Disclaimer */}
        {renderTemplatePackage(false)}

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
                  Collect data using survey templates
                </h3>
                <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
                  Download structured survey blueprints, auto-generate Google Forms, gather campus records across departments, then upload response files.
                </p>
              </div>
              <div className="text-xs text-navy-500 space-y-1.5 pt-2 border-t border-navy-50">
                <div className="flex items-center gap-1.5">• <span>Complete Google Forms creation script (Apps Script)</span></div>
                <div className="flex items-center gap-1.5">• <span>Downloadable Question Blueprint (JSON / CSV)</span></div>
                <div className="flex items-center gap-1.5">• <span>Direct Google Forms response CSV importer</span></div>
              </div>
            </div>

            <button className="w-full py-3 px-4 rounded-xl bg-navy-50 group-hover:bg-cobalt text-navy-800 group-hover:text-white font-bold text-xs transition flex items-center justify-center gap-2">
              <span>Start with survey templates</span>
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
                  Enter existing data
                </h3>
                <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
                  Use institutional records you already have to complete the assessment step by step using structured online entry forms.
                </p>
              </div>
              <div className="text-xs text-navy-500 space-y-1.5 pt-2 border-t border-navy-50">
                <div className="flex items-center gap-1.5">• <span>Step-by-step guided entry for each emission scope</span></div>
                <div className="flex items-center gap-1.5">• <span>Live emission formula previews and unit conversions</span></div>
                <div className="flex items-center gap-1.5">• <span>Distinguish Confirmed zero, N/A, and Not collected</span></div>
              </div>
            </div>

            <button className="w-full py-3 px-4 rounded-xl bg-navy-50 group-hover:bg-cobalt text-navy-800 group-hover:text-white font-bold text-xs transition flex items-center justify-center gap-2">
              <span>Enter existing data step by step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The ONLY Prominent Example Entry Point */}
        <div className="pt-4 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-4 sm:px-6 rounded-2xl bg-white border border-navy-100 shadow-2xs">
            <span className="text-xs text-navy-600 font-medium">
              Want to see what an official assessment report looks like?
            </span>
            <button
              onClick={() => setMasterMode('example')}
              className="text-xs font-bold text-cobalt hover:text-cobalt-700 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>See what your assessment report will look like</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {renderResetModalAndToast()}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDERING: STEPPER WORKFLOW (Steps 1 to 6)
  // -------------------------------------------------------------
  const steps = [
    { num: 1, label: 'Institution & Period', icon: Building2 },
    { num: 2, label: 'Scope 1', icon: Flame },
    { num: 3, label: 'Scope 2', icon: Zap },
    { num: 4, label: 'Scope 3', icon: Car },
    { num: 5, label: 'Review', icon: ClipboardCheck },
    { num: 6, label: 'Results', icon: BarChart3 }
  ];

  return (
    <div ref={stepContainerRef} className="space-y-8 max-w-5xl mx-auto pb-20 font-sans">
      {/* 1. Persistent Numbered Stepper & Selected Route Indicator */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-navy-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-50 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-navy-800">
              {institutionName.trim() ? institutionName : 'New Assessment Draft'}
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
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 cursor-pointer transition"
              title="Clear all saved draft data and start fresh"
            >
              <RotateCcw className="w-3 h-3 text-red-500" />
              <span>Reset draft</span>
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
              Institution & Reporting Period
            </h2>
            <p className="text-xs text-navy-600">
              Enter your institution official name, designated 12-month reporting period, and campus community population.
            </p>
          </div>

          <div className="space-y-6">
            {/* Survey Templates & Google Forms Automation Package with Disclaimer */}
            {renderTemplatePackage(true)}

            {/* Single Official Name Field (Initially blank, Unicode accepted) */}
            <div>
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Institution Official Name *
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
                  Campus Community Population & Operating Days *
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

            {/* Campus Geographic Location & OpenStreetMap Search */}
            <div className="p-5 rounded-2xl border border-navy-100 bg-navy-50/40 space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cobalt" />
                  <span>Campus Geographic Location (Optional — Used for Spatial Boundary Map)</span>
                </h3>
                <p className="text-[11px] text-navy-500">
                  Search for your campus location by name or provide latitude and longitude coordinates. If not configured, no fake map is displayed.
                </p>
              </div>

              {/* Location Search Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={campusSearchQuery}
                  onChange={(e) => setCampusSearchQuery(e.target.value)}
                  placeholder="Search campus location (e.g. University of Dhaka, BUET, Chittagong University)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 bg-white focus:outline-none focus:border-cobalt"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const q = (campusSearchQuery || institutionName).trim();
                    if (!q) return;
                    setCampusSearching(true);
                    setCampusSearchError(null);
                    setCampusSearchResults([]);
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Bangladesh')}&limit=5`, {
                        headers: { 'Accept-Language': 'en' }
                      });
                      const data = await res.json();
                      if (data && data.length > 0) {
                        setCampusSearchResults(data);
                      } else {
                        setCampusSearchError(`No location found for "${q}". Please enter coordinates manually below.`);
                      }
                    } catch (e) {
                      setCampusSearchError('Geocoding service unavailable. Please enter coordinates manually below.');
                    } finally {
                      setCampusSearching(false);
                    }
                  }}
                  disabled={campusSearching}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {campusSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>{campusSearching ? 'Searching...' : 'Locate'}</span>
                </button>
              </div>

              {campusSearchError && (
                <div className="p-2.5 rounded-lg bg-coral-50 border border-coral-200 text-xs text-coral-800">
                  {campusSearchError}
                </div>
              )}

              {campusSearchResults.length > 0 && (
                <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-navy-100 max-h-44 overflow-y-auto text-xs">
                  {campusSearchResults.map((r: any) => (
                    <div key={r.place_id} className="flex items-center justify-between p-2 hover:bg-navy-50 rounded-lg border border-navy-50">
                      <div className="truncate mr-2">
                        <span className="font-semibold block truncate text-navy-900">{r.display_name}</span>
                        <span className="text-[10px] text-navy-400 font-mono">{parseFloat(r.lat).toFixed(4)}° N, {parseFloat(r.lon).toFixed(4)}° E</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCampusLat(parseFloat(r.lat).toFixed(4));
                          setCampusLng(parseFloat(r.lon).toFixed(4));
                          setCampusSearchResults([]);
                        }}
                        className="px-3 py-1 rounded-lg bg-cobalt text-white font-bold text-[10px] shrink-0 cursor-pointer"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Lat / Lng inputs & Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-navy-700 mb-1">Campus Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={campusLat}
                    onChange={(e) => setCampusLat(e.target.value)}
                    placeholder="e.g. 23.7262"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-navy-700 mb-1">Campus Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={campusLng}
                    onChange={(e) => setCampusLng(e.target.value)}
                    placeholder="e.g. 90.4005"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-mono bg-white"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                <span className="font-semibold text-navy-500">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => { setCampusLat('23.7262'); setCampusLng('90.4005'); }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 cursor-pointer"
                >
                  Dhaka University
                </button>
                <button
                  type="button"
                  onClick={() => { setCampusLat('23.7266'); setCampusLng('90.3924'); }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 cursor-pointer"
                >
                  BUET
                </button>
                <button
                  type="button"
                  onClick={() => { setCampusLat('22.4716'); setCampusLng('91.7877'); }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 cursor-pointer"
                >
                  Chittagong Univ
                </button>
                <button
                  type="button"
                  onClick={() => { setCampusLat('24.9205'); setCampusLng('91.8319'); }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 cursor-pointer"
                >
                  SUST Sylhet
                </button>
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
                  onClick={() => setPreviewBlueprintInstrument(previewBlueprintInstrument === 'commuter' ? null : 'commuter')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-navy-100 border border-navy-200 text-navy-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cobalt" />
                  <span>{previewBlueprintInstrument === 'commuter' ? 'Hide questions' : 'Preview questions'}</span>
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

            {/* INLINE Question Blueprint Viewer in Step 4 */}
            {previewBlueprintInstrument === 'commuter' && (
              <div className="p-4 rounded-2xl bg-white border border-cobalt/30 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-navy-100 pb-2">
                  <span className="font-bold text-navy-900 text-xs">Commuter Travel Survey Blueprint (10 Questions)</span>
                  <button
                    type="button"
                    onClick={() => setPreviewBlueprintInstrument(null)}
                    className="text-xs text-navy-500 hover:text-navy-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Collapse Preview</span>
                  </button>
                </div>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {COMMUTER_SURVEY_BLUEPRINT.map(q => (
                    <div key={q.stableFieldId} className="p-3 rounded-xl bg-navy-50/50 border border-navy-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900">{q.questionText}</span>
                        <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-navy-200">{q.stableFieldId}</span>
                      </div>
                      {q.helpText && <p className="text-navy-500 text-[11px]">{q.helpText}</p>}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px] text-navy-600 pt-1">
                        <div>Type: <strong>{q.responseType}</strong></div>
                        <div>Required: <strong>{q.isRequired ? 'Yes' : 'No'}</strong></div>
                        <div>Unit: <strong>{q.unit || 'N/A'}</strong></div>
                        <div>Dest: <span className="font-mono">{q.destinationCalculationField}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 font-bold text-xs cursor-pointer shadow-2xs flex items-center gap-1.5 transition"
              title="Reset this assessment draft and start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Start Fresh</span>
            </button>

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

      {renderResetModalAndToast()}
    </div>
  );
};
