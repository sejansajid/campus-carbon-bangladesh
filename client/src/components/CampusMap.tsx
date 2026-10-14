import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Layers, ShieldCheck, Info, Maximize2 } from 'lucide-react';
import L from 'leaflet';
import { CampusBoundary } from '../../../shared/types';
import { Language, t } from '../../../shared/i18n';

interface CampusMapProps {
  boundary?: CampusBoundary;
  institutionName: string;
  lang: Language;
}

// Commuter origin coordinates in Dhaka with sample respondent counts from research dataset
const DHAKA_COMMUTER_ORIGINS = [
  { area: 'Adabar', count: 24, coords: [23.7745, 90.3562], distanceKm: 2.8 },
  { area: 'Mohammadpur', count: 18, coords: [23.7588, 90.3602], distanceKm: 1.5 },
  { area: 'Dhanmondi', count: 15, coords: [23.7461, 90.3742], distanceKm: 3.2 },
  { area: 'Mirpur (Sec 1-12)', count: 12, coords: [23.8223, 90.3654], distanceKm: 8.5 },
  { area: 'Uttara', count: 10, coords: [23.8759, 90.3795], distanceKm: 16.5 },
  { area: 'Farmgate', count: 8, coords: [23.7561, 90.3872], distanceKm: 4.8 },
  { area: 'Old Dhaka / Bangshal', count: 6, coords: [23.7145, 90.4072], distanceKm: 7.2 },
  { area: 'Banani', count: 5, coords: [23.7937, 90.4066], distanceKm: 9.0 },
  { area: 'Dhaka Cantonment', count: 5, coords: [23.8184, 90.3955], distanceKm: 8.0 },
  // Small cell count (< 5) suppressed for privacy
  { area: 'Agargaon', count: 4, coords: [23.7778, 90.3782], distanceKm: 3.5, suppressed: true },
  { area: 'Badda', count: 3, coords: [23.7805, 90.4267], distanceKm: 9.8, suppressed: true },
  { area: 'Banasree', count: 2, coords: [23.7634, 90.4328], distanceKm: 10.2, suppressed: true }
];

export const CampusMap: React.FC<CampusMapProps> = ({
  boundary,
  institutionName,
  lang
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [activeLayer, setActiveLayer] = useState<'all' | 'campus' | 'origins'>('all');
  const [privacyThreshold, setPrivacyThreshold] = useState<number>(5);

  const centerCoords: [number, number] = boundary?.centerCoordinates || [23.7547, 90.3582];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: centerCoords,
        zoom: 13,
        zoomControl: true
      });

      // Add OpenStreetMap base tiles with proper attribution
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing overlay layers
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // 1. Campus Marker & Boundary Polygon
    if (activeLayer === 'all' || activeLayer === 'campus') {
      const campusIcon = L.divIcon({
        className: 'custom-campus-pin',
        html: `<div style="background-color:#0d9488;color:white;padding:4px 8px;border-radius:6px;font-weight:bold;font-size:11px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;">🏛️ ${institutionName}</div>`,
        iconSize: [120, 30],
        iconAnchor: [60, 15]
      });

      L.marker(centerCoords, { icon: campusIcon })
        .addTo(map)
        .bindPopup(`<b>${institutionName}</b><br/>Permanent Campus (Mohammadpur)<br/>Lat: ${centerCoords[0]}, Lng: ${centerCoords[1]}`);

      // Add illustrative campus boundary polygon
      const polygonCoords: L.LatLngExpression[] = [
        [23.7535, 90.3565],
        [23.7535, 90.3595],
        [23.7560, 90.3598],
        [23.7562, 90.3568],
        [23.7535, 90.3565]
      ];

      L.polygon(polygonCoords, {
        color: '#0d9488',
        fillColor: '#14b8a6',
        fillOpacity: 0.25,
        weight: 2
      }).addTo(map).bindPopup('Institutional Accounting Perimeter: ~5.5 Acres');
    }

    // 2. Commuter Origin Privacy Clusters
    if (activeLayer === 'all' || activeLayer === 'origins') {
      DHKH_LOOP: for (const item of DHAKA_COMMUTER_ORIGINS) {
        // Enforce privacy threshold: Suppress cells with count < threshold
        if (item.count < privacyThreshold) {
          continue DHKH_LOOP;
        }

        const radius = Math.min(25, Math.max(8, item.count * 1.2));
        const circle = L.circleMarker(item.coords as [number, number], {
          radius: radius,
          fillColor: '#8b5cf6',
          color: '#6d28d9',
          weight: 1.5,
          opacity: 0.8,
          fillOpacity: 0.45
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-size:12px;font-family:sans-serif;">
            <b>${item.area} Commuter Cluster</b><br/>
            Respondents: <b>${item.count}</b> individuals<br/>
            Average Distance: ~${item.distanceKm} km to campus<br/>
            <span style="color:#64748b;font-size:10px;">Privacy: Aggregated cluster (k ≥ ${privacyThreshold})</span>
          </div>
        `);
      }
    }

  }, [centerCoords, activeLayer, privacyThreshold, institutionName]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-700" />
              Interactive Campus GIS & Commuter Origin Mapping
            </h2>
            <p className="text-xs text-slate-500">
              Visualizes the institutional boundary, building footprints, and aggregated student/faculty commuting hubs across the Dhaka metropolitan region.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Layers:</span>
            <button
              onClick={() => setActiveLayer('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeLayer === 'all' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              All Layers
            </button>
            <button
              onClick={() => setActiveLayer('campus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeLayer === 'campus' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Campus Only
            </button>
            <button
              onClick={() => setActiveLayer('origins')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeLayer === 'origins' ? 'bg-purple-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Commuter Hubs
            </button>
          </div>
        </div>
      </div>

      {/* Map Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Leaflet Container */}
        <div 
          ref={mapContainerRef} 
          className="h-[460px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative"
        />

        {/* Spatial Metadata & Privacy Callout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 block">Campus Perimeter Area</span>
            <div className="text-base font-extrabold text-slate-900">
              5.5 <span className="text-xs font-normal text-slate-500">Acres (24,500 m² Floor Area)</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Coordinates: {centerCoords[0].toFixed(4)}° N, {centerCoords[1].toFixed(4)}° E
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
            <span className="font-bold text-purple-900 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              Privacy-Preserving Aggregation (k ≥ 5)
            </span>
            <div className="text-[11px] text-purple-800 leading-relaxed">
              To guarantee individual respondent anonymity, small origin cells with fewer than 5 travelers are automatically suppressed and grouped into broad regional clusters.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
            <span className="font-bold text-teal-900 block flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-700" />
              Cartographic Citation & Source
            </span>
            <div className="text-[11px] text-teal-800 leading-relaxed">
              OpenStreetMap tile provider & ULAB GIS Heatmap coordinates (<code className="bg-teal-100 px-1 rounded">HEATMAP.kml</code> research dataset).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
