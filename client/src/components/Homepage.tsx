import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  Zap, 
  Flame, 
  Car, 
  CheckCircle2, 
  HelpCircle, 
  FileSpreadsheet, 
  Layers, 
  ShieldCheck, 
  BarChart3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { CampusIllustration } from './CampusIllustration';
import { Language } from '../../../shared/i18n';

interface HomepageProps {
  onStartAssessment: () => void;
  onExploreDemo: () => void;
  lang: Language;
}

export const Homepage: React.FC<HomepageProps> = ({
  onStartAssessment,
  onExploreDemo,
  lang
}) => {
  const [activeScopeDrawer, setActiveScopeDrawer] = useState<number | null>(null);

  const isBn = lang === 'bn';

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="pt-6 sm:pt-10 pb-4 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-50 border border-navy-200 text-xs font-semibold text-navy-800">
          <span className="w-2 h-2 rounded-full bg-cobalt"></span>
          {isBn ? 'উচ্চশিক্ষা প্রতিষ্ঠানের জন্য কার্বন পদচিহ্ন বিশ্লেষণ' : 'Institutional Carbon Analytics for Higher Education'}
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

        <p className="text-lg sm:text-xl text-navy-600 max-w-3xl mx-auto leading-relaxed">
          {isBn
            ? 'ক্যাম্পাস জ্বালানি, বিদ্যুৎ বিল ও যাতায়াতের হিসাবকে একটি সমন্বিত কার্বন ইনভেনটরি ও প্রাতিষ্ঠানিক কর্মপরিকল্পনায় রূপান্তর করুন।'
            : 'Turn campus energy, transport and activity records into a clear emissions inventory and practical action plan.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onStartAssessment}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-base shadow-sm hover:shadow transition flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{isBn ? 'নতুন মূল্যায়ন শুরু করুন' : 'Start an assessment'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          
          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 font-bold text-base transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>{isBn ? 'ইউল্যাব ২০২২ ডেমো দেখুন' : 'Explore ULAB 2022 demo'}</span>
          </button>
        </div>
      </section>

      {/* 2. Interactive Campus Anatomy Illustration */}
      <section className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-navy-100 pb-3">
          <div>
            <h2 className="text-2xl font-bold text-navy-800">
              {isBn ? 'ক্যাম্পাস নির্গমন কাঠামো' : 'Campus Emission Anatomy'}
            </h2>
            <p className="text-sm text-navy-600">
              {isBn 
                ? 'ক্যাম্পাসের প্রতিটি কার্যকলাপ কীভাবে বিভিন্ন স্কোপের সাথে সম্পর্কিত তা জানতে যেকোনো উৎসে ক্লিক করুন।'
                : 'Select any source on campus to see how university activities map to international accounting scopes.'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500"></span>Scope 1</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-cobalt"></span>Scope 2</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-600"></span>Scope 3</span>
          </div>
        </div>

        <CampusIllustration lang={lang} />
      </section>

      {/* 3. Three Scope Explainer Tiles */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-800">
            {isBn ? 'নির্গমন স্কোপসমূহ জানুন' : 'Understanding the Three Scopes'}
          </h2>
          <p className="text-sm text-navy-600">
            {isBn 
              ? 'আন্তর্জাতিক গ্রিনহাউস গ্যাস প্রোটোকল অনুযায়ী ক্যাম্পাসের সমস্ত নির্গমন তিনটি স্তরে বিভক্ত।'
              : 'Institutional greenhouse gas inventories are divided into three operational boundaries.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scope 1 Tile */}
          <div className="bg-white rounded-2xl border border-navy-100 p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Scope 1
                </span>
                <Flame className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-800">
                {isBn ? 'বিশ্ববিদ্যালয় পরিচালিত নিজস্ব উৎস' : 'Emissions from sources operated by your university'}
              </h3>
              <p className="text-sm text-navy-600 leading-relaxed">
                {isBn 
                  ? 'ক্যাম্পাসের নিজস্ব জেনারেটরের ডিজেল, প্রাতিষ্ঠানিক পরিবহন বহরের জ্বালানি এবং এসি চিলারের রেফ্রিজারেন্ট লিকেজ।'
                  : 'Fuel burned by university-controlled generators and transport vehicles, plus applicable air conditioning refrigerant leakage.'}
              </p>
            </div>

            <div className="pt-3 border-t border-navy-50">
              <button
                onClick={() => setActiveScopeDrawer(activeScopeDrawer === 1 ? null : 1)}
                className="w-full flex items-center justify-between text-xs font-bold text-navy-700 hover:text-cobalt cursor-pointer"
              >
                <span>{isBn ? 'কোন তথ্য প্রয়োজন?' : 'What data do I need?'}</span>
                {activeScopeDrawer === 1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeScopeDrawer === 1 && (
                <div className="mt-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-fadeIn">
                  <div className="font-semibold">{isBn ? 'প্রয়োজনীয় নথি:' : 'Required records:'}</div>
                  <ul className="list-disc pl-4 space-y-1 text-navy-700">
                    <li>{isBn ? 'জেনারেটর ডিজেল ক্রয়ের চালান বা লগবই (লিটার)' : 'Annual generator diesel purchase receipts or fuel log (litres)'}</li>
                    <li>{isBn ? 'বিশ্ববিদ্যালয়ের নিজস্ব গাড়ির অকটেন ও ডিজেল বিল' : 'Fleet vehicle fuel billing statements (diesel & octane litres)'}</li>
                    <li>{isBn ? 'এসি রক্ষণাবেক্ষণ ও গ্যাস টপ-আপ ইনভয়েস (কেজি)' : 'HVAC maintenance service logbooks and refrigerant top-up invoices (kg)'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Scope 2 Tile */}
          <div className="bg-white rounded-2xl border border-navy-100 p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-cobalt-300 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  Scope 2
                </span>
                <Zap className="w-5 h-5 text-cobalt" />
              </div>
              <h3 className="text-lg font-bold text-navy-800">
                {isBn ? 'আমদানিকৃত বিদ্যুৎ থেকে নির্গমন' : 'Emissions from purchased electricity'}
              </h3>
              <p className="text-sm text-navy-600 leading-relaxed">
                {isBn 
                  ? 'ক্যাম্পাস ভবন, ল্যাবরেটরি ও সুযোগ-সুবিধায় ব্যবহৃত জাতীয় গ্রিডের বিদ্যুৎ উৎপাদনের ফলে বিদ্যুৎ কেন্দ্রে সৃষ্ট নির্গমন।'
                  : 'Electricity consumed by academic buildings, labs, and facilities, generated off-campus by the national electrical grid.'}
              </p>
            </div>

            <div className="pt-3 border-t border-navy-50">
              <button
                onClick={() => setActiveScopeDrawer(activeScopeDrawer === 2 ? null : 2)}
                className="w-full flex items-center justify-between text-xs font-bold text-navy-700 hover:text-cobalt cursor-pointer"
              >
                <span>{isBn ? 'কোন তথ্য প্রয়োজন?' : 'What data do I need?'}</span>
                {activeScopeDrawer === 2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeScopeDrawer === 2 && (
                <div className="mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-1.5 animate-fadeIn">
                  <div className="font-semibold">{isBn ? 'প্রয়োজনীয় নথি:' : 'Required records:'}</div>
                  <ul className="list-disc pl-4 space-y-1 text-navy-700">
                    <li>{isBn ? '১২ মাসের বিদ্যুৎ বিল (ডেসকো/ডিপিডিসি/আরইবি/বিপিডিবি)' : '12 consecutive monthly utility bills (DESCO/DPDC/BREB/BPDB)'}</li>
                    <li>{isBn ? 'মোট আমদানিকৃত কিলোওয়াট-ঘণ্টা (kWh) ও অনুমোদিত লোড (kW)' : 'Total billed energy consumption (kWh) and sanctioned load (kW)'}</li>
                    <li>{isBn ? 'ক্যাম্পাসের মোট অভ্যন্তরীণ ফ্লোর এরিয়া (বর্গমিটার)' : 'Gross building floor area (m²) across campus facilities'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Scope 3 Tile */}
          <div className="bg-white rounded-2xl border border-navy-100 p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                  Scope 3
                </span>
                <Car className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-800">
                {isBn ? 'কার্যক্রম সংশ্লিষ্ট অন্যান্য নির্গমন' : 'Other emissions linked to university activities'}
              </h3>
              <p className="text-sm text-navy-600 leading-relaxed">
                {isBn 
                  ? 'শিক্ষার্থী, শিক্ষক ও কর্মকর্তাদের দৈনিক যাতায়াত এবং বিদ্যুৎ সঞ্চালন ও বিতরণ (T&D) ক্ষয়ক্ষতি।'
                  : 'Daily commuting by students, faculty, and staff, along with upstream grid transmission and distribution losses.'}
              </p>
            </div>

            <div className="pt-3 border-t border-navy-50">
              <button
                onClick={() => setActiveScopeDrawer(activeScopeDrawer === 3 ? null : 3)}
                className="w-full flex items-center justify-between text-xs font-bold text-navy-700 hover:text-cobalt cursor-pointer"
              >
                <span>{isBn ? 'কোন তথ্য প্রয়োজন?' : 'What data do I need?'}</span>
                {activeScopeDrawer === 3 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeScopeDrawer === 3 && (
                <div className="mt-3 p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1.5 animate-fadeIn">
                  <div className="font-semibold">{isBn ? 'প্রয়োজনীয় নথি:' : 'Required records:'}</div>
                  <ul className="list-disc pl-4 space-y-1 text-navy-700">
                    <li>{isBn ? 'যাতায়াত জরিপ (বাহন, একমুখী দূরত্ব, সাপ্তাহিক কার্যদিবস)' : 'Commuter survey: primary mode, one-way distance (km), days on campus'}</li>
                    <li>{isBn ? 'শিক্ষার্থী, শিক্ষক ও কর্মকর্তা-কর্মচারীর মোট সংখ্যা' : 'Official student, faculty, and administrative staff headcounts'}</li>
                    <li>{isBn ? 'বার্ষিক শিক্ষাবর্ষ কার্যদিবস (যেমন ULAB-এ ২৯৪ দিন)' : 'Annual operating days on campus (e.g. 294 days)'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-navy-50/80 rounded-xl p-4 border border-navy-100 flex items-center gap-3 text-xs text-navy-700">
          <Info className="w-4 h-4 text-cobalt shrink-0" />
          <span>
            <strong>{isBn ? 'স্বচ্ছ রিপোর্টিং পরিধি:' : 'Scope boundary note:'}</strong>{' '}
            {isBn 
              ? 'এই প্ল্যাটফর্মের মূল ইনভেনটরিতে যাতায়াত ও গ্রিড ট্রান্সমিশন লসকে স্কোপ ৩-এ অন্তর্ভুক্ত করা হয়েছে। প্রতিটি প্রতিষ্ঠানের ব্যবহৃত তথ্য পরিধি ফলাফলে স্পষ্টভাবে প্রকাশ করা হয়।'
              : 'This baseline inventory explicitly covers commuting and upstream grid transmission losses in Scope 3. Actual data coverage is transparently declared for every institution.'}
          </span>
        </div>
      </section>

      {/* 4. Compact Preview of the ULAB Demo */}
      <section className="max-w-6xl mx-auto bg-white rounded-3xl border border-navy-200 p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-800 text-xs font-semibold">
              <span>{isBn ? 'রেফারেন্স বেঞ্চমার্ক' : 'Reference Benchmark'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-800 mt-1">
              {isBn ? 'ইউল্যাব ২০২২ গবেষণার ফলাফল একনজরে' : 'ULAB 2022 Study Results Preview'}
            </h2>
            <p className="text-xs text-navy-500">
              {isBn 
                ? 'প্রকাশিত গবেষণার প্রকৃত উপাত্ত থেকে প্রাপ্ত ঐতিহাসিক ফলাফল। এটি আপনার নিজস্ব ফলাফল নয়।'
                : 'Real data from the published 2022 university study. This illustrates what your institution’s report will look like.'}
            </p>
          </div>

          <button
            onClick={onExploreDemo}
            className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>{isBn ? 'সম্পূর্ণ ইউল্যাব ডেমো খুলুন' : 'Explore full ULAB demo'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-ivory border border-navy-100 space-y-1">
            <span className="text-xs text-navy-500">{isBn ? 'মোট নির্গমন (ঐতিহাসিক)' : 'Total emissions (historical)'}</span>
            <div className="text-2xl font-extrabold text-navy-800 tabular-nums">2,498.79 <span className="text-xs font-normal text-navy-500">tCO₂e</span></div>
            <div className="text-[11px] text-navy-500">{isBn ? '৫,৩৫০ জন ক্যাম্পাস শিক্ষার্থী ও কর্মী' : '5,350 total population'}</div>
          </div>

          <div className="p-4 rounded-xl bg-ivory border border-navy-100 space-y-1">
            <span className="text-xs text-navy-500">{isBn ? 'মাথাপিছু কার্বন পদচিহ্ন' : 'Per-capita footprint'}</span>
            <div className="text-2xl font-extrabold text-cobalt tabular-nums">0.4671 <span className="text-xs font-normal text-navy-500">tCO₂e/person</span></div>
            <div className="text-[11px] text-navy-500">{isBn ? 'শিক্ষার্থী প্রতি ০.৫১৪১ t' : '0.5141 t per student'}</div>
          </div>

          <div className="p-4 rounded-xl bg-ivory border border-navy-100 space-y-1">
            <span className="text-xs text-navy-500">{isBn ? 'সর্ববৃহৎ নির্গমন উৎস' : 'Largest emission source'}</span>
            <div className="text-2xl font-extrabold text-purple-700">62.7%</div>
            <div className="text-[11px] text-navy-500">{isBn ? 'যাতায়াত (স্কোপ ৩): ১,৫৬৬.৮ টন' : 'Commuting (Scope 3): 1,566.8 t'}</div>
          </div>

          <div className="p-4 rounded-xl bg-ivory border border-navy-100 space-y-1">
            <span className="text-xs text-navy-500">{isBn ? 'গ্রিড বিদ্যুৎ' : 'Purchased electricity'}</span>
            <div className="text-2xl font-extrabold text-blue-700 tabular-nums">171.32 <span className="text-xs font-normal text-navy-500">tCO₂e</span></div>
            <div className="text-[11px] text-navy-500">{isBn ? 'স্কোপ ২ (৬.৯% মোট নির্গমন)' : 'Scope 2 (6.9% of total)'}</div>
          </div>
        </div>

        {/* Compact composition progress bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-semibold text-navy-700">
            <span>{isBn ? 'ইউল্যাব ২০২২ স্কোপ বিভাজন:' : 'ULAB 2022 Scope Distribution:'}</span>
            <span className="tabular-nums">Scope 1: 30.4% • Scope 2: 6.9% • Scope 3: 62.7%</span>
          </div>
          <div className="h-4 w-full rounded-lg overflow-hidden flex bg-navy-100">
            <div style={{ width: '30.4%' }} className="bg-amber-500" title="Scope 1: 760.66 t (30.4%)"></div>
            <div style={{ width: '6.9%' }} className="bg-cobalt" title="Scope 2: 171.32 t (6.9%)"></div>
            <div style={{ width: '62.7%' }} className="bg-purple-600" title="Scope 3: 1,566.81 t (62.7%)"></div>
          </div>
        </div>
      </section>

      {/* 5. Three-Step Workflow Section */}
      <section className="max-w-5xl mx-auto space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-800">
            {isBn ? 'তিন ধাপে কার্বন পদচিহ্ন নির্ধারণ' : 'Three Simple Steps to Get Started'}
          </h2>
          <p className="text-sm text-navy-600">
            {isBn 
              ? 'আপনার প্রতিষ্ঠানের জন্য সরাসরি উপাত্ত ইনপুট ও বিশ্লেষণ পরিচালনা করুন।'
              : 'How any university or college can measure, verify, and reduce emissions.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-navy-50 text-cobalt flex items-center justify-center font-extrabold text-lg border border-navy-200">
              1
            </div>
            <h3 className="font-bold text-base text-navy-800">
              {isBn ? 'ক্যাম্পাস রূপরেখা তৈরি' : 'Set up your campus'}
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              {isBn 
                ? 'প্রতিষ্ঠান পরিচিতি, মোট জনসংখ্যা (শিক্ষার্থী, শিক্ষক, কর্মী), কার্যদিবস এবং ক্যাম্পাসের ভৌগোলিক অবস্থান নির্ধারণ করুন।'
                : 'Define your institution details, headcounts (students, faculty, staff), operating days, and campus building floor area.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-navy-50 text-cobalt flex items-center justify-center font-extrabold text-lg border border-navy-200">
              2
            </div>
            <h3 className="font-bold text-base text-navy-800">
              {isBn ? 'তথ্য সংগ্রহ ও আপলোড' : 'Add your data'}
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              {isBn 
                ? 'বিদ্যুৎ বিল, জেনারেটর জ্বালানি, এসি সার্ভিস লগ এবং যাতায়াত জরিপের তথ্য স্প্রেডশিট টেমপ্লেট বা ফর্মের মাধ্যমে দিন।'
                : 'Enter your utility electricity bills, fuel receipts, HVAC records, and commuter survey responses via templates or guided forms.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-navy-50 text-cobalt flex items-center justify-center font-extrabold text-lg border border-navy-200">
              3
            </div>
            <h3 className="font-bold text-base text-navy-800">
              {isBn ? 'ফলাফল ও কর্মপরিকল্পনা' : 'Explore results and plan action'}
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              {isBn 
                ? 'হিসাবকৃত অডিট ট্রেস, নির্গমন মানচিত্র দেখুন এবং সৌরবিদ্যুৎ, বৈদ্যুতিক বাস ও শক্তির দক্ষতা বৃদ্ধির দৃশ্যপট মডেল করুন।'
                : 'Inspect detailed calculation traces, explore commuter maps, and simulate solar PV, electric transit, and efficiency interventions.'}
            </p>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={onStartAssessment}
            className="px-8 py-3.5 rounded-xl bg-cobalt hover:bg-cobalt-700 text-white font-bold text-base shadow-sm hover:shadow transition inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{isBn ? 'এখনই মূল্যায়ন শুরু করুন' : 'Start an assessment for your university'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
