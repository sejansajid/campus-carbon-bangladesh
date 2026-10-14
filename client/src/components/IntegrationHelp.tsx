import React from 'react';
import { HelpCircle, CheckCircle2, AlertCircle, XCircle, FileSpreadsheet, Server, Shield, Database, ExternalLink } from 'lucide-react';
import { Language } from '../../../shared/i18n';

interface IntegrationHelpProps {
  lang: Language;
}

export const IntegrationHelp: React.FC<IntegrationHelpProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const integrations = [
    {
      name: 'Express REST Backend Engine',
      type: 'Core Calculation & Storage API',
      status: 'configured',
      description: 'Local Node.js/Express service providing calculation algorithms, scenario evaluation, factor registry, and seed persistence.',
      routes: '/api/calculate, /api/scenarios/evaluate, /api/institutions, /api/factors',
      auth: 'Local / Session',
      envVars: 'PORT=4000'
    },
    {
      name: 'CSV Template Downloads',
      type: 'Data Ingestion Service',
      status: 'configured',
      description: 'Built-in downloadable CSV format templates for commuting surveys, electricity meters, fuels, and refrigerants.',
      routes: '/api/templates/:type',
      auth: 'None required',
      envVars: 'None'
    },
    {
      name: 'OpenStreetMap Carto Tiles',
      type: 'Geospatial Basemap',
      status: 'configured',
      description: 'Public Leaflet tile layer for interactive campus location and commuter catchment visualization.',
      routes: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      auth: 'None (Public OSM tile policy)',
      envVars: 'None'
    },
    {
      name: 'Google Forms Integration',
      type: 'Survey Automation',
      status: 'optional_script',
      description: 'Delivered as a downloadable Google Apps Script (.js) that administrators run in their own Google Workspace. Not directly connected via OAuth or API tokens.',
      routes: '/api/templates/google-forms-script',
      auth: 'User runs script locally in Google Drive',
      envVars: 'None'
    },
    {
      name: 'MCP (Model Context Protocol) Tools',
      type: 'AI Assistant Interface',
      status: 'optional',
      description: 'Optional agentic tool schema. Core calculations and reporting are fully deterministic and function independently without AI or MCP.',
      routes: 'N/A (Server-side tool definitions)',
      auth: 'Server-side API keys if enabled',
      envVars: 'Optional'
    },
    {
      name: 'Multi-Tenant Production Database',
      type: 'Durable Storage',
      status: 'file_storage',
      description: 'Currently persists records to server JSON file storage (server/data/db.json). For production multi-institution deployments, a managed PostgreSQL database is recommended.',
      routes: 'Internal storage abstraction',
      auth: 'Local file system',
      envVars: 'DATABASE_URL (optional future migration)'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-2xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-cobalt" />
          <span>{isBn ? 'সিস্টেম স্থিতি ও ইন্টিগ্রেশন নিরীক্ষা' : 'System Status & Integration Inventory'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800">
          {isBn ? 'সিস্টেম সক্ষমতা ও ইন্টিগ্রেশন স্থিতি' : 'System Capabilities & Integration Inventory'}
        </h1>
        <p className="text-sm text-navy-600 leading-relaxed max-w-3xl">
          {isBn
            ? 'প্ল্যাটফর্মের প্রতিটি বাহ্যিক সংযোগ ও সেবার প্রকৃত অবস্থা এখানে স্বচ্ছভাবে প্রকাশ করা হয়েছে।'
            : 'Truthful disclosure of actual backend routes, external services, authentication status, and integration readiness.'}
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-navy-100 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-navy-900">{item.name}</h3>
                <span className="text-[11px] text-navy-500">{item.type}</span>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                item.status === 'configured'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : item.status === 'optional_script'
                  ? 'bg-blue-50 text-cobalt border-blue-200'
                  : item.status === 'file_storage'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-navy-50 text-navy-700 border-navy-200'
              }`}>
                {item.status === 'configured' ? 'Active / Configured' :
                 item.status === 'optional_script' ? 'Client Script Export' :
                 item.status === 'file_storage' ? 'Local JSON Persistence' : 'Optional / Standalone'}
              </span>
            </div>

            <p className="text-xs text-navy-600 leading-relaxed">
              {item.description}
            </p>

            <div className="pt-2 border-t border-navy-50 text-[11px] space-y-1 text-navy-500 font-mono">
              <div><strong>Route/Endpoint:</strong> {item.routes}</div>
              <div><strong>Authentication:</strong> {item.auth}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Persistence Note */}
      <div className="bg-ivory rounded-2xl p-5 border border-navy-200 space-y-2 text-xs text-navy-800">
        <h4 className="font-bold text-navy-900 flex items-center gap-1.5 text-sm">
          <Shield className="w-4 h-4 text-cobalt" />
          <span>Production Readiness & Security Architecture</span>
        </h4>
        <p className="text-navy-600 text-[11px] leading-relaxed">
          The public ULAB 2022 demo runs on a frozen, read-only benchmark fixture. New university assessments are isolated in their own institutional records. All calculation routines are deterministic, auditable, and operate without external AI dependencies.
        </p>
      </div>
    </div>
  );
};
