import React, { useState } from 'react';
import { 
  Zap, 
  Flame, 
  Bus, 
  Wind, 
  Users, 
  ArrowRight, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export interface SourceDetail {
  id: 'grid' | 'chillers' | 'generator' | 'shuttle' | 'commuting';
  name: string;
  scope: 1 | 2 | 3;
  scopeLabel: string;
  category: string;
  whyClassified: string;
  dataNeeded: string;
  color: string;
  badgeBg: string;
  icon: React.ElementType;
  svgPos: { x: number; y: number };
}

export const CAMPUS_SOURCES: SourceDetail[] = [
  {
    id: 'grid',
    name: 'Main Substation & Grid Electricity',
    scope: 2,
    scopeLabel: 'Scope 2 — Purchased Electricity',
    category: 'Grid Purchased Electricity',
    whyClassified: 'Emissions produced at national power stations to generate utility electricity consumed across campus facilities and computer labs.',
    dataNeeded: '12 monthly utility billing statements showing total imported kilowatt-hours (kWh) multiplied by Bangladesh national grid emission factor.',
    color: '#2457D6',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: Zap,
    svgPos: { x: 535, y: 160 }
  },
  {
    id: 'chillers',
    name: 'Rooftop AC Chillers & HVAC Refrigerants',
    scope: 1,
    scopeLabel: 'Scope 1 — Fugitive Refrigerants',
    category: 'Fugitive Refrigerant Top-Ups',
    whyClassified: 'Fugitive greenhouse gas top-ups (e.g. R-410A) during routine HVAC maintenance. (ODS such as R-22 are reported in a separate informational memo per GHG Protocol).',
    dataNeeded: 'HVAC service logbooks and refrigerant cylinder replenishment invoices in kilograms.',
    color: '#D97706',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Wind,
    svgPos: { x: 310, y: 65 }
  },
  {
    id: 'generator',
    name: 'Backup Diesel Generators',
    scope: 1,
    scopeLabel: 'Scope 1 — Stationary Combustion',
    category: 'Stationary Combustion',
    whyClassified: 'University-owned generator equipment burning diesel fuel on-site during power outages and load-shedding events.',
    dataNeeded: 'Annual diesel purchase invoices or logbook litres consumed (e.g. 9,113 L at ULAB baseline).',
    color: '#D97706',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Flame,
    svgPos: { x: 120, y: 225 }
  },
  {
    id: 'shuttle',
    name: 'University-Owned Fleet & Vans',
    scope: 1,
    scopeLabel: 'Scope 1 — Mobile Combustion',
    category: 'University Transport Fleet',
    whyClassified: 'Vehicles owned or operationally leased by the university using octane and diesel fuel for official transit.',
    dataNeeded: 'Fleet fuel dispensing receipts or monthly octane/diesel fuel account statements.',
    color: '#D97706',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Bus,
    svgPos: { x: 155, y: 315 }
  },
  {
    id: 'commuting',
    name: 'Student, Faculty & Staff Commuting',
    scope: 3,
    scopeLabel: 'Scope 3 — Commuter Travel',
    category: 'Commuter Travel',
    whyClassified: 'Daily passenger travel between homes and campus via public buses, rickshaws, CNGs, motorcycles, and walking.',
    dataNeeded: 'Representative commuter travel survey capturing mode choices, one-way distances, and weekly campus attendance days.',
    color: '#7C3AED',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    icon: Users,
    svgPos: { x: 420, y: 315 }
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
  const [selectedSource, setSelectedSource] = useState<SourceDetail>(CAMPUS_SOURCES[0]);

  return (
    <div className="bg-white rounded-3xl border border-navy-100 p-6 md:p-8 shadow-xs space-y-6">
      {/* Header and Scope Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-navy-100 gap-4">
        <div>
          <span className="text-xs font-bold text-cobalt uppercase tracking-wider block">
            Interactive System Diagram
          </span>
          <h3 className="text-xl font-bold text-navy-900">
            How Campus Infrastructure Maps to Emissions Scopes
          </h3>
          <p className="text-xs text-navy-500 mt-0.5">
            Click on any infrastructure asset on the diagram or use the selector buttons below to inspect its accounting scope and data requirements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span>Scope 1: Direct Operations</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cobalt"></span>Scope 2: Purchased Electricity</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-600"></span>Scope 3: Commuting</span>
        </div>
      </div>

      {/* Interactive Quick-Selector Pill Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider shrink-0 mr-1">
          Select Source:
        </span>
        {CAMPUS_SOURCES.map((source) => {
          const isSelected = selectedSource.id === source.id;
          const Icon = source.icon;
          return (
            <button
              key={source.id}
              onClick={() => setSelectedSource(source)}
              className={`px-3 py-2 rounded-xl font-semibold border transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isSelected 
                  ? 'bg-navy-900 text-white border-navy-900 shadow-sm ring-2 ring-cobalt/30 scale-102' 
                  : 'bg-white hover:bg-navy-50 text-navy-700 border-navy-200'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: source.color }} 
              />
              <Icon className="w-3.5 h-3.5" />
              <span>{source.name.split('&')[0].trim()}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-navy-100 text-navy-600'
              }`}>
                S{source.scope}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Diagram and Inspection Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* SVG Graphic (7 Columns) */}
        <div className="lg:col-span-7 bg-navy-50/40 rounded-2xl p-3 sm:p-4 border border-navy-100 relative flex items-center justify-center">
          <svg 
            viewBox="0 0 640 380" 
            className="w-full h-auto drop-shadow-2xs select-none"
            role="img"
            aria-label="Interactive Campus Emissions Infrastructure Diagram"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EFF6FF" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
              <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Sky Background */}
            <rect x="0" y="0" width="640" height="280" fill="url(#skyGrad)" />
            {/* Campus Courtyard Ground */}
            <rect x="0" y="280" width="640" height="100" fill="url(#groundGrad)" />

            {/* Distant City Skyline */}
            <path 
              d="M 0 260 L 25 260 L 25 240 L 55 240 L 55 260 L 95 260 L 95 230 L 125 230 L 125 260 L 175 260 L 175 220 L 210 220 L 210 260 L 415 260 L 415 245 L 450 245 L 450 260 L 500 260 L 500 225 L 535 225 L 535 260 L 640 260 L 640 280 L 0 280 Z" 
              fill="#CBD5E1" 
              opacity="0.5" 
            />

            {/* Campus Main Academic Building (Background) */}
            <g id="campus-building-body">
              <rect 
                x="210" 
                y="105" 
                width="220" 
                height="175" 
                rx="6" 
                fill="#FFFFFF" 
                stroke={selectedSource.id === 'chillers' ? '#D97706' : '#94A3B8'} 
                strokeWidth={selectedSource.id === 'chillers' ? 3 : 2} 
              />
              
              {/* Architectural Roof Parapet */}
              <rect x="205" y="100" width="230" height="10" rx="3" fill="#0F172A" />

              {/* Window grid */}
              {[125, 160, 195].map((y) => (
                <g key={y}>
                  <rect x="230" y={y} width="30" height="20" rx="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
                  <rect x="270" y={y} width="30" height="20" rx="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
                  <rect x="310" y={y} width="30" height="20" rx="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
                  <rect x="350" y={y} width="30" height="20" rx="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
                  <rect x="390" y={y} width="25" height="20" rx="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
                </g>
              ))}

              {/* Campus Entrance (Wide, Clean, No-Clipped-Text) */}
              <rect x="260" y="235" width="120" height="45" fill="#0F172A" rx="4" />
              <text 
                x="320" 
                y="254" 
                fill="#FFFFFF" 
                fontSize="9" 
                fontWeight="bold" 
                letterSpacing="1" 
                textAnchor="middle"
              >
                CAMPUS ENTRANCE
              </text>
              {/* Glass entrance doors */}
              <rect x="280" y="260" width="35" height="20" fill="#E0F2FE" opacity="0.8" rx="1" />
              <rect x="325" y="260" width="35" height="20" fill="#E0F2FE" opacity="0.8" rx="1" />
              <line x1="297" y1="260" x2="297" y2="280" stroke="#0F172A" strokeWidth="1" />
              <line x1="342" y1="260" x2="342" y2="280" stroke="#0F172A" strokeWidth="1" />
            </g>

            {/* 1. Rooftop AC Chillers & HVAC (Scope 1 Fugitives) */}
            <g 
              id="source-chillers" 
              onClick={() => setSelectedSource(CAMPUS_SOURCES[1])}
              className="cursor-pointer group"
            >
              <rect 
                x="270" 
                y="75" 
                width="80" 
                height="28" 
                fill="#334155" 
                rx="3" 
                stroke={selectedSource.id === 'chillers' ? '#D97706' : '#1E293B'} 
                strokeWidth={selectedSource.id === 'chillers' ? 3 : 1.5} 
              />
              <circle cx="292" cy="89" r="8" fill="#94A3B8" />
              <circle cx="292" cy="89" r="4" fill="#0F172A" />
              <circle cx="328" cy="89" r="8" fill="#94A3B8" />
              <circle cx="328" cy="89" r="4" fill="#0F172A" />
              {/* Cooling/Heat Dissipation plumes */}
              <path d="M 292 72 Q 287 60 294 50" fill="none" stroke="#D97706" strokeWidth="2.5" strokeDasharray="3,3" />
              <path d="M 328 72 Q 323 60 330 50" fill="none" stroke="#D97706" strokeWidth="2.5" strokeDasharray="3,3" />
              
              {/* Pin 1: AC Chillers */}
              <g transform="translate(310, 40)">
                {selectedSource.id === 'chillers' && (
                  <circle cx="0" cy="0" r="16" fill="#D97706" opacity="0.3" className="animate-ping" />
                )}
                <circle 
                  cx="0" 
                  cy="0" 
                  r="13" 
                  fill="#D97706" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.5" 
                  filter="url(#glowEffect)" 
                />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">1</text>
              </g>
            </g>

            {/* 2. Backup Diesel Generator Enclosure (Scope 1) */}
            <g 
              id="source-generator" 
              onClick={() => setSelectedSource(CAMPUS_SOURCES[2])}
              className="cursor-pointer group"
            >
              {/* Generator Housing */}
              <rect 
                x="70" 
                y="225" 
                width="95" 
                height="55" 
                rx="4" 
                fill="#334155" 
                stroke={selectedSource.id === 'generator' ? '#D97706' : '#1E293B'} 
                strokeWidth={selectedSource.id === 'generator' ? 3 : 2} 
              />
              {/* Air intake vents */}
              <rect x="80" y="240" width="28" height="28" fill="#1E293B" rx="2" />
              <line x1="82" y1="247" x2="106" y2="247" stroke="#64748B" strokeWidth="2" />
              <line x1="82" y1="254" x2="106" y2="254" stroke="#64748B" strokeWidth="2" />
              <line x1="82" y1="261" x2="106" y2="261" stroke="#64748B" strokeWidth="2" />
              {/* Control Panel */}
              <rect x="115" y="240" width="22" height="15" fill="#0F172A" rx="1" />
              <circle cx="122" cy="247" r="2.5" fill="#EF4444" />
              <circle cx="130" cy="247" r="2.5" fill="#22C55E" />
              {/* Exhaust Stack */}
              <rect x="145" y="195" width="10" height="30" fill="#475569" rx="1" />
              {/* Smoke / Emissions Plume */}
              <ellipse cx="150" cy="182" rx="9" ry="6" fill="#94A3B8" opacity="0.75" />
              <ellipse cx="154" cy="170" rx="14" ry="8" fill="#CBD5E1" opacity="0.45" />

              {/* Pin 2: Generator */}
              <g transform="translate(120, 205)">
                {selectedSource.id === 'generator' && (
                  <circle cx="0" cy="0" r="16" fill="#D97706" opacity="0.3" className="animate-ping" />
                )}
                <circle 
                  cx="0" 
                  cy="0" 
                  r="13" 
                  fill="#D97706" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.5" 
                  filter="url(#glowEffect)" 
                />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">1</text>
              </g>
            </g>

            {/* 3. Scope 2 Substation & Transmission Grid */}
            <g 
              id="source-grid" 
              onClick={() => setSelectedSource(CAMPUS_SOURCES[0])}
              className="cursor-pointer group"
            >
              {/* Utility Pylon */}
              <line x1="560" y1="110" x2="560" y2="280" stroke="#64748B" strokeWidth="4" />
              <line x1="535" y1="140" x2="585" y2="140" stroke="#64748B" strokeWidth="3" />
              <line x1="540" y1="170" x2="580" y2="170" stroke="#64748B" strokeWidth="3" />
              
              {/* Incoming High Voltage Power Lines */}
              <path d="M 640 130 L 560 140" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="6,4" />
              <path d="M 640 160 L 560 170" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="6,4" />
              
              {/* Power Feed into Campus Substation */}
              <path d="M 560 140 Q 520 180 500 230" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="5,4" />
              <path d="M 560 170 Q 525 200 505 240" fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="5,4" />
              
              {/* Step-Down Substation Box */}
              <rect 
                x="475" 
                y="235" 
                width="55" 
                height="45" 
                rx="4" 
                fill="#1E293B" 
                stroke={selectedSource.id === 'grid' ? '#2563EB' : '#0F172A'} 
                strokeWidth={selectedSource.id === 'grid' ? 3 : 2} 
              />
              <rect x="492" y="225" width="20" height="12" fill="#64748B" rx="1" />
              <text x="502" y="262" fill="#38BDF8" fontSize="16" fontWeight="bold" textAnchor="middle">⚡</text>

              {/* Pin 3: Grid Electricity */}
              <g transform="translate(535, 160)">
                {selectedSource.id === 'grid' && (
                  <circle cx="0" cy="0" r="16" fill="#2563EB" opacity="0.3" className="animate-ping" />
                )}
                <circle 
                  cx="0" 
                  cy="0" 
                  r="13" 
                  fill="#2563EB" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.5" 
                  filter="url(#glowEffect)" 
                />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">2</text>
              </g>
            </g>

            {/* Campus Access Road & Transit Lane */}
            <g id="roadway-infrastructure">
              <rect x="0" y="305" width="640" height="60" fill="#334155" />
              <line x1="0" y1="335" x2="640" y2="335" stroke="#FDE047" strokeWidth="3" strokeDasharray="25,18" />
              
              {/* Pedestrian Crosswalk zebra */}
              {[250, 265, 280, 295, 310, 325, 340].map((x) => (
                <rect key={x} x={x} y="307" width="9" height="56" fill="#FFFFFF" opacity="0.85" />
              ))}
            </g>

            {/* 4. University-Owned Transport Bus / Fleet (Scope 1 Mobile Combustion) */}
            <g 
              id="source-shuttle" 
              onClick={() => setSelectedSource(CAMPUS_SOURCES[3])}
              className="cursor-pointer group"
            >
              {/* Bus Body */}
              <rect 
                x="85" 
                y="300" 
                width="110" 
                height="40" 
                rx="6" 
                fill="#0D9488" 
                stroke={selectedSource.id === 'shuttle' ? '#D97706' : '#115E59'} 
                strokeWidth={selectedSource.id === 'shuttle' ? 3 : 2} 
              />
              {/* Windows */}
              <rect x="95" y="306" width="16" height="15" rx="2" fill="#CCFBF1" />
              <rect x="117" y="306" width="22" height="15" rx="2" fill="#CCFBF1" />
              <rect x="145" y="306" width="22" height="15" rx="2" fill="#CCFBF1" />
              <rect x="173" y="306" width="16" height="15" rx="2" fill="#CCFBF1" />
              {/* Wheels */}
              <circle cx="112" cy="340" r="9" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2" />
              <circle cx="172" cy="340" r="9" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2" />
              {/* Bus Label */}
              <text x="140" y="331" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">CAMPUS SHUTTLE</text>

              {/* Pin 4: Fleet Shuttle */}
              <g transform="translate(140, 285)">
                {selectedSource.id === 'shuttle' && (
                  <circle cx="0" cy="0" r="16" fill="#D97706" opacity="0.3" className="animate-ping" />
                )}
                <circle 
                  cx="0" 
                  cy="0" 
                  r="13" 
                  fill="#D97706" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.5" 
                  filter="url(#glowEffect)" 
                />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">1</text>
              </g>
            </g>

            {/* 5. Commuter Vehicles & Rickshaw (Scope 3 Commuting) */}
            <g 
              id="source-commuting" 
              onClick={() => setSelectedSource(CAMPUS_SOURCES[4])}
              className="cursor-pointer group"
            >
              {/* Commuter Private Car */}
              <rect 
                x="370" 
                y="312" 
                width="65" 
                height="26" 
                rx="5" 
                fill="#7C3AED" 
                stroke={selectedSource.id === 'commuting' ? '#A855F7' : '#5B21B6'} 
                strokeWidth={selectedSource.id === 'commuting' ? 3 : 1.5} 
              />
              <rect x="382" y="316" width="16" height="10" rx="1" fill="#DDD6FE" />
              <rect x="404" y="316" width="18" height="10" rx="1" fill="#DDD6FE" />
              <circle cx="386" cy="338" r="7" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />
              <circle cx="422" cy="338" r="7" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Traditional Cycle Rickshaw (Local Commuting Mode) */}
              <g transform="translate(470, 310)">
                <circle cx="10" cy="24" r="8" fill="none" stroke="#0F172A" strokeWidth="2" />
                <circle cx="36" cy="24" r="8" fill="none" stroke="#0F172A" strokeWidth="2" />
                <path d="M 10 24 L 22 14 L 36 24" fill="none" stroke="#0F172A" strokeWidth="2.5" />
                <path d="M 14 8 Q 28 5 34 16" fill="none" stroke="#EF4444" strokeWidth="3.5" />
                <line x1="22" y1="14" x2="22" y2="8" stroke="#0F172A" strokeWidth="2" />
              </g>

              {/* Pin 5: Commuting */}
              <g transform="translate(435, 290)">
                {selectedSource.id === 'commuting' && (
                  <circle cx="0" cy="0" r="16" fill="#7C3AED" opacity="0.3" className="animate-ping" />
                )}
                <circle 
                  cx="0" 
                  cy="0" 
                  r="13" 
                  fill="#7C3AED" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.5" 
                  filter="url(#glowEffect)" 
                />
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">3</text>
              </g>
            </g>
          </svg>
        </div>

        {/* Selected Source Explanation Drawer (5 Columns) */}
        <div className="lg:col-span-5 bg-navy-50/50 p-6 rounded-2xl border border-navy-100 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Scope Badge & Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
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
                <CheckCircle2 className="w-3.5 h-3.5 text-cobalt" />
                Data your institution needs:
              </span>
              <p className="text-xs text-navy-600 leading-relaxed">
                {selectedSource.dataNeeded}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {onSelectScope && (
              <button
                onClick={() => onSelectScope(selectedSource.scope)}
                className="w-full sm:flex-1 bg-cobalt hover:bg-cobalt-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Collect Scope {selectedSource.scope} Data</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <a
              href="https://doi.org/10.1109/ACCESS.2025.3605517"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-white hover:bg-navy-50 text-navy-800 border border-navy-200 font-bold py-2.5 px-3.5 rounded-xl text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Read the methodology in the IEEE Access paper"
            >
              <span>Methodology Paper</span>
              <ExternalLink className="w-3 h-3 text-navy-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
