import fs from 'fs';
import path from 'path';
import { 
  Institution, 
  CampusBoundary, 
  PopulationRecord, 
  ActivityRecord, 
  CommuterSurveyResponse, 
  InventoryCalculationResult, 
  SustainabilityAction 
} from '../../../shared/types';
import { ULAB_2022_POPULATION, ULAB_2022_ACTIVITIES, ULAB_COMMUTER_SURVEY_SAMPLE } from '../../../shared/engine/legacy-reproduction';

export interface DatabaseSchema {
  institutions: Institution[];
  boundaries: CampusBoundary[];
  populations: PopulationRecord[];
  activities: ActivityRecord[];
  commuterSurveys: CommuterSurveyResponse[];
  calculationRuns: InventoryCalculationResult[];
  actions: SustainabilityAction[];
  auditLogs: {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    timestamp: string;
    details?: any;
  }[];
}

const DB_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'db.json');

function initializeDefaultData(): DatabaseSchema {
  const ulabInstitution: Institution = {
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
  };

  const ulabBoundary: CampusBoundary = {
    id: 'CAMPUS-ULAB-PERMANENT',
    institutionId: 'INST-ULAB',
    name: 'Permanent Campus',
    isMainCampus: true,
    centerCoordinates: [23.7547, 90.3582], // Mohammadpur Permanent Campus
    polygonGeoJSON: {
      type: 'Polygon',
      coordinates: [[
        [90.3565, 23.7535],
        [90.3595, 23.7535],
        [90.3598, 23.7560],
        [90.3568, 23.7562],
        [90.3565, 23.7535]
      ]]
    },
    grossFloorAreaM2: 24500,
    landAreaAcres: 5.5,
    numberOfBuildings: 3,
    geometrySource: 'drawn',
    confirmedByInstitution: true
  };

  const sampleActions: SustainabilityAction[] = [
    {
      id: 'ACT-01',
      institutionId: 'INST-ULAB',
      title: '[Illustrative Demo Action] Transition AC units to low-GWP R-32',
      scope: 1,
      category: 'refrigerant_fugitive_ac',
      responsibleDepartment: 'Facilities Management',
      targetCompletionDate: '2026-12-31',
      status: 'in_progress',
      estimatedReductionTCO2e: 239.3,
      estimatedCostBDT: 3500000,
      description: 'Illustrative demonstration proposal: Replace aging AC units with high-efficiency R-32 systems with certified preventative leak detection. (Sample proposal for review, not an actual ULAB decision).',
      createdAt: '2025-10-01T09:00:00Z',
      updatedAt: '2025-10-10T14:30:00Z',
      feedbacks: [
        {
          id: 'FB-01',
          author: 'Demo Reviewer (Illustrative)',
          type: 'status_change',
          text: 'Illustrative feedback: Technical RFP draft prepared for inverter units with A2L ventilation compliance.',
          timestamp: '2025-10-10T14:30:00Z'
        }
      ]
    },
    {
      id: 'ACT-02',
      institutionId: 'INST-ULAB',
      title: '[Illustrative Demo Action] Install 42 kWp Rooftop Solar System',
      scope: 2,
      category: 'purchased_electricity_grid',
      responsibleDepartment: 'Engineering & Physical Plant',
      targetCompletionDate: '2026-06-30',
      status: 'approved',
      estimatedReductionTCO2e: 42.24,
      estimatedCostBDT: 4200000,
      description: 'Illustrative demonstration proposal based on Alfatha et al. research paper: 42 kWp grid-tied rooftop solar generating 66.2 MWh/yr with high campus self-consumption.',
      createdAt: '2025-10-02T10:00:00Z',
      updatedAt: '2025-10-08T11:00:00Z',
      feedbacks: [
        {
          id: 'FB-02',
          author: 'Demo Reviewer (Illustrative)',
          type: 'comment',
          text: 'Illustrative note: Proposed for capital grant budget evaluation.',
          timestamp: '2025-10-08T11:00:00Z'
        }
      ]
    },
    {
      id: 'ACT-03',
      institutionId: 'INST-ULAB',
      title: '[Illustrative Demo Action] Dedicated Shared Hybrid Minibus for Faculty',
      scope: 3,
      category: 'employee_commuting',
      responsibleDepartment: 'Transport Operations',
      targetCompletionDate: '2026-03-31',
      status: 'proposed',
      estimatedReductionTCO2e: 8.5,
      estimatedCostBDT: 1800000,
      description: 'Illustrative demonstration proposal: Pooled 14-seater hybrid CNG/gasoline shuttle replacing individual faculty private car daily commutes.',
      createdAt: '2025-10-05T12:00:00Z',
      updatedAt: '2025-10-05T12:00:00Z',
      feedbacks: []
    }
  ];

  return {
    institutions: [ulabInstitution],
    boundaries: [ulabBoundary],
    populations: [ULAB_2022_POPULATION],
    activities: [...ULAB_2022_ACTIVITIES],
    commuterSurveys: [...ULAB_COMMUTER_SURVEY_SAMPLE],
    calculationRuns: [],
    actions: sampleActions,
    auditLogs: [
      {
        id: 'LOG-01',
        action: 'SEED_INITIAL_DATA',
        entity: 'System',
        entityId: 'INST-ULAB',
        timestamp: new Date().toISOString(),
        details: 'Loaded ULAB 2022 research baseline dataset'
      }
    ]
  };
}

