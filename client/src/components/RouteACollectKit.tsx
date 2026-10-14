import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  Code, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { CommuterRole, CommuterMode } from '../../../shared/types';
import { Language, t } from '../../../shared/i18n';

interface RouteACollectKitProps {
  institutionId: string;
  onImportCommuters: (rows: any[]) => Promise<void>;
  lang: Language;
}

export const RouteACollectKit: React.FC<RouteACollectKitProps> = ({
  institutionId,
  onImportCommuters,
  lang
}) => {
  // Hosted Survey State
  const [role, setRole] = useState<CommuterRole>('student');
  const [originArea, setOriginArea] = useState('Dhanmondi');
  const [primaryMode, setPrimaryMode] = useState<CommuterMode>('walking');
  const [oneWayKm, setOneWayKm] = useState(3.0);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [usesFleet, setUsesFleet] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // Bulk Upload / Paste State
  const [csvText, setCsvText] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Single survey submission handler
  const handleSingleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const annualAttendanceDays = daysPerWeek * (294 / 6); // standard academic year mapping
    const payload = [{
      institutionId,
      campusId: 'CAMPUS-MAIN',
      role,
      originArea,
      annualAttendanceDays,
      primaryMode,
      totalOneWayKm: oneWayKm,
      distanceBasis: 'one_way',
      usesInstitutionalFleet: usesFleet
    }];

    try {
      await onImportCommuters(payload);
      setSurveySubmitted(true);
      setTimeout(() => setSurveySubmitted(false), 3000);
    } catch (err) {
      console.error('Failed to submit survey response:', err);
    }
  };

  // CSV text parsing
  const handleParseCsv = () => {
    setParseErrors([]);
    setParsedRows([]);
    setImportSuccess(false);

    if (!csvText.trim()) {
      setParseErrors(['Please paste CSV data or template rows']);
      return;
    }

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setParseErrors(['CSV must contain a header row and at least one data row']);
      return;
    }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const validRoles = ['student', 'faculty', 'staff'];
    const validModes = [
      'walking', 'bicycle', 'rickshaw', 'battery_rickshaw', 'cng_autorickshaw',
      'motorcycle', 'private_car', 'rideshare', 'public_bus', 'leguna',
      'institutional_bus', 'rail_metro', 'multiple_transport'
    ];

    const rows: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim());

      const rRole = cols[1]?.toLowerCase();
      const rArea = cols[3] || 'Dhaka';
      const rDays = Number(cols[4]);
      const rMode = cols[5]?.toLowerCase();
      const rKm = Number(cols[6]);

      if (!validRoles.includes(rRole)) {
        errors.push(`Row ${i + 1}: Invalid role "${rRole}". Must be student, faculty, or staff.`);
      }
      if (!validModes.includes(rMode)) {
        errors.push(`Row ${i + 1}: Unrecognized transport mode "${rMode}".`);
      }
      if (isNaN(rKm) || rKm <= 0) {
        errors.push(`Row ${i + 1}: Distance "${cols[6]}" must be a positive number in km.`);
      }

      rows.push({
        institutionId,
        campusId: cols[2] || 'CAMPUS-MAIN',
        role: rRole || 'student',
        originArea: rArea,
        annualAttendanceDays: !isNaN(rDays) && rDays > 0 ? rDays : 294,
        primaryMode: rMode || 'walking',
        totalOneWayKm: !isNaN(rKm) ? rKm : 5.0,
        distanceBasis: 'one_way',
        usesInstitutionalFleet: cols[10]?.toLowerCase() === 'true'
      });
    }

    if (errors.length > 0) {
      setParseErrors(errors);
    } else {
      setParsedRows(rows);
    }
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    try {
      await onImportCommuters(parsedRows);
      setImportSuccess(true);
      setParsedRows([]);
      setCsvText('');
    } catch (err) {
      setParseErrors(['Failed to import batch into database']);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-teal-700" />
          Route A — Standardized Data Collection Kit
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Higher education institutions can distribute standardized data collection kits to facilities staff, transport managers, 
          and campus commuters. Download ready-to-use templates, run the automated Google Forms creator script, or import completed records below.
        </p>
      </div>

      {/* Downloadable Templates Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Download className="w-4 h-4 text-teal-600" />
          Downloadable Collection Templates & Forms Script
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Commuter Survey Template */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-xs text-slate-900">Campus Commuter Survey Template</div>
              <div className="text-[11px] text-slate-500 mt-1">
                CSV headers for individual student, faculty, and staff daily travel modes, distances, and areas.
              </div>
            </div>
            <a
              href="/api/templates/commuter"
              download="commuter_survey_template.csv"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200 hover:bg-teal-100 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Template
            </a>
          </div>

          {/* Fuels & Generator Template */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-xs text-slate-900">Fuels, Generator & Cafeteria</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Structured layout for diesel generator receipts, vehicle octane, bus diesel, and cafeteria LPG.
              </div>
            </div>
            <a
              href="/api/templates/fuels"
              download="fuels_generator_fleet_template.csv"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200 hover:bg-teal-100 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Template
            </a>
          </div>

          {/* Electricity Billing Template */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-xs text-slate-900">Electricity Billing Records</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Utility import meters (DESCO/DPDC/BREB), peak/off-peak protection, and on-site solar generation.
              </div>
            </div>
            <a
              href="/api/templates/electricity"
              download="electricity_billing_template.csv"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200 hover:bg-teal-100 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Template
            </a>
          </div>

          {/* AC Refrigerants Template */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-xs text-slate-900">AC Refrigerants Logbook</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Logs top-up and servicing for R-410A and R-22 (HCFC ODS) with service provider receipts.
              </div>
            </div>
            <a
              href="/api/templates/refrigerants"
              download="ac_refrigerants_template.csv"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200 hover:bg-teal-100 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Template
            </a>
          </div>

          {/* Google Apps Script Automated Generator */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/70 md:col-span-2 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-xs text-teal-900 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-teal-700" />
                Google Apps Script — Automated Google Form Creator
              </div>
              <div className="text-[11px] text-teal-800/80 mt-1">
                Run this script in your Google Drive to instantly generate a branded, anonymous, mobile-ready Google Forms survey for your campus community with validated questions and choices.
              </div>
            </div>
            <a
              href="/api/templates/google-forms-script"
              download="CampusCarbon_CommuterSurvey_GoogleFormsGenerator.js"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 transition shadow-xs self-start"
            >
              <Download className="w-3.5 h-3.5" />
              Download Google Apps Script (.js)
            </a>
          </div>
        </div>
      </div>

      {/* Route A Native Online Questionnaire */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          Native Hosted Survey (Direct Campus Questionnaire)
        </h3>
        <p className="text-xs text-slate-500">
          Respondents or interviewers can submit individual commute answers directly. Zero identifiable information (no student ID, phone, or precise home address) is requested.
        </p>

        <form onSubmit={handleSingleSurveySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">1. Campus Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as CommuterRole)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty Member</option>
              <option value="staff">Administrative Staff</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">2. Commuter Origin District / Area</label>
            <select
              value={originArea}
              onChange={e => setOriginArea(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            >
              <option value="Dhanmondi">Dhanmondi</option>
              <option value="Mohammadpur">Mohammadpur</option>
              <option value="Mirpur">Mirpur</option>
              <option value="Uttara">Uttara</option>
              <option value="Farmgate">Farmgate</option>
              <option value="Gulshan">Gulshan</option>
              <option value="Banani">Banani</option>
              <option value="Badda">Badda</option>
              <option value="Adabar">Adabar</option>
              <option value="Kallyanpur">Kallyanpur</option>
              <option value="Old Dhaka">Old Dhaka</option>
              <option value="Other Area">Other Area</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">3. Primary Travel Mode</label>
            <select
              value={primaryMode}
              onChange={e => setPrimaryMode(e.target.value as CommuterMode)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            >
              <option value="walking">Walking (Non-motorized)</option>
              <option value="bicycle">Bicycle</option>
              <option value="rickshaw">Rickshaw (Human-powered)</option>
              <option value="battery_rickshaw">Battery Auto-Rickshaw / Easybike</option>
              <option value="cng_autorickshaw">CNG Auto-Rickshaw</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="private_car">Private Car</option>
              <option value="public_bus">Public Bus</option>
              <option value="leguna">Leguna (Human hauler)</option>
              <option value="institutional_bus">University Bus / Van</option>
              <option value="multiple_transport">Multiple Transports</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">4. Approximate One-Way Distance (km)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={oneWayKm}
              onChange={e => setOneWayKm(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">5. Days on Campus per Week</label>
            <input
              type="number"
              min="1"
              max="6"
              value={daysPerWeek}
              onChange={e => setDaysPerWeek(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={usesFleet}
                onChange={e => setUsesFleet(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Uses University-operated shuttle (Scope 1 fleet accounted)</span>
            </label>
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2">
            {surveySubmitted ? (
              <span className="text-forest-700 font-semibold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-forest-600" />
                Response saved anonymously to campaign database!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Response
            </button>
          </div>
        </form>
      </div>

      {/* Bulk CSV / Paste Import Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Upload className="w-4 h-4 text-teal-600" />
          Bulk Data Ingestion (Paste or Upload Completed CSV)
        </h3>
        <p className="text-xs text-slate-500">
          Paste comma-separated rows or export from your Google Sheet / Excel survey. Each row will be validated against strict dimensional rules before ingestion.
        </p>

        <textarea
          rows={5}
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          placeholder="response_id,role,campus_id,origin_area,annual_attendance_days,primary_mode,total_one_way_km,distance_basis,car_fuel_type,car_occupancy,uses_institutional_fleet
RESP-101,student,CAMPUS-MAIN,Mirpur,294,public_bus,14.5,one_way,,,false
RESP-102,faculty,CAMPUS-MAIN,Uttara,294,private_car,18.0,one_way,gasoline,1,false"
          className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-slate-50"
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleParseCsv}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition shadow-2xs"
          >
            Parse & Validate Records
          </button>

          {parsedRows.length > 0 && (
            <button
              type="button"
              disabled={importing}
              onClick={handleExecuteImport}
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${parsedRows.length} Valid Records`}
            </button>
          )}
        </div>

        {/* Validation Errors */}
        {parseErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Found {parseErrors.length} validation errors:
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {parseErrors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {parseErrors.length > 5 && <li>...and {parseErrors.length - 5} more errors</li>}
            </ul>
          </div>
        )}

        {/* Import Success */}
        {importSuccess && (
          <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-600" />
            Batch successfully imported into the campus inventory! Navigate to 'Inventory Results' to recalculate.
          </div>
        )}
      </div>
    </div>
  );
};
