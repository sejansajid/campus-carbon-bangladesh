import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  BookOpen, 
  Download, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Code,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode,
  Table
} from 'lucide-react';
import { FactorRegistryBrowser } from './FactorRegistryBrowser';
import { MethodologyReferences } from './MethodologyReferences';
import { 
  COMMUTER_SURVEY_BLUEPRINT, 
  FACILITIES_RECORDS_BLUEPRINT, 
  FULL_SURVEY_BLUEPRINT,
  generateGoogleFormsAppsScript 
} from '../../../shared/templates/surveyBlueprint';

interface ResourcesPageProps {
  initialTab?: 'templates' | 'factors' | 'methodology';
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  initialTab = 'templates'
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'factors' | 'methodology'>(initialTab);
  const [showBlueprintPreview, setShowBlueprintPreview] = useState<boolean>(false);
  const [blueprintInstrumentFilter, setBlueprintInstrumentFilter] = useState<'all' | 'commuter' | 'facilities'>('all');

  // Helper to trigger direct browser file downloads
  const handleDownloadFile = (filename: string, content: string, mime: string = 'text/plain') => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadBlueprintJson = () => {
    const jsonStr = JSON.stringify(FULL_SURVEY_BLUEPRINT, null, 2);
    handleDownloadFile('campus_carbon_question_blueprint.json', jsonStr, 'application/json');
  };

  const downloadBlueprintCsv = () => {
    const header = 'stable_field_id,instrument,scope,question_text,response_type,unit,is_required,validation_rules,example_response,destination_calculation_field\n';
    const rows = FULL_SURVEY_BLUEPRINT.map(q => 
      `"${q.stableFieldId}","${q.instrument}",${q.scope},"${q.questionText.replace(/"/g, '""')}","${q.responseType}","${q.unit || ''}",${q.isRequired},"${q.validationRules || ''}","${q.exampleResponse}","${q.destinationCalculationField}"`
    ).join('\n');
    handleDownloadFile('campus_carbon_question_blueprint.csv', header + rows, 'text/csv');
  };

  const downloadAppsScript = () => {
    const script = generateGoogleFormsAppsScript();
    handleDownloadFile('CampusCarbon_GoogleFormsGenerator.gs', script, 'application/javascript');
  };

  const downloadEnergyTemplate = () => {
    const csv = `month,scope,source_name,category,quantity,unit,data_source,notes
2022-01,2,Main Substation Meter,purchased_electricity_grid,58200,kWh,Utility Monthly Invoice,DPDC Meter #A441
2022-01,1,Backup Generator,stationary_combustion_generator,750,L,Fuel Requisition Slip,Commercial Diesel
2022-01,1,Campus Shuttles,mobile_combustion_fleet,1600,L,Fleet Logbook,Diesel Bus 1 & 2
2022-01,1,Official Sedan,mobile_combustion_fleet,710,L,Driver Fuel Card,Octane
2022-01,1,Student Cafeteria,cooking_combustion_cafeteria,1050,kg,Cylinder Supplier Bill,Commercial 45kg LPG
2022-02,2,Main Substation Meter,purchased_electricity_grid,61400,kWh,Utility Monthly Invoice,DPDC Meter #A441
`;
    handleDownloadFile('campus_energy_fuel_records_template.csv', csv, 'text/csv');
  };

  const downloadCommuterTemplate = () => {
    const csv = `respondent_id,role,origin_area,primary_mode,total_one_way_km,days_per_week,uses_campus_bus,car_fuel_type,car_occupancy
R001,student,Dhanmondi,public_bus,6.5,5,false,,
R002,student,Mirpur,rickshaw,4.2,4,false,,
R003,faculty,Uttara,private_car,18.0,4,false,octane,1
R004,staff,Mohammadpur,walking,1.5,5,false,,
R005,student,Bashundhara,battery_rickshaw,14.5,5,false,,
`;
    handleDownloadFile('campus_commuter_survey_template.csv', csv, 'text/csv');
  };

  const downloadRefrigerantTemplate = () => {
    const csv = `equipment_id,location,gas_type,annual_top_up_kg,servicing_date,contractor_name,notes
CHILLER-01,Academic Building Roof,R-410A,45,2022-06-15,Delta Aircon,Routine annual top-up
SPLIT-AC-LAB,Computer Lab 3,R-22,12,2022-08-10,Technician Rahim,Legacy R-22 unit (Montreal Protocol)
`;
    handleDownloadFile('campus_refrigerant_servicing_log.csv', csv, 'text/csv');
  };

