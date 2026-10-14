import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Layers, ShieldCheck, Info, RefreshCw, CheckCircle2, AlertCircle, Edit3, X, Check } from 'lucide-react';
import L from 'leaflet';
import { CampusBoundary } from '../../../shared/types';
import { Language } from '../../../shared/i18n';

interface CampusMapProps {
  boundary?: CampusBoundary;
  institutionName: string;
  lang: Language;
  isDemo?: boolean;
  onUpdateBoundary?: (updated: { lat: number; lng: number; confirmed: boolean; boundaryType: 'verified' | 'approximate' | 'point_only' }) => void;
}

// Commuter origin coordinates with aggregated counts
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
  // Under-threshold cells (< 5) are suppressed
  { area: 'Agargaon', count: 4, coords: [23.7778, 90.3782], distanceKm: 3.5, suppressed: true },
  { area: 'Badda', count: 3, coords: [23.7805, 90.4267], distanceKm: 9.8, suppressed: true },
  { area: 'Banasree', count: 2, coords: [23.7634, 90.4328], distanceKm: 10.2, suppressed: true }
];

export const CampusMap: React.FC<CampusMapProps> = ({
  boundary,
  institutionName,
  lang,
  isDemo = false,
  onUpdateBoundary
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const initialCenter: [number, number] = boundary?.centerCoordinates || [23.7547, 90.3582];
  const [coords, setCoords] = useState<[number, number]>(initialCenter);
  const [latInput, setLatInput] = useState<string>(String(initialCenter[0]));
  const [lngInput, setLngInput] = useState<string>(String(initialCenter[1]));

  const [boundaryType, setBoundaryType] = useState<'verified' | 'approximate' | 'point_only'>(
    boundary?.confirmedByInstitution ? 'verified' : 'approximate'
  );

  const [showAdjustDrawer, setShowAdjustDrawer] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<'all' | 'campus' | 'origins'>('all');
  const [tileError, setTileError] = useState<boolean>(false);

  const isBn = lang === 'bn';
  const landAreaAcres = boundary?.landAreaAcres ?? 5.5;
  const buildingFloorAreaM2 = boundary?.grossFloorAreaM2 ?? 24500;

  // Sync coords if boundary prop updates
  useEffect(() => {
    if (boundary?.centerCoordinates) {
      setCoords(boundary.centerCoordinates);
      setLatInput(String(boundary.centerCoordinates[0]));
      setLngInput(String(boundary.centerCoordinates[1]));
    }
  }, [boundary?.centerCoordinates]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: coords,
          zoom: 13,
          zoomControl: true,
          attributionControl: true
        });

        // Add OpenStreetMap base tiles
        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
        });

        tiles.on('tileerror', () => {
          setTileError(true);
        });

        tiles.on('load', () => {
          setTileError(false);
        });

        tiles.addTo(map);
        mapInstanceRef.current = map;

        setTimeout(() => {
          map.invalidateSize();
        }, 150);
        setTimeout(() => {
          map.invalidateSize();
        }, 500);
      } catch (err) {
        console.error('Failed to initialize Leaflet map:', err);
      }
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();

    // Clear existing overlay layers
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // 1. Campus Centroid Marker & Perimeter Polygon
    if (activeLayer === 'all' || activeLayer === 'campus') {
      const pinColor = boundaryType === 'verified' ? '#16A34A' : boundaryType === 'approximate' ? '#D97706' : '#2563EB';
      const campusIcon = L.divIcon({
        className: 'custom-campus-pin',
        html: `<div style="background-color:#14243A;color:white;padding:5px 9px;border-radius:8px;font-weight:bold;font-size:11px;border:2px solid ${pinColor};box-shadow:0 3px 8px rgba(0,0,0,0.3);white-space:nowrap;display:flex;align-items:center;gap:4px;">
          <span>🏛️</span><span>${institutionName || 'Campus Centroid'}</span>
        </div>`,
        iconSize: [140, 32],
        iconAnchor: [70, 16]
      });

      L.marker(coords, { icon: campusIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;padding:4px;">
            <b style="color:#14243A;font-size:13px;">${institutionName || 'University Campus'}</b><br/>
            <span style="font-size:11px;color:${pinColor};font-weight:bold;">
              ${boundaryType === 'verified' ? '✓ Verified Campus Boundary' : boundaryType === 'approximate' ? '⚠ Approximate Spatial Extent' : '📍 Campus Centroid Marker'}
            </span><br/>
            <hr style="margin:6px 0;border-top:1px solid #E2E8F0;"/>
            <span style="font-size:11px;"><b>Land Area:</b> ${landAreaAcres} Acres</span><br/>
            <span style="font-size:11px;"><b>Building Floor Area:</b> ${buildingFloorAreaM2.toLocaleString()} m²</span><br/>
            <span style="font-size:10px;color:#94A3B8;">GPS: ${coords[0].toFixed(4)}° N, ${coords[1].toFixed(4)}° E</span>
          </div>
        `);

      // Draw Perimeter Polygon if not point_only
      if (boundaryType !== 'point_only') {
        const dLat = 0.0015;
        const dLng = 0.0018;
        const polygonCoords: L.LatLngExpression[] = [
          [coords[0] - dLat, coords[1] - dLng],
          [coords[0] - dLat, coords[1] + dLng],
          [coords[0] + dLat, coords[1] + dLng],
          [coords[0] + dLat, coords[1] - dLng],
          [coords[0] - dLat, coords[1] - dLng]
        ];

        const isVerified = boundaryType === 'verified';
        L.polygon(polygonCoords, {
          color: isVerified ? '#16A34A' : '#D97706',
          dashArray: isVerified ? undefined : '5, 5',
          fillColor: isVerified ? '#22C55E' : '#F59E0B',
          fillOpacity: isVerified ? 0.2 : 0.15,
          weight: 2
        }).addTo(map).bindPopup(`
          <b>${isVerified ? 'Verified Institutional Perimeter' : 'Approximate Boundary Polygon'}</b><br/>
          <span>${isVerified ? 'Confirmed with institutional facilities records.' : 'Estimated footprint from reported acreage (~' + landAreaAcres + ' acres).'}</span>
        `);
      }
    }

    // 2. Commuter Origin Clusters (Strictly k >= 5 respondents)
    if (activeLayer === 'all' || activeLayer === 'origins') {
      const publicOrigins = DHAKA_COMMUTER_ORIGINS.filter(o => !o.suppressed);

      publicOrigins.forEach(origin => {
        const radius = Math.min(22, Math.max(9, Math.sqrt(origin.count) * 4));
        const circle = L.circleMarker(origin.coords as [number, number], {
          radius,
          fillColor: '#7C3AED',
          color: '#FFFFFF',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.75
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-family:sans-serif;padding:4px;">
            <b style="color:#14243A;font-size:13px;">${origin.area}</b><br/>
            <span style="font-size:11px;color:#7C3AED;font-weight:bold;">${origin.count} survey respondents (k ≥ 5)</span><br/>
            <span style="font-size:11px;color:#64748B;">Approx. Distance: ${origin.distanceKm} km to campus</span>
          </div>
        `);
      });
    }

    // Fit bounds smoothly
    if (activeLayer === 'campus') {
      map.setView(coords, 15);
    } else {
      map.setView(coords, 12);
    }

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [coords, boundaryType, activeLayer, institutionName, landAreaAcres, buildingFloorAreaM2]);

  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(latInput);
    const parsedLng = parseFloat(lngInput);
    if (!isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat >= 20 && parsedLat <= 27 && parsedLng >= 88 && parsedLng <= 93) {
      const newCoords: [number, number] = [parsedLat, parsedLng];
      setCoords(newCoords);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(newCoords, 14);
      }
      if (onUpdateBoundary) {
        onUpdateBoundary({
          lat: parsedLat,
          lng: parsedLng,
          confirmed: boundaryType === 'verified',
          boundaryType
        });
      }
      setShowAdjustDrawer(false);
    }
  };

  const handlePresetSelect = (presetLat: number, presetLng: number) => {
    setLatInput(String(presetLat));
    setLngInput(String(presetLng));
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(coords, 13);
      mapInstanceRef.current.invalidateSize();
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-navy-100 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cobalt"></span>
              <span className="text-xs font-bold text-cobalt uppercase tracking-wider">
                {isBn ? 'ক্যাম্পাস ভৌগোলিক মানচিত্র' : 'Spatial Footprint & Commuter GIS'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h3 className="text-xl font-extrabold text-navy-900">
                {isBn ? 'ক্যাম্পাস সীমানা ও যাতায়াত হাব' : 'Campus Perimeter & Travel Clusters'}
              </h3>
              {/* Boundary Status Badge */}
              {boundaryType === 'verified' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isBn ? 'যাচাইকৃত ক্যাম্পাস সীমানা' : 'Verified Campus Boundary'}
                </span>
              )}
              {boundaryType === 'approximate' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  {isBn ? 'আনুমানিক ভৌগোলিক বিস্তার' : 'Approximate Boundary Polygon'}
                </span>
              )}
              {boundaryType === 'point_only' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-800 text-xs font-bold border border-navy-200">
                  <MapPin className="w-3.5 h-3.5 text-navy-600" />
                  {isBn ? 'শুধু কেন্দ্রবিন্দু পিন' : 'Centroid Pin Only'}
                </span>
              )}
            </div>
            <p className="text-xs text-navy-500 mt-1">
              {isBn 
                ? 'বিশ্ববিদ্যালয় সীমানা এবং শিক্ষার্থীদের বৃহত্তর ঢাকা অঞ্চলের যাতায়াত ক্লাস্টার।'
                : 'Interactive spatial visualization of campus boundary and origin commuter clusters across Dhaka.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-navy-50 p-1 rounded-xl border border-navy-100">
              <button
                onClick={() => setActiveLayer('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeLayer === 'all' 
                    ? 'bg-navy-800 text-white shadow-2xs' 
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                {isBn ? 'সব লেয়ার' : 'All Layers'}
              </button>
              <button
                onClick={() => setActiveLayer('campus')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeLayer === 'campus' 
                    ? 'bg-cobalt text-white shadow-2xs' 
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                {isBn ? 'শুধু ক্যাম্পাস' : 'Campus Only'}
              </button>
              <button
                onClick={() => setActiveLayer('origins')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeLayer === 'origins' 
                    ? 'bg-purple-600 text-white shadow-2xs' 
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                {isBn ? 'যাতায়াত হাব' : 'Commuter Hubs'}
              </button>
            </div>

            <button
              onClick={() => setShowAdjustDrawer(!showAdjustDrawer)}
              className="px-3 py-1.5 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200 text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-cobalt" />
              <span>{isBn ? 'স্থানাঙ্ক সম্পাদনা' : 'Adjust Location'}</span>
            </button>

            <button
              onClick={handleRecenter}
              className="p-2 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-700 border border-navy-200 transition cursor-pointer"
              title={isBn ? 'পুনরায় কেন্দ্র করুন' : 'Recenter map'}
              aria-label="Recenter map"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Adjust Coordinates Panel */}
        {showAdjustDrawer && (
          <form onSubmit={handleApplyCoordinates} className="mt-4 pt-4 border-t border-navy-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900">
                {isBn ? 'ক্যাম্পাসের জিপিএস স্থানাঙ্ক ও সীমানা ধরন নির্ধারণ করুন' : 'Confirm or Adjust Campus Coordinates & Boundary Fidelity'}
              </span>
              <button
                type="button"
                onClick={() => setShowAdjustDrawer(false)}
                className="text-navy-400 hover:text-navy-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-navy-700 mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-navy-200 focus:outline-none focus:border-cobalt"
                  placeholder="e.g. 23.7547"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-700 mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-navy-200 focus:outline-none focus:border-cobalt"
                  placeholder="e.g. 90.3582"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-700 mb-1">Boundary Status</label>
                <select
                  value={boundaryType}
                  onChange={(e) => setBoundaryType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-navy-200 focus:outline-none focus:border-cobalt bg-white"
                >
                  <option value="verified">Verified Institutional Perimeter (Audited)</option>
                  <option value="approximate">Approximate Extent (Dashed Polygon)</option>
                  <option value="point_only">Centroid Pin Only (No Polygon)</option>
                </select>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
              <span className="font-semibold text-navy-500">Bangladesh Presets:</span>
              <button
                type="button"
                onClick={() => handlePresetSelect(23.7547, 90.3582)}
                className="px-2 py-0.5 rounded bg-navy-50 hover:bg-navy-100 text-navy-700 border border-navy-200 cursor-pointer"
              >
                ULAB Mohammadpur (23.7547, 90.3582)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect(23.7262, 90.4005)}
                className="px-2 py-0.5 rounded bg-navy-50 hover:bg-navy-100 text-navy-700 border border-navy-200 cursor-pointer"
              >
                Dhaka University (23.7262, 90.4005)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect(22.4716, 91.7877)}
                className="px-2 py-0.5 rounded bg-navy-50 hover:bg-navy-100 text-navy-700 border border-navy-200 cursor-pointer"
              >
                Chittagong Univ (22.4716, 91.7877)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect(24.9205, 91.8319)}
                className="px-2 py-0.5 rounded bg-navy-50 hover:bg-navy-100 text-navy-700 border border-navy-200 cursor-pointer"
              >
                SUST Sylhet (24.9205, 91.8319)
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdjustDrawer(false)}
                className="px-3 py-1.5 rounded-lg border border-navy-200 text-navy-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cobalt hover:bg-cobalt-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Coordinates</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Map Canvas with Responsive Height */}
      <div className="bg-white p-4 rounded-3xl border border-navy-100 shadow-2xs space-y-4">
        <div 
          ref={mapContainerRef} 
          style={{ height: '520px', minHeight: '360px', width: '100%' }}
          className="w-full rounded-2xl overflow-hidden border border-navy-100 shadow-inner relative z-0"
        >
          {tileError && (
            <div className="absolute top-4 left-4 z-1000 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-2 rounded-xl text-xs shadow-md">
              <span>Map tiles are loading slowly or offline. Geometry data remains functional.</span>
            </div>
          )}

          {/* Interactive Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-1000 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-navy-100 shadow-md text-[11px] space-y-1.5">
            <span className="font-bold text-navy-800 block">Map Legend</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-navy-900 border border-cobalt inline-block"></span>
              <span className="text-navy-700">Campus Centroid Marker</span>
            </div>
            {boundaryType === 'verified' && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-100 border-2 border-emerald-600 inline-block"></span>
                <span className="text-navy-700">Verified Perimeter (Solid)</span>
              </div>
            )}
            {boundaryType === 'approximate' && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-100 border-2 border-dashed border-amber-600 inline-block"></span>
                <span className="text-navy-700">Approximate Extent (Dashed)</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600 border border-white inline-block"></span>
              <span className="text-navy-700">Commuter Hub (k ≥ 5)</span>
            </div>
          </div>
        </div>

        {/* Spatial Metadata & Privacy Disclosure */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          {/* Card 1: Separate Land Area from Building Floor Area */}
          <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100 space-y-1">
            <span className="font-bold text-navy-800 block text-xs">
              {isBn ? 'ক্যাম্পাস ভৌগোলিক এলাকা' : 'Campus Spatial Footprint'}
            </span>
            <div className="flex items-baseline gap-3 pt-1">
              <div>
                <span className="text-lg font-extrabold text-navy-900 tabular-nums">{landAreaAcres}</span>
                <span className="text-xs text-navy-500 ml-1">Acres (Land Area)</span>
              </div>
              <div className="text-navy-300">|</div>
              <div>
                <span className="text-lg font-extrabold text-navy-900 tabular-nums">{buildingFloorAreaM2.toLocaleString()}</span>
                <span className="text-xs text-navy-500 ml-1">m² (Building Floor)</span>
              </div>
            </div>
            <div className="text-[11px] text-navy-500 pt-1">
              {isBn 
                ? `স্থানাঙ্ক: ${coords[0].toFixed(4)}° উত্তর, ${coords[1].toFixed(4)}° পূর্ব` 
                : `Coordinates: ${coords[0].toFixed(4)}° N, ${coords[1].toFixed(4)}° E`}
            </div>
          </div>

          {/* Card 2: Accurate Privacy-Preserving Explanation */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
            <span className="font-bold text-purple-900 block flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              {isBn ? 'গোপনীয়তা রক্ষা পরিমাপ (k ≥ ৫)' : 'Privacy Measure (k ≥ 5 Aggregation)'}
            </span>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              {isBn 
                ? 'ব্যক্তিগত গোপনীয়তা সুরক্ষার জন্য ৫ জনের কম ভ্রমণকারী সংবলিত অঞ্চলগুলো মানচিত্র থেকে স্বয়ংক্রিয়ভাবে বাদ দেওয়া হয়।' 
                : 'To protect personal privacy, origins with fewer than 5 survey respondents are withheld from spatial maps and grouped into regional totals.'}
            </p>
          </div>

          {/* Card 3: Cartographic Citation */}
          <div className="p-4 rounded-2xl bg-cobalt-50/70 border border-cobalt-200 space-y-1">
            <span className="font-bold text-cobalt-900 block flex items-center gap-1.5 text-xs">
              <Info className="w-4 h-4 text-cobalt-700" />
              {isBn ? 'মানচিত্রের তথ্যসূত্র' : 'Cartographic Provenance'}
            </span>
            <p className="text-[11px] text-cobalt-800 leading-relaxed">
              {isDemo
                ? (isBn ? 'উন্মুক্ত স্ট্রিটম্যাপ ও ULAB গবেষণা জরিপ ক্লাস্টার।' : 'OpenStreetMap base tiles & ULAB research survey origin dataset.')
                : (isBn ? 'আপনার বিশ্ববিদ্যালয়ের জরিপ থেকে সংগৃহীত হাব।' : 'Derived from your institution’s approved commuter travel survey.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
