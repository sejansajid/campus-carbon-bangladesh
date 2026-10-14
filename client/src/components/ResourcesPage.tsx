import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  BookOpen, 
  Download, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Code
} from 'lucide-react';
import { FactorRegistryBrowser } from './FactorRegistryBrowser';
import { MethodologyReferences } from './MethodologyReferences';
import { Language } from '../../../shared/i18n';

interface ResourcesPageProps {
  initialTab?: 'templates' | 'factors' | 'methodology';
  lang: Language;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  initialTab = 'templates',
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'factors' | 'methodology'>(initialTab);
  const isBn = lang === 'bn';

  // Helper to trigger direct CSV downloads
  const handleDownloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    handleDownloadCsv('campus_energy_fuel_records_template.csv', csv);
  };

  const downloadCommuterTemplate = () => {
    const csv = `respondent_id,role,origin_area,primary_mode,total_one_way_km,days_per_week,uses_campus_bus,car_fuel_type,car_occupancy
R001,student,Dhanmondi,public_bus,6.5,5,false,,
R002,student,Mirpur,rickshaw,4.2,4,false,,
R003,faculty,Uttara,private_car,18.0,4,false,octane,1
R004,staff,Mohammadpur,walking,1.5,5,false,,
R005,student,Bashundhara,battery_rickshaw,14.5,5,false,,
`;
    handleDownloadCsv('campus_commuter_survey_template.csv', csv);
  };

  const downloadRefrigerantTemplate = () => {
    const csv = `equipment_id,location,gas_type,annual_top_up_kg,servicing_date,contractor_name,notes
CHILLER-01,Academic Building Roof,R-410A,45,2022-06-15,Delta Aircon,Routine annual top-up
SPLIT-AC-LAB,Computer Lab 3,R-22,12,2022-08-10,Technician Rahim,Legacy R-22 unit (Montreal Protocol)
`;
    handleDownloadCsv('campus_refrigerant_servicing_log.csv', csv);
  };

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
          <span>{isBn ? 'তথ্য সংগ্রহের টেমপ্লেট' : 'Data templates'}</span>
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
          <span>{isBn ? 'নির্গমন সহগ ডেটাবেস' : 'Emission factors'}</span>
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
          <span>{isBn ? 'পদ্ধতি ও তথ্যসূত্র' : 'Methodology & references'}</span>
        </button>
      </div>

      {/* DESTINATION 1: Data Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
              {isBn ? 'প্রাতিষ্ঠানিক তথ্য সংগ্রহের টেমপ্লেট ও ফর্ম' : 'Institutional Data Collection Templates'}
            </h2>
            <p className="text-sm text-navy-600">
              {isBn
                ? 'বিশ্ববিদ্যালয়ের জ্বালানি বিল, বিদ্যুৎ মিটার, এসি রক্ষণাবেক্ষণ এবং যাতায়াত জরিপের তথ্য সংগ্রহের জন্য প্রমিত স্প্রেডশিট ডাউনলোড করুন।'
                : 'Download structured spreadsheets and standardized survey templates to collect verified campus records for your greenhouse gas inventory.'}
            </p>
          </div>

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
                <h3 className="font-bold text-navy-900 text-base">Campus Commuter Survey</h3>
                <p className="text-xs text-navy-600 leading-relaxed">
                  Individual passenger questionnaire capturing student, faculty, and administrative staff transport modes, origin wards, and weekly trips.
                </p>
                <div className="text-[11px] text-navy-500 space-y-1 pt-1">
                  <div><strong>Format:</strong> CSV Survey Template & Script</div>
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
        <FactorRegistryBrowser lang={lang} />
      )}

      {/* DESTINATION 3: Methodology & References */}
      {activeTab === 'methodology' && (
        <MethodologyReferences lang={lang} />
      )}
    </div>
  );
};