  const displayedQuestions = FULL_SURVEY_BLUEPRINT.filter(q => {
    if (blueprintInstrumentFilter === 'commuter') return q.instrument === 'commuter_survey';
    if (blueprintInstrumentFilter === 'facilities') return q.instrument === 'facilities_records';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 3-Destination Index Tabs */}
      <div className="bg-white rounded-2xl border border-navy-100 p-1.5 shadow-2xs flex space-x-1">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-cobalt text-white shadow-2xs'
              : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Survey & Data Templates</span>
        </button>

        <button
          onClick={() => setActiveTab('factors')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'factors'
              ? 'bg-cobalt text-white shadow-2xs'
              : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Emission Factors</span>
        </button>

        <button
          onClick={() => setActiveTab('methodology')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'methodology'
              ? 'bg-cobalt text-white shadow-2xs'
              : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Methodology & References</span>
        </button>
      </div>

      {/* DESTINATION 1: Data Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
              Institutional Data Collection Package & Google Forms Blueprint
            </h2>
            <p className="text-sm text-navy-600">
              Download structured survey blueprints, generate automated Google Forms in one click, and collect standardized activity logs for your greenhouse gas inventory.
            </p>
          </div>

          {/* Featured Google Forms Generator Package */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-cobalt-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cobalt-50 text-cobalt font-bold text-xs">
                  <Code className="w-3.5 h-3.5" />
                  <span>Google Apps Script Generator</span>
                </div>
                <h3 className="text-lg font-black text-navy-900">
                  Automated Commuter Survey Form Package
                </h3>
                <p className="text-xs text-navy-600">
                  Builds a full 9-question anonymous commuter travel survey in your Google Drive with zero manual question entry.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={downloadAppsScript}
                  className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .gs Script</span>
                </button>
                <button
                  onClick={downloadBlueprintJson}
                  className="px-3 py-2 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-cobalt" />
                  <span>Blueprint (JSON)</span>
                </button>
                <button
                  onClick={downloadBlueprintCsv}
                  className="px-3 py-2 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Table className="w-3.5 h-3.5 text-cobalt" />
                  <span>Blueprint (CSV)</span>
                </button>
                <button
                  onClick={() => setShowBlueprintPreview(!showBlueprintPreview)}
                  className="px-3 py-2 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {showBlueprintPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{showBlueprintPreview ? 'Hide Questions' : 'Preview Questions'}</span>
                </button>
              </div>
            </div>

            {/* Quick 4-Step Deployment Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-navy-50/60 border border-navy-100 space-y-1">
                <span className="font-bold text-navy-800 block text-xs">1. Download Script</span>
                <p className="text-[11px] text-navy-600 leading-relaxed">
                  Download the generator script (`CampusCarbon_GoogleFormsGenerator.gs`) above.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-navy-50/60 border border-navy-100 space-y-1">
                <span className="font-bold text-navy-800 block text-xs">2. Open Google Apps Script</span>
                <p className="text-[11px] text-navy-600 leading-relaxed">
                  Open Google Drive, click New → More → Google Apps Script, and paste the code.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-navy-50/60 border border-navy-100 space-y-1">
                <span className="font-bold text-navy-800 block text-xs">3. Run Form Generator</span>
                <p className="text-[11px] text-navy-600 leading-relaxed">
                  Select `createCampusCommuterSurvey` and click Run. Grant form-creation permission.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-navy-50/60 border border-navy-100 space-y-1">
                <span className="font-bold text-navy-800 block text-xs">4. Export & Upload CSV</span>
                <p className="text-[11px] text-navy-600 leading-relaxed">
                  Distribute the form link to students & staff. Export responses to CSV and import in Assessment!
                </p>
              </div>
            </div>

            {/* Expandable Blueprint Schema Table */}
            {showBlueprintPreview && (
              <div className="mt-4 pt-4 border-t border-navy-100 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy-800">Filter Instrument:</span>
                    <button
                      onClick={() => setBlueprintInstrumentFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        blueprintInstrumentFilter === 'all' ? 'bg-navy-800 text-white' : 'bg-navy-50 text-navy-700'
                      }`}
                    >
                      All ({FULL_SURVEY_BLUEPRINT.length})
                    </button>
                    <button
                      onClick={() => setBlueprintInstrumentFilter('commuter')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        blueprintInstrumentFilter === 'commuter' ? 'bg-purple-700 text-white' : 'bg-navy-50 text-navy-700'
                      }`}
                    >
                      Commuter Survey ({COMMUTER_SURVEY_BLUEPRINT.length})
                    </button>
                    <button
                      onClick={() => setBlueprintInstrumentFilter('facilities')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        blueprintInstrumentFilter === 'facilities' ? 'bg-amber-700 text-white' : 'bg-navy-50 text-navy-700'
                      }`}
                    >
                      Facilities Records ({FACILITIES_RECORDS_BLUEPRINT.length})
                    </button>
                  </div>
                  <span className="text-[11px] text-navy-400">Stable IDs map directly to the engine</span>
                </div>

                <div className="overflow-x-auto border border-navy-100 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-navy-50/80 text-navy-700 border-b border-navy-100">
                        <th className="p-3 font-bold">Stable ID</th>
                        <th className="p-3 font-bold">Scope</th>
                        <th className="p-3 font-bold">Question / Record Description</th>
                        <th className="p-3 font-bold">Type</th>
                        <th className="p-3 font-bold">Unit / Rule</th>
                        <th className="p-3 font-bold">Destination Field</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-50">
                      {displayedQuestions.map((q) => (
                        <tr key={q.stableFieldId} className="hover:bg-navy-50/40">
                          <td className="p-3 font-mono text-[11px] font-bold text-navy-900">{q.stableFieldId}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              q.scope === 1 ? 'bg-amber-100 text-amber-900' :
                              q.scope === 2 ? 'bg-blue-100 text-blue-900' :
                              q.scope === 3 ? 'bg-purple-100 text-purple-900' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {q.scope === 0 ? 'Admin' : `Scope ${q.scope}`}
                            </span>
                          </td>
                          <td className="p-3 max-w-sm">
                            <div className="font-semibold text-navy-800">{q.questionText}</div>
                            {q.helpText && <div className="text-[11px] text-navy-400 mt-0.5">{q.helpText}</div>}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-navy-600">{q.responseType}</td>
                          <td className="p-3 text-[11px] text-navy-600">{q.unit || q.validationRules || '—'}</td>
                          <td className="p-3 font-mono text-[11px] text-cobalt">{q.destinationCalculationField}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Standard CSV Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Energy & Fuel Invoices */}
            <div className="bg-white p-6 rounded-3xl border border-navy-100 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-navy-900 text-base">Scope 1 & 2 Utility Records</h3>
                <p className="text-xs text-navy-600 leading-relaxed">
                  Monthly billing statements for grid electricity (kWh), generator diesel (L), official vehicle octane/diesel (L), and cafeteria LPG (kg).
                </p>
                <div className="text-[11px] text-navy-500 space-y-1 pt-1">
                  <div><strong>Format:</strong> CSV / XLSX spreadsheet</div>
                  <div><strong>Source:</strong> Accounts / Facility Engineering</div>
                </div>
              </div>

              <button
                onClick={downloadEnergyTemplate}
                className="w-full py-2.5 px-4 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Energy CSV</span>
              </button>
            </div>

            {/* Card 2: Commuter Travel Survey */}
            <div className="bg-white p-6 rounded-3xl border border-navy-100 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-navy-900 text-base">Campus Commuter Survey CSV</h3>
                <p className="text-xs text-navy-600 leading-relaxed">
                  Individual passenger questionnaire capturing student, faculty, and administrative staff transport modes, origin wards, and weekly trips.
                </p>
                <div className="text-[11px] text-navy-500 space-y-1 pt-1">
                  <div><strong>Format:</strong> CSV Survey Template</div>
                  <div><strong>Target:</strong> 10%–20% representative sample</div>
                </div>
              </div>

              <button
                onClick={downloadCommuterTemplate}
                className="w-full py-2.5 px-4 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Commuter CSV</span>
              </button>
            </div>

            {/* Card 3: Refrigerant & HVAC Servicing Log */}
            <div className="bg-white p-6 rounded-3xl border border-navy-100 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-navy-900 text-base">HVAC Refrigerants Register</h3>
                <p className="text-xs text-navy-600 leading-relaxed">
                  Logbook of annual air conditioning servicing, gas cylinder purchases, top-up quantities (kg), and refrigerant types (R-410A, R-22, R-32).
                </p>
                <div className="text-[11px] text-navy-500 space-y-1 pt-1">
                  <div><strong>Format:</strong> CSV Servicing Log</div>
                  <div><strong>Source:</strong> Campus HVAC Maintenance</div>
                </div>
              </div>

              <button
                onClick={downloadRefrigerantTemplate}
                className="w-full py-2.5 px-4 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download HVAC CSV</span>
              </button>
            </div>
          </div>

          {/* Collection Guidance Box */}
          <div className="bg-white p-6 rounded-3xl border border-navy-100 shadow-2xs space-y-3">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cobalt" />
              <span>Step-by-Step Institutional Collection Guidance</span>
            </h3>
            <ul className="text-xs text-navy-700 space-y-2 list-disc pl-5 leading-relaxed">
              <li><strong>Consolidation Boundary:</strong> Include all academic buildings, computer centers, student cafeterias, and transport fleets under university operational control.</li>
              <li><strong>Utility Documentation:</strong> Collate 12 consecutive monthly electricity billing statements matching your designated reporting fiscal or calendar year.</li>
              <li><strong>Commuter Sampling:</strong> Send the commuter survey through the official university portal or email list. Aim for at least 300 completed responses across academic departments to ensure statistical reliability.</li>
              <li><strong>Refrigerant Top-Ups:</strong> Record only top-up mass added during annual servicing. Factory pre-charged factory refrigerant inside closed loops is not an operational emission until serviced or decommissioned.</li>
            </ul>
          </div>
        </div>
      )}

      {/* DESTINATION 2: Emission Factors */}
      {activeTab === 'factors' && (
        <FactorRegistryBrowser />
      )}

      {/* DESTINATION 3: Methodology & References */}
      {activeTab === 'methodology' && (
        <MethodologyReferences />
      )}
    </div>
  );
};
