import React, { useState } from 'react';
import { 
  Zap, 
  Flame, 
  Bus, 
  Wind, 
  Users, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';

interface SourceDetail {
  id: string;
  name: string;
  scope: 1 | 2 | 3;
  scopeLabel: string;
  category: string;
  whyClassified: string;
  dataNeeded: string;
  color: string;
  badgeBg: string;
  icon: React.ElementType;
  coords: { x: number; y: number };
}

const CAMPUS_SOURCES: SourceDetail[] = [
  {
    id: 'generator',
    name: 'Backup Diesel Generator',
    scope: 1,
    scopeLabel: 'Scope 1 — Direct Combustion',
    category: 'Stationary Combustion',
    whyClassified: 'University-owned fuel equipment burning diesel on campus during power outages.',
    dataNeeded: 'Annual diesel purchase invoices or logbook litres consumed (e.g. 9,113 L at ULAB).',
    color: '#D97706',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Flame,
    coords: { x: 18, y: 68 }
  },
  {
    id: 'chillers',
    name: 'Air Conditioning Units & Chillers',
    scope: 1,
    scopeLabel: 'Scope 1 — Fugitive Refrigerants',
    category: 'Fugitive Refrigerant Top-Ups',
    whyClassified: 'Fugitive greenhouse gas top-ups (R-410A) during maintenance. Note: Montreal Protocol ODS (R-22) is disclosed in a separate informational memo.',
    dataNeeded: 'HVAC service logbooks and refrigerant replenishment invoices in kilograms.',
    color: '#D97706',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Wind,
    coords: { x: 48, y: 22 }
  },
  {
    id: 'shuttle',
    name: 'University-Owned Fleet & Vans',
    scope: 1,
    scopeLabel: 'Scope 1 — Mobile Combustion',
    category: 'University Transport Fleet',
    whyClassified: 'Vehicles owned or operationally leased by the university using octane and diesel fuel.',
    dataNeeded: 'Fleet fuel dispensing receipts or monthly octane/diesel fuel account statements.',
    color: '#D97706',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Bus,
    coords: { x: 26, y: 82 }
  },
  {
    id: 'grid',
    name: 'Main Substation & Grid Electricity',
    scope: 2,
    scopeLabel: 'Scope 2 — Purchased Electricity',
    category: 'Grid Purchased Electricity',
    whyClassified: 'Emissions produced at national power stations to generate electricity consumed on campus.',
    dataNeeded: 'Monthly utility electricity bills showing total imported kilowatt-hours (kWh).',
    color: '#2457D6',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: Zap,
    coords: { x: 80, y: 52 }
  },
  {
    id: 'commuting',
    name: 'Daily Student & Faculty Commuting',
    scope: 3,
    scopeLabel: 'Scope 3 — Value-Chain Travel',
    category: 'Commuter Travel',
    whyClassified: 'Travel between homes and campus via public buses, rickshaws, CNGs, and personal vehicles.',
    dataNeeded: 'Representative commuter survey with mode choice, one-way distance, and weekly trips.',
    color: '#7C3AED',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    icon: Users,
    coords: { x: 55, y: 82 }
  }
];

interface CampusIllustrationProps {
  onSelectScope?: (scope: 1 | 2 | 3) => void;
  onExploreDemo?: () => void;
}

export const CampusIllustration: React.FC<CampusIllustrationProps> = ({
  onSelectScope,
  onExploreDemo
}) => {
  const [selectedSource, setSelectedSource] = useState<SourceDetail>(CAMPUS_SOURCES[3]); // Default to Grid (Scope 2)

  return (
    <div className="bg-white rounded-3xl border border-navy-100 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-navy-100 gap-4">
        <div>
          <span className="text-xs font-bold text-cobalt-600 uppercase tracking-wider block">
            Interactive System Diagram
          </span>
          <h3 className="text-xl font-bold text-navy-900">
            How Campus Infrastructure Maps to Emissions Scopes
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span>Scope 1: Direct Operations</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cobalt-600"></span>Scope 2: Purchased Electricity</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-600"></span>Scope 3: Commuting</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
        {/* SVG Graphic (7 Columns on desktop) */}
        <div className="lg:col-span-7 relative bg-navy-50/40 rounded-2xl p-4 border border-navy-100 overflow-hidden">
          <svg viewBox="0 0 600 360" className="w-full h-auto drop-shadow-2xs">
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EFF6FF" />
                <stop offset="100%" stopColor="#DBEAFE" />
              </linearGradient>
              <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F1F5F9" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>

            {/* Sky Background */}
            <rect x="0" y="0" width="600" height="270" fill="url(#skyGrad)" />
            {/* Ground / Campus Courtyard */}
            <rect x="0" y="270" width="600" height="90" fill="url(#groundGrad)" />

            {/* Distant City Skyline */}
            <path d="M 0 250 L 30 250 L 30 230 L 60 230 L 60 250 L 100 250 L 100 220 L 130 220 L 130 250 L 190 250 L 190 210 L 220 210 L 220 250 L 320 250 L 320 235 L 360 235 L 360 250 L 480 250 L 480 215 L 520 215 L 520 250 L 600 250 L 600 270 L 0 270 Z" fill="#CBD5E1" opacity="0.6" />

            {/* Scope 2 Substation & Transmission Lines */}
            <g id="substation-group">
              {/* Utility Pylon */}
              <line x1="530" y1="120" x2="530" y2="280" stroke="#64748B" strokeWidth="4" />
              <line x1="510" y1="150" x2="550" y2="150" stroke="#64748B" strokeWidth="3" />
              <line x1="515" y1="180" x2="545" y2="180" stroke="#64748B" strokeWidth="3" />
              {/* Power lines into campus */}
              <path d="M 530 150 Q 450 180 380 220" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="5,4" />
              <path d="M 530 180 Q 460 200 400 240" fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="5,4" />
              {/* Transformer box */}
              <rect x="460" y="250" width="45" height="40" rx="3" fill="#1E293B" />
              <rect x="475" y="240" width="15" height="10" fill="#94A3B8" />
              <text x="482" y="275" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">⚡</text>
            </g>

            {/* Main Academic Campus Building (Multi-Story) */}
            <g id="academic-building">
              <rect x="180" y="100" width="220" height="180" rx="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="3" />
              {/* Entrance canopy */}
              <rect x="250" y="245" width="80" height="35" fill="#0F172A" rx="2" />
              <text x="290" y="267" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">CAMPUS ENTRANCE</text>
              {/* Window grid */}
              {[125, 160, 195].map((y) => (
                <g key={y}>
                  <rect x="200" y={y} width="30" height="22" rx="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
                  <rect x="240" y={y} width="30" height="22" rx="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
                  <rect x="280" y={y} width="30" height="22" rx="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
                  <rect x="320" y={y} width="30" height="22" rx="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
                  <rect x="360" y={y} width="30" height="22" rx="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
                </g>
              ))}
              {/* Rooftop HVAC Chillers (Scope 1 Fugitives) */}
              <rect x="260" y="75" width="60" height="25" fill="#475569" rx="2" />
              <circle cx="280" cy="87" r="7" fill="#94A3B8" />
              <circle cx="300" cy="87" r="7" fill="#94A3B8" />
              {/* Heat/Cooling plume */}
              <path d="M 280 72 Q 275 60 282 50" fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="3,3" />
              <path d="M 300 72 Q 295 60 302 50" fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="3,3" />
            </g>

            {/* Scope 1: Backup Generator Enclosure */}
            <g id="generator-facility">
              <rect x="80" y="230" width="70" height="50" rx="3" fill="#334155" stroke="#1E293B" strokeWidth="2" />
              <rect x="90" y="245" width="20" height="20" fill="#1E293B" />
              <line x1="90" y1="250" x2="110" y2="250" stroke="#64748B" strokeWidth="2" />
              <line x1="90" y1="255" x2="110" y2="255" stroke="#64748B" strokeWidth="2" />
              <line x1="90" y1="260" x2="110" y2="260" stroke="#64748B" strokeWidth="2" />
              {/* Exhaust Stack */}
              <rect x="135" y="200" width="8" height="30" fill="#64748B" />
              {/* Plume */}
              <ellipse cx="139" cy="190" rx="8" ry="5" fill="#CBD5E1" opacity="0.8" />
              <ellipse cx="142" cy="180" rx="12" ry="7" fill="#CBD5E1" opacity="0.5" />
            </g>

            {/* Campus Roadway & Commuter Access (Scope 3 & Scope 1 fleet) */}
            <g id="transit-lane">
              <rect x="0" y="300" width="600" height="50" fill="#334155" />
              <line x1="0" y1="325" x2="600" y2="325" stroke="#FDE047" strokeWidth="3" strokeDasharray="20,15" />

              {/* Institutional Bus (Scope 1 Fleet) */}
              <rect x="120" y="290" width="65" height="28" rx="4" fill="#0D9488" stroke="#115E59" strokeWidth="2" />
              <circle cx="135" cy="318" r="6" fill="#0F172A" />
              <circle cx="170" cy="318" r="6" fill="#0F172A" />
              <rect x="130" y="295" width="12" height="10" rx="1" fill="#CCFBF1" />
              <rect x="146" y="295" width="12" height="10" rx="1" fill="#CCFBF1" />
              <rect x="162" y="295" width="12" height="10" rx="1" fill="#CCFBF1" />

              {/* Commuter Private Car (Scope 3) */}
              <rect x="310" y="302" width="45" height="18" rx="4" fill="#7C3AED" />
              <circle cx="320" cy="320" r="5" fill="#0F172A" />
              <circle cx="345" cy="320" r="5" fill="#0F172A" />
              <rect x="320" y="305" width="10" height="7" fill="#DDD6FE" />
              <rect x="333" y="305" width="10" height="7" fill="#DDD6FE" />

              {/* Commuter Rickshaw (Scope 3 Zero Operational) */}
              <g transform="translate(420, 298)">
                <circle cx="8" cy="18" r="6" fill="none" stroke="#0F172A" strokeWidth="1.5" />
                <circle cx="28" cy="18" r="6" fill="none" stroke="#0F172A" strokeWidth="1.5" />
                <path d="M 8 18 L 18 10 L 28 18" fill="none" stroke="#0F172A" strokeWidth="2" />
                <path d="M 12 6 Q 22 4 26 12" fill="none" stroke="#EF4444" strokeWidth="3" />
              </g>
            </g>
          </svg>

          {/* Hotspot Interactive Markers (Clickable Pins on illustration) */}
          {CAMPUS_SOURCES.map((source) => {
            const isSelected = selectedSource.id === source.id;
            return (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source)}
                style={{ left: `${source.coords.x}%`, top: `${source.coords.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group focus:outline-none z-10`}
                title={source.name}
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
                {selectedSource.scopeLabel}
              </span>
              <span className="text-xs text-navy-400 font-medium">
                {selectedSource.category}
              </span>
            </div>

            <h4 className="text-xl font-bold text-navy-900 leading-snug">
              {selectedSource.name}
            </h4>

            {/* Why Classified */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-navy-700 uppercase tracking-wider block">
                Why this scope?
              </span>
              <p className="text-sm text-navy-600 leading-relaxed">
                {selectedSource.whyClassified}
              </p>
            </div>

            {/* Data Needed */}
            <div className="p-3.5 rounded-xl bg-white border border-navy-100 space-y-1">
              <span className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cobalt-600" />
                Data your institution needs:
              </span>
              <p className="text-xs text-navy-600 leading-relaxed">
                {selectedSource.dataNeeded}
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
                <span>View Data Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onExploreDemo && (
              <button
                onClick={onExploreDemo}
                className="bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 font-bold py-2.5 px-3.5 rounded-xl text-xs transition"
                title="See this source in ULAB 2022 dataset"
              >
                Demo data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
