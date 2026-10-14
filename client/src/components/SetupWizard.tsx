import React, { useState } from 'react';
import { Building2, Users, Calendar, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { Institution, PopulationRecord, CampusBoundary } from '../../../shared/types';

interface SetupWizardProps {
  institution: Institution;
  population?: PopulationRecord;
  boundary?: CampusBoundary;
  onSaveInstitution: (inst: Partial<Institution>) => Promise<void>;
  onSavePopulation: (pop: Partial<PopulationRecord>) => Promise<void>;
  onSaveBoundary: (bnd: Partial<CampusBoundary>) => Promise<void>;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({
  institution,
  population,
  boundary,
  onSaveInstitution,
  onSavePopulation,
  onSaveBoundary
}) => {
  const [name, setName] = useState(institution.name);
  const [type, setType] = useState(institution.type);
  const [division, setDivision] = useState(institution.division);
  const [district, setDistrict] = useState(institution.district);
  const [address, setAddress] = useState(institution.address || '');
  const [consolidationMethod, setConsolidationMethod] = useState(institution.consolidationMethod);
  const [reportingYear, setReportingYear] = useState(institution.reportingYear);
  const [periodStart, setPeriodStart] = useState(institution.periodStart);
  const [periodEnd, setPeriodEnd] = useState(institution.periodEnd);
  const [periodType, setPeriodType] = useState(institution.periodType);
  const [optIn, setOptIn] = useState(institution.optInPublicComparison);

  // Population & Geometry - Zero/empty defaults for new assessments
  const [students, setStudents] = useState(population?.studentHeadcount ?? 0);
  const [faculty, setFaculty] = useState(population?.facultyHeadcount ?? 0);
  const [staff, setStaff] = useState(population?.staffHeadcount ?? 0);
  const [operatingDays, setOperatingDays] = useState(population?.campusOperatingDaysPerYear ?? 0);
  const [floorArea, setFloorArea] = useState(boundary?.grossFloorAreaM2 ?? 0);
  const [landArea, setLandArea] = useState(boundary?.landAreaAcres ?? 0);

  // Sync state whenever institution/population/boundary changes
  React.useEffect(() => {
    setName(institution.name);
    setType(institution.type);
    setDivision(institution.division);
    setDistrict(institution.district);
    setAddress(institution.address || '');
    setConsolidationMethod(institution.consolidationMethod);
    setReportingYear(institution.reportingYear);
    setPeriodStart(institution.periodStart);
    setPeriodEnd(institution.periodEnd);
    setPeriodType(institution.periodType);
    setOptIn(institution.optInPublicComparison);
    setStudents(population?.studentHeadcount ?? 0);
    setFaculty(population?.facultyHeadcount ?? 0);
    setStaff(population?.staffHeadcount ?? 0);
    setOperatingDays(population?.campusOperatingDaysPerYear ?? 0);
    setFloorArea(boundary?.grossFloorAreaM2 ?? 0);
    setLandArea(boundary?.landAreaAcres ?? 0);
  }, [institution, population, boundary]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalHeadcount = students + faculty + staff;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveInstitution({
        id: institution.id,
        name,
        type,
        division,
        district,
        address,
        consolidationMethod,
        reportingYear,
        periodStart,
        periodEnd,
        periodType,
        optInPublicComparison: optIn
      });

      await onSavePopulation({
        institutionId: institution.id,
        year: reportingYear,
        studentHeadcount: students,
        facultyHeadcount: faculty,
        staffHeadcount: staff,
        totalHeadcount,
        campusOperatingDaysPerYear: operatingDays,
        sourceCitation: 'Verified Institutional Registrar & Administration Records'
      });

      if (boundary) {
        await onSaveBoundary({
          id: boundary.id,
          grossFloorAreaM2: floorArea,
          landAreaAcres: landArea
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save setup:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-700" />
          Institution & Organizational Boundaries Setup
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Configure institutional metadata, consolidation approach, reporting duration, and population denominators. 
          These parameters determine per-capita carbon footprints and ensure conformity with the GHG Protocol Corporate Standard.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Institutional Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            1. Institutional Identity & Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Official Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              >
                <option value="private">Private University (UGC Approved)</option>
                <option value="public">Public University</option>
                <option value="international">International / Specialized University</option>
                <option value="other">Other Higher Education College/Institute</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administrative Division</label>
              <select
                value={division}
                onChange={e => setDivision(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              >
                <option value="Dhaka">Dhaka Division</option>
                <option value="Chittagong">Chittagong Division</option>
                <option value="Rajshahi">Rajshahi Division</option>
                <option value="Khulna">Khulna Division</option>
                <option value="Barisal">Barisal Division</option>
                <option value="Sylhet">Sylhet Division</option>
                <option value="Rangpur">Rangpur Division</option>
                <option value="Mymensingh">Mymensingh Division</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Campus Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Beribadh Road, Mohammadpur, Dhaka 1207"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Consolidation & Reporting Period */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            2. Consolidation Approach & Accounting Boundary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organizational Consolidation</label>
              <select
                value={consolidationMethod}
                onChange={e => setConsolidationMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              >
                <option value="operational_control">Operational Control (Recommended for HEIs)</option>
                <option value="financial_control">Financial Control</option>
                <option value="equity_share">Equity Share</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Under Operational Control, the university accounts for 100% of emissions from operations over which it has the authority to introduce and implement operating policies.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reporting Period Type</label>
              <select
                value={periodType}
                onChange={e => setPeriodType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              >
                <option value="calendar_year">Calendar Year (Jan 1 - Dec 31)</option>
                <option value="academic_year">Academic / Fiscal Year</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reporting Start Date</label>
              <input
                type="date"
                value={periodStart}
                onChange={e => setPeriodStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reporting End Date</label>
              <input
                type="date"
                value={periodEnd}
                onChange={e => setPeriodEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Population Denominators */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Users className="w-4 h-4 text-teal-600" />
            3. Campus Population & Activity Denominators
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Enrolled Students</label>
              <input
                type="number"
                value={students}
                onChange={e => setStudents(Number(e.target.value))}
                min="1"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Faculty Members</label>
              <input
                type="number"
                value={faculty}
                onChange={e => setFaculty(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administrative Staff</label>
              <input
                type="number"
                value={staff}
                onChange={e => setStaff(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              />
            </div>

            <div className="sm:col-span-3 bg-teal-50/70 p-3 rounded-xl border border-teal-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-teal-900">Total Deduplicated Campus Population:</span>
              <span className="text-base font-extrabold text-teal-800">{totalHeadcount.toLocaleString()} people</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Days / Year</label>
              <input
                type="number"
                value={operatingDays}
                onChange={e => setOperatingDays(Number(e.target.value))}
                min="100"
                max="365"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              />
              <span className="text-[11px] text-slate-400">ULAB baseline: 294 academic days</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gross Floor Area (m²)</label>
              <input
                type="number"
                value={floorArea}
                onChange={e => setFloorArea(Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Land Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={landArea}
                onChange={e => setLandArea(Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Opt-In for Peer Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="optInCheck"
              checked={optIn}
              onChange={e => setOptIn(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <div>
              <label htmlFor="optInCheck" className="text-xs font-bold text-slate-900 cursor-pointer">
                Opt-in to Anonymous National Peer Comparison
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                When checked, anonymized or institutional aggregate inventory totals can be compared with other Bangladeshi universities that have also consented to peer benchmarking.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-forest-700 bg-forest-50 border border-forest-200 px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4 text-forest-600" />
              Institutional parameters and population records updated successfully!
            </div>
          )}
          {!savedSuccess && <div />}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Update Boundaries'}
          </button>
        </div>
      </form>
    </div>
  );
};