class StorageEngine {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to parse db.json, reinitializing default data:', e);
        this.data = initializeDefaultData();
        this.persist();
      }
    } else {
      this.data = initializeDefaultData();
      this.persist();
    }
  }

  private persist() {
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_FILE);
  }

  // Institutions
  getInstitutions(): Institution[] {
    return this.data.institutions;
  }

  getInstitutionById(id: string): Institution | undefined {
    return this.data.institutions.find(i => i.id === id);
  }

  saveInstitution(inst: Institution): Institution {
    if (inst.id === 'INST-ULAB') {
      throw new Error('INST-ULAB is a protected read-only demo institution and cannot be modified.');
    }
    const idx = this.data.institutions.findIndex(i => i.id === inst.id);
    if (idx >= 0) {
      this.data.institutions[idx] = { ...inst, updatedAt: new Date().toISOString() };
    } else {
      this.data.institutions.push({ ...inst, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.persist();
    return inst;
  }

  // Boundaries
  getBoundaries(institutionId: string): CampusBoundary[] {
    return this.data.boundaries.filter(b => b.institutionId === institutionId);
  }

  saveBoundary(boundary: CampusBoundary): CampusBoundary {
    if (boundary.institutionId === 'INST-ULAB') {
      throw new Error('INST-ULAB boundary is a protected read-only demo fixture and cannot be modified.');
    }
    const idx = this.data.boundaries.findIndex(b => b.id === boundary.id);
    if (idx >= 0) {
      this.data.boundaries[idx] = boundary;
    } else {
      this.data.boundaries.push(boundary);
    }
    this.persist();
    return boundary;
  }

  // Populations
  getPopulation(institutionId: string): PopulationRecord | undefined {
    return this.data.populations.find(p => p.institutionId === institutionId);
  }

  savePopulation(pop: PopulationRecord): PopulationRecord {
    if (pop.institutionId === 'INST-ULAB') {
      throw new Error('INST-ULAB population is a protected read-only demo fixture and cannot be modified.');
    }
    const idx = this.data.populations.findIndex(p => p.institutionId === pop.institutionId);
    if (idx >= 0) {
      this.data.populations[idx] = pop;
    } else {
      this.data.populations.push(pop);
    }
    this.persist();
    return pop;
  }

  // Activities
  getActivities(institutionId: string): ActivityRecord[] {
    return this.data.activities.filter(a => a.institutionId === institutionId);
  }

  saveActivity(act: ActivityRecord): ActivityRecord {
    const idx = this.data.activities.findIndex(a => a.id === act.id);
    if (idx >= 0) {
      this.data.activities[idx] = act;
    } else {
      this.data.activities.push(act);
    }
    this.persist();
    return act;
  }

  deleteActivity(id: string): boolean {
    const initialLen = this.data.activities.length;
    this.data.activities = this.data.activities.filter(a => a.id !== id);
    if (this.data.activities.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Commuter Surveys
  getCommuterSurveys(institutionId: string): CommuterSurveyResponse[] {
    return this.data.commuterSurveys.filter(s => s.institutionId === institutionId);
  }

  saveCommuterSurveys(surveys: CommuterSurveyResponse[]): number {
    this.data.commuterSurveys.push(...surveys);
    this.persist();
    return surveys.length;
  }

  // Calculation Runs
  saveCalculationRun(result: InventoryCalculationResult): InventoryCalculationResult {
    this.data.calculationRuns.unshift(result);
    // keep last 50 runs
    if (this.data.calculationRuns.length > 50) {
      this.data.calculationRuns = this.data.calculationRuns.slice(0, 50);
    }
    this.persist();
    return result;
  }

  getLatestCalculationRun(institutionId: string): InventoryCalculationResult | undefined {
    return this.data.calculationRuns.find(r => r.institutionId === institutionId);
  }

  // Actions & Feedback
  getActions(institutionId: string): SustainabilityAction[] {
    return this.data.actions.filter(a => a.institutionId === institutionId);
  }

  saveAction(action: SustainabilityAction): SustainabilityAction {
    const idx = this.data.actions.findIndex(a => a.id === action.id);
    if (idx >= 0) {
      this.data.actions[idx] = { ...action, updatedAt: new Date().toISOString() };
    } else {
      this.data.actions.push({ ...action, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.persist();
    return action;
  }

  addFeedbackToAction(actionId: string, feedback: { author: string; type: any; text: string }): SustainabilityAction | undefined {
    const act = this.data.actions.find(a => a.id === actionId);
    if (act) {
      act.feedbacks.push({
        id: `FB-${Date.now()}`,
        author: feedback.author,
        type: feedback.type,
        text: feedback.text,
        timestamp: new Date().toISOString()
      });
      act.updatedAt = new Date().toISOString();
      this.persist();
      return act;
    }
    return undefined;
  }

  // Audit Logs
  log(action: string, entity: string, entityId: string, details?: any) {
    this.data.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action,
      entity,
      entityId,
      timestamp: new Date().toISOString(),
      details
    });
    this.persist();
  }
}

export const db = new StorageEngine();
