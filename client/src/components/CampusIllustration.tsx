import React, { useState } from 'react';
import { 
  Zap, 
  Flame, 
  Bus, 
  Wind, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Fuel,
  Building
} from 'lucide-react';
import { Language } from '../../../shared/i18n';

interface SourceDetail {
  id: string;
  name: string;
  nameBn: string;
  scope: 1 | 2 | 3;
  scopeLabel: string;
  scopeLabelBn: string;
  category: string;
  whyClassified: string;
  whyClassifiedBn: string;
  dataNeeded: string;
  dataNeededBn: string;
  color: string;
  badgeBg: string;
  icon: React.ElementType;
  coords: { x: number; y: number }; // Percentage position on the illustration
}

const CAMPUS_SOURCES: SourceDetail[] = [
  {
    id: 'generator',
    name: 'Backup Diesel Generator',
    nameBn: 'জরুরি ডিজেল জেনারেটর',
    scope: 1,
    scopeLabel: 'Scope 1 — Operated combustion',
    scopeLabelBn: 'স্কোপ ১ — নিজস্ব জ্বালানি দহন',
    category: 'Stationary Combustion',
    whyClassified: 'University-owned fuel equipment burning diesel on campus during power outages.',
    whyClassifiedBn: 'ক্যাম্পাসে বিদ্যুৎ বিভ্রাটের সময় বিশ্ববিদ্যালয় নিয়ন্ত্রিত জেনারেটরে ব্যবহৃত ডিজেল।',
    dataNeeded: 'Annual diesel purchase invoices or logbook litres consumed (e.g. 9,113 L at ULAB).',
    dataNeededBn: 'বার্ষিক ডিজেল ক্রয়ের রসিদ বা লগবইয়ের লিটার হিসাব।',
    color: '#D97706',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Flame,
    coords: { x: 18, y: 68 }
  },
  {
    id: 'chillers',
    name: 'Air Conditioning Units & Chillers',
    nameBn: 'শীতাতপ নিয়ন্ত্রণ ব্যবস্থা ও চিলার',
    scope: 1,
    scopeLabel: 'Scope 1 — Direct fugitive gases',
    scopeLabelBn: 'স্কোপ ১ — প্রত্যক্ষ গ্যাস লিকেজ',
    category: 'Fugitive Refrigerant Top-Ups',
    whyClassified: 'Fugitive greenhouse gas top-ups (R-410A) during maintenance. Note: Montreal Protocol ODS (R-22) is disclosed in a separate informational memo.',
    whyClassifiedBn: 'রক্ষণাবেক্ষণের সময় রেফ্রিজারেন্ট গ্যাস টপ-আপ (R-410A)। মন্ট্রিল প্রোটোকল গ্যাস আলাদা মেমো হিসেবে প্রকাশিত হয়।',
    dataNeeded: 'HVAC service logbooks and refrigerant replenishment invoices in kilograms.',
    dataNeededBn: 'বার্ষিক এসি সার্ভিসিং ও গ্যাস রিফিল ভাউচার (কিলোগ্রাম)।',
    color: '#D97706',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Wind,
    coords: { x: 48, y: 22 }
  },
  {
    id: 'shuttle',
    name: 'University-Owned Fleet & Vans',
    nameBn: 'বিশ্ববিদ্যালয় নিজস্ব পরিবহন বহর',
    scope: 1,
    scopeLabel: 'Scope 1 — Mobile combustion',
    scopeLabelBn: 'স্কোপ ১ — নিজস্ব যানবাহন',
    category: 'University Transport Fleet',
    whyClassified: 'Vehicles owned or operationally leased by the university using octane and diesel fuel.',
    whyClassifiedBn: 'বিশ্ববিদ্যালয় পরিচালিত নিজস্ব বাস, মাইক্রোবাস ও গাড়ির ব্যবহৃত অকটেন ও ডিজেল।',
    dataNeeded: 'Fleet fuel dispensing receipts or monthly octane/diesel fuel account statements.',
    dataNeededBn: 'যানবাহন জ্বালানি খরচের মাসিক হিসাব বা ফিলিং স্টেশন ভাউচার।',
    color: '#D97706',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Bus,
    coords: { x: 26, y: 82 }
  },
  {
    id: 'grid',
    name: 'Main Substation & Grid Electricity',
    nameBn: 'প্রধান বৈদ্যুতিক সাবস্টেশন ও গ্রিড বিদ্যুৎ',
    scope: 2,
    scopeLabel: 'Scope 2 — Purchased electricity',
    scopeLabelBn: 'স্কোপ ২ — আমদানিকৃত গ্রিড বিদ্যুৎ',
    category: 'Grid Purchased Electricity',
    whyClassified: 'Emissions produced at national power stations to generate electricity consumed on campus.',
    whyClassifiedBn: 'জাতীয় গ্রিডের বিদ্যুৎ উৎপাদন থেকে ক্যাম্পাসে ব্যবহৃত বিদ্যুৎ (ডেসকো/ডিপিডিসি)।',
    dataNeeded: 'Monthly utility electricity bills showing total imported kilowatt-hours (kWh).',
    dataNeededBn: '১২ মাসের বিদ্যুৎ বিল থেকে মোট আমদানিকৃত কিলোওয়াট-ঘণ্টা (kWh)।',
    color: '#2457D6',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: Zap,
    coords: { x: 80, y: 52 }
  },
  {
    id: 'commuting',
    name: 'Daily Student & Faculty Commuting',
    nameBn: 'দৈনিক যাতায়াত (শিক্ষার্থী ও শিক্ষক)',
    scope: 3,
    scopeLabel: 'Scope 3 — Value-chain travel',
    scopeLabelBn: 'স্কোপ ৩ — অনুষঙ্গ দৈনিক যাতায়াত',
    category: 'Commuter Travel',
    whyClassified: 'Travel between homes and campus via public buses, rickshaws, CNGs, and personal vehicles.',
    whyClassifiedBn: 'শিক্ষার্থী ও কর্মীদের বাসা থেকে ক্যাম্পাসে যাতায়াতের গণপরিবহন, রিকশা ও ব্যক্তিগত বাহন।',
    dataNeeded: 'Representative commuter survey with mode choice, one-way distance, and weekly trips.',
    dataNeededBn: 'নমুনা যাতায়াত জরিপ (বাহন, একমুখী দূরত্ব ও সাপ্তাহিক কার্যদিবস)।',
    color: '#7C3AED',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    icon: Users,
    coords: { x: 55, y: 82 }
  }
];

