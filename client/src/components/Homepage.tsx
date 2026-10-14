import React from 'react';
import { ArrowRight, Flame, Zap, Car } from 'lucide-react';
import { CampusIllustration } from './CampusIllustration';
import { Language } from '../../../shared/i18n';

interface HomepageProps {
  onStartAssessment: () => void;
  lang: Language;
}

export const Homepage: React.FC<HomepageProps> = ({
  onStartAssessment,
  lang
}) => {
  const isBn = lang === 'bn';

  return (
    <div className="space-y-12 pb-12 max-w-6xl mx-auto">
      {/* 1. Purpose-Led Hero */}
      <section className="pt-4 sm:pt-8 text-center space-y-5 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 border border-navy-200 text-xs font-semibold text-navy-800">
          <span className="w-2 h-2 rounded-full bg-cobalt"></span>
          {isBn ? 'উচ্চশিক্ষা প্রতিষ্ঠানের জন্য কার্বন মূল্যায়ন সেবা' : 'Institutional Carbon Assessment for Higher Education'}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-800 tracking-tight leading-[1.15]">
          {isBn ? (
            <>
              আপনার বিশ্ববিদ্যালয়ের কার্বন পদচিহ্ন পরিমাপ করুন। <br className="hidden sm:inline" />
              উৎস জানুন। বাস্তবসম্মত প্রশমন পরিকল্পনা করুন।
            </>
          ) : (
            <>
              Measure your university’s carbon footprint. <br className="hidden sm:inline" />
              Understand its sources. Plan practical reductions.
            </>
          )}
        </h1>

        <p className="text-lg sm:text-xl text-navy-600 max-w-2xl mx-auto leading-relaxed">
          {isBn
            ? 'ক্যাম্পাস জ্বালানি, বিদ্যুৎ বিল ও যাতায়াতের হিসাবকে একটি সমন্বিত কার্বন ইনভেনটরি ও প্রাতিষ্ঠানিক কর্মপরিকল্পনায় রূপান্তর করুন।'
            : 'Turn campus energy, transport and activity records into a clear emissions inventory and practical action plan.'}
        </p>

        <div className="pt-2">
          <button
            onClick={onStartAssessment}
            className="px-8 py-3.5 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-base shadow-sm hover:shadow transition inline-flex items-center gap-2 cursor-pointer group"
          >
            <span>{isBn ? 'মূল্যায়ন শুরু করুন' : 'Start assessment'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* 2. Interactive Scope Illustration */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-navy-100 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-800">
              {isBn ? 'ক্যাম্পাস নির্গমন কাঠামো ও স্কোপ' : 'Campus Emission Boundaries'}
            </h2>
            <p className="text-xs sm:text-sm text-navy-600">
              {isBn 
                ? 'ক্যাম্পাসের প্রতিটি কার্যকলাপ আন্তর্জাতিক হিসাব মানদণ্ডে কীভাবে বিন্যস্ত তা জানতে যেকোনো উপাদানে ক্লিক করুন।'
                : 'Select any source on campus to see how university activities map to international accounting scopes.'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span>Scope 1</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cobalt"></span>Scope 2</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-600"></span>Scope 3</span>
          </div>
        </div>

        <CampusIllustration lang={lang} />
      </section>

      {/* 3. Concise Overview of Scopes and Data Needed */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <Flame className="w-4 h-4" />
            <span>Scope 1: Direct Operations</span>
          </div>
          <p className="text-xs text-navy-600 leading-relaxed">
            Fuel used by university-controlled generators, official vehicle fleets, cafeteria cooking gas, and eligible AC refrigerant leakage.
          </p>
          <div className="text-[11px] text-navy-400 pt-1 border-t border-navy-50">
            <strong>Data needed:</strong> Fuel purchase invoices, vehicle logbooks, and HVAC maintenance records.
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-cobalt font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>Scope 2: Purchased Electricity</span>
          </div>
          <p className="text-xs text-navy-600 leading-relaxed">
            Emissions associated with utility electricity consumed by academic buildings, computer labs, and campus facilities.
          </p>
          <div className="text-[11px] text-navy-400 pt-1 border-t border-navy-50">
            <strong>Data needed:</strong> 12 monthly utility billing statements showing total kilowatt-hours (kWh).
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <Car className="w-4 h-4" />
            <span>Scope 3: Commuting & Value Chain</span>
          </div>
          <p className="text-xs text-navy-600 leading-relaxed">
            Daily passenger travel by students, faculty, and administrative staff, along with upstream electrical transmission losses.
          </p>
          <div className="text-[11px] text-navy-400 pt-1 border-t border-navy-50">
            <strong>Data needed:</strong> Sample commuter travel survey (modes, distances, and weekly campus attendance).
          </div>
        </div>
      </section>
    </div>
  );
};