interface CampusIllustrationProps {
  lang: Language;
  onSelectScope?: (scope: 1 | 2 | 3) => void;
  onExploreDemo?: () => void;
}

export const CampusIllustration: React.FC<CampusIllustrationProps> = ({
  lang,
  onSelectScope,
  onExploreDemo
}) => {
  const [selectedSource, setSelectedSource] = useState<SourceDetail>(CAMPUS_SOURCES[3]); // Default to Grid (Scope 2)

  const isBn = lang === 'bn';

  return (
    <div className="bg-white rounded-3xl border border-navy-100 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-navy-100 gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase text-cobalt-600">
            {isBn ? 'ইন্টারেক্টিভ ক্যাম্পাস চিত্র' : 'Interactive Campus Anatomy'}
          </span>
          <h3 className="text-xl md:text-2xl font-extrabold text-navy-800">
            {isBn ? 'ক্যাম্পাসের কোন কার্যক্রম কোন স্কোপে পড়ে?' : 'Where Do Campus Emissions Come From?'}
          </h3>
          <p className="text-sm text-navy-600 mt-1">
            {isBn 
              ? 'নিচের ছবিতে যেকোনো উৎসে ক্লিক করে জেনে নিন তার স্কোপ ও প্রয়োজনীয় তথ্যাদি।'
              : 'Select any source on the campus diagram below to inspect its scope, classification rationale, and required data.'}
          </p>
        </div>

        {/* Quick Scope Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-navy-500 mr-1">{isBn ? 'স্কোপ ফিল্টার:' : 'Filter:'}</span>
          <button
            onClick={() => setSelectedSource(CAMPUS_SOURCES[0])}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              selectedSource.scope === 1 
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs' 
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Scope 1
          </button>
          <button
            onClick={() => setSelectedSource(CAMPUS_SOURCES[3])}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              selectedSource.scope === 2 
                ? 'bg-cobalt-600 text-white border-cobalt-700 shadow-xs' 
                : 'bg-cobalt-50 text-cobalt-900 border-cobalt-200 hover:bg-cobalt-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cobalt-400"></span>
            Scope 2
          </button>
          <button
            onClick={() => setSelectedSource(CAMPUS_SOURCES[4])}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              selectedSource.scope === 3 
                ? 'bg-purple-600 text-white border-purple-700 shadow-xs' 
                : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Scope 3
          </button>
        </div>
      </div>

      {/* Main Illustration + Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
        {/* SVG Vector Canvas (7 Columns on desktop) */}
        <div className="lg:col-span-7 relative bg-navy-50/70 rounded-2xl p-4 border border-navy-100 overflow-hidden select-none">
          <svg 
            viewBox="0 0 800 500" 
            className="w-full h-auto drop-shadow-xs" 
            role="img" 
            aria-label="Campus architectural diagram illustrating emissions sources"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E2EBF5" />
                <stop offset="100%" stopColor="#FAF7F2" />
              </linearGradient>
              <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#EDF2F7" />
              </linearGradient>
              <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#244B78" />
                <stop offset="100%" stopColor="#14243A" />
              </linearGradient>
            </defs>

            {/* Background Sky & Ground */}
            <rect x="0" y="0" width="800" height="500" fill="url(#skyGrad)" rx="16" />
            <path d="M 0 380 Q 250 360 500 375 T 800 380 L 800 500 L 0 500 Z" fill="#E4DEC8" />
            <path d="M 0 410 L 800 410 L 800 500 L 0 500 Z" fill="#D3CBB3" />

            {/* Roads & Pathways */}
            <path d="M 0 440 L 800 440" stroke="#FAF8F5" strokeWidth="3" strokeDasharray="16 16" />

            {/* Distant Trees & Greenery */}
            <circle cx="90" cy="360" r="30" fill="#ADC2A9" />
            <circle cx="130" cy="355" r="25" fill="#8CA887" />
            <circle cx="710" cy="360" r="35" fill="#ADC2A9" />
            <circle cx="750" cy="355" r="28" fill="#8CA887" />

            {/* Main Campus Academic Building */}
            <rect x="250" y="140" width="300" height="240" fill="url(#buildingGrad)" stroke="#14243A" strokeWidth="2.5" rx="4" />
            <rect x="230" y="125" width="340" height="20" fill="url(#roofGrad)" rx="3" />

            {/* Windows Grid */}
            {[0, 1, 2, 3, 4].map(row => (
              <g key={row}>
                {[0, 1, 2, 3, 4, 5].map(col => (
                  <rect 
                    key={col} 
                    x={280 + col * 42} 
                    y={170 + row * 40} 
                    width="26" 
                    height="24" 
                    fill="#D9E6F5" 
                    stroke="#14243A" 
                    strokeWidth="1.5" 
                    rx="2"
                  />
                ))}
              </g>
            ))}

            {/* Main Entrance */}
            <rect x="370" y="320" width="60" height="60" fill="#14243A" rx="4" />
            <rect x="375" y="325" width="22" height="55" fill="#93B7FB" />
            <rect x="403" y="325" width="22" height="55" fill="#93B7FB" />
            <polygon points="340,320 460,320 400,290" fill="#D65A3A" />

            {/* Rooftop AC Outdoor Units (Chillers) */}
            <g id="svg-chillers" className="cursor-pointer" onClick={() => setSelectedSource(CAMPUS_SOURCES[1])}>
              <rect x="340" y="90" width="45" height="32" fill="#FFFFFF" stroke="#14243A" strokeWidth="2" rx="3" />
              <circle cx="362" cy="106" r="10" fill="#C2D2E1" stroke="#14243A" strokeWidth="1" />
              <line x1="362" y1="96" x2="362" y2="116" stroke="#14243A" strokeWidth="1.5" />
              <line x1="352" y1="106" x2="372" y2="106" stroke="#14243A" strokeWidth="1.5" />

              <rect x="415" y="90" width="45" height="32" fill="#FFFFFF" stroke="#14243A" strokeWidth="2" rx="3" />
              <circle cx="437" cy="106" r="10" fill="#C2D2E1" stroke="#14243A" strokeWidth="1" />
              <line x1="437" y1="96" x2="437" y2="116" stroke="#14243A" strokeWidth="1.5" />
              <line x1="427" y1="106" x2="447" y2="106" stroke="#14243A" strokeWidth="1.5" />
            </g>

            {/* Backup Diesel Generator Shed */}
            <g id="svg-generator" className="cursor-pointer" onClick={() => setSelectedSource(CAMPUS_SOURCES[0])}>
              <rect x="110" y="315" width="75" height="55" fill="#475569" stroke="#14243A" strokeWidth="2" rx="4" />
              <rect x="120" y="330" width="30" height="25" fill="#334155" rx="2" />
              <line x1="125" y1="335" x2="145" y2="335" stroke="#94A3B8" strokeWidth="2" />
              <line x1="125" y1="342" x2="145" y2="342" stroke="#94A3B8" strokeWidth="2" />
              <line x1="125" y1="349" x2="145" y2="349" stroke="#94A3B8" strokeWidth="2" />
              <rect x="165" y="295" width="10" height="20" fill="#1E293B" />
              {/* Exhaust Smoke Hint */}
              <circle cx="170" cy="285" r="4" fill="#94A3B8" opacity="0.6" />
              <circle cx="172" cy="275" r="7" fill="#94A3B8" opacity="0.4" />
            </g>

            {/* Electrical Substation & Grid Lines */}
            <g id="svg-grid" className="cursor-pointer" onClick={() => setSelectedSource(CAMPUS_SOURCES[3])}>
              <line x1="620" y1="180" x2="620" y2="370" stroke="#14243A" strokeWidth="4" />
              <line x1="590" y1="210" x2="650" y2="210" stroke="#14243A" strokeWidth="3" />
              <line x1="595" y1="230" x2="645" y2="230" stroke="#14243A" strokeWidth="2.5" />
              {/* Transformers & Grid connection wire */}
              <rect x="635" y="325" width="60" height="45" fill="#2563EB" stroke="#14243A" strokeWidth="2" rx="4" />
              <path d="M 620 210 Q 580 230 550 260" stroke="#2563EB" strokeWidth="2" fill="none" strokeDasharray="4 3" />
              <path d="M 645 210 Q 720 220 800 230" stroke="#14243A" strokeWidth="2" fill="none" />
            </g>

            {/* University Campus Shuttle Bus */}
            <g id="svg-shuttle" className="cursor-pointer" onClick={() => setSelectedSource(CAMPUS_SOURCES[2])}>
              <rect x="150" y="390" width="120" height="42" fill="#D97706" stroke="#14243A" strokeWidth="2" rx="6" />
              <rect x="156" y="396" width="22" height="18" fill="#FFFFFF" rx="2" />
              <rect x="184" y="396" width="22" height="18" fill="#FFFFFF" rx="2" />
              <rect x="212" y="396" width="22" height="18" fill="#FFFFFF" rx="2" />
              <rect x="240" y="396" width="22" height="18" fill="#FFFFFF" rx="2" />
              <circle cx="175" cy="432" r="10" fill="#14243A" />
              <circle cx="175" cy="432" r="4" fill="#C2D2E1" />
              <circle cx="245" cy="432" r="10" fill="#14243A" />
              <circle cx="245" cy="432" r="4" fill="#C2D2E1" />
            </g>

            {/* Commuting: City Bus, Rickshaw, Pedestrians */}
            <g id="svg-commuters" className="cursor-pointer" onClick={() => setSelectedSource(CAMPUS_SOURCES[4])}>
              {/* City transit bus */}
              <rect x="420" y="415" width="130" height="40" fill="#7C3AED" stroke="#14243A" strokeWidth="2" rx="5" />
              <rect x="428" y="420" width="20" height="16" fill="#EDE9FE" rx="2" />
              <rect x="454" y="420" width="20" height="16" fill="#EDE9FE" rx="2" />
              <rect x="480" y="420" width="20" height="16" fill="#EDE9FE" rx="2" />
              <rect x="506" y="420" width="20" height="16" fill="#EDE9FE" rx="2" />
              <circle cx="445" cy="455" r="9" fill="#14243A" />
              <circle cx="525" cy="455" r="9" fill="#14243A" />

              {/* Cycle Rickshaw */}
              <circle cx="610" cy="445" r="11" fill="none" stroke="#14243A" strokeWidth="2" />
              <circle cx="636" cy="445" r="11" fill="none" stroke="#14243A" strokeWidth="2" />
              <path d="M 610 445 L 620 430 L 636 445" stroke="#14243A" strokeWidth="2" />
              <path d="M 618 425 Q 605 410 610 435" fill="#D65A3A" />

              {/* Walking commuters */}
              <circle cx="340" cy="385" r="5" fill="#14243A" />
              <line x1="340" y1="390" x2="340" y2="405" stroke="#14243A" strokeWidth="2.5" />
              <line x1="340" y1="405" x2="335" y2="418" stroke="#14243A" strokeWidth="2" />
              <line x1="340" y1="405" x2="345" y2="418" stroke="#14243A" strokeWidth="2" />

              <circle cx="355" cy="387" r="5" fill="#14243A" />
              <line x1="355" y1="392" x2="355" y2="406" stroke="#14243A" strokeWidth="2.5" />
              <line x1="355" y1="406" x2="352" y2="418" stroke="#14243A" strokeWidth="2" />
              <line x1="355" y1="406" x2="360" y2="418" stroke="#14243A" strokeWidth="2" />
            </g>
          </svg>

          {/* Interactive Floating Hotspot Buttons */}
          {CAMPUS_SOURCES.map(source => {
            const isSelected = selectedSource.id === source.id;
            return (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source)}
                style={{ left: `${source.coords.x}%`, top: `${source.coords.y}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 focus:outline-hidden`}
                title={isBn ? source.nameBn : source.name}
                aria-label={`View ${source.name}`}
              >
                <span className="relative flex h-8 w-8 items-center justify-center">
                  {isSelected && (
                    <span 
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: source.color }}
                    ></span>
                  )}
                  <span 
                    className={`relative inline-flex rounded-full h-7 w-7 items-center justify-center border-2 border-white text-white font-bold text-xs shadow-md transition-transform group-hover:scale-110 ${
                      isSelected ? 'scale-115 ring-2 ring-navy-800' : ''
                    }`}
                    style={{ backgroundColor: source.color }}
                  >
                    {source.scope}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Source Explanation Drawer (5 Columns on desktop) */}
        <div className="lg:col-span-5 bg-navy-50/50 p-6 rounded-2xl border border-navy-100 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Scope Badge & Header */}
            <div className="flex items-center justify-between">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-2xs"
                style={{ 
                  backgroundColor: `${selectedSource.color}15`, 
                  borderColor: `${selectedSource.color}50`, 
                  color: selectedSource.color 
                }}
              >
                <selectedSource.icon className="w-3.5 h-3.5" />
                {isBn ? selectedSource.scopeLabelBn : selectedSource.scopeLabel}
              </span>
              <span className="text-xs text-navy-400 font-medium">
                {selectedSource.category}
              </span>
            </div>

            <h4 className="text-xl font-bold text-navy-900 leading-snug">
              {isBn ? selectedSource.nameBn : selectedSource.name}
            </h4>

            {/* Why Classified */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-navy-700 uppercase tracking-wider block">
                {isBn ? 'শ্রেণিবিভাগের কারণ' : 'Why this scope?'}
              </span>
              <p className="text-sm text-navy-600 leading-relaxed">
                {isBn ? selectedSource.whyClassifiedBn : selectedSource.whyClassified}
              </p>
            </div>

            {/* Data Needed */}
            <div className="p-3.5 rounded-xl bg-white border border-navy-100 space-y-1">
              <span className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cobalt-600" />
                {isBn ? 'আপনার যে তথ্য লাগবে:' : 'Data your institution needs:'}
              </span>
              <p className="text-xs text-navy-600 leading-relaxed">
                {isBn ? selectedSource.dataNeededBn : selectedSource.dataNeeded}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            {onSelectScope && (
              <button
                onClick={() => onSelectScope(selectedSource.scope)}
                className="flex-1 bg-cobalt-600 hover:bg-cobalt-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>{isBn ? 'তথ্য সংগ্রহ দেখুন' : 'View Data Collection'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onExploreDemo && (
              <button
                onClick={onExploreDemo}
                className="bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 font-bold py-2.5 px-3.5 rounded-xl text-xs transition"
                title="See this source in ULAB 2022 dataset"
              >
                {isBn ? 'নমুনা ডেটা' : 'Demo data'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
