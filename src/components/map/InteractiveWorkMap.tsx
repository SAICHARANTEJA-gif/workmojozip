import React, { useState, useEffect, useRef } from 'react';
import { Job } from '../../types';
import { getCategoryEmoji } from '../../config/categories';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  MapPin,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  ShieldCheck,
  Clock,
  ArrowRight,
  Radio,
  Star,
  Users,
  AlertTriangle,
} from 'lucide-react';

interface MapProps {
  jobs: Job[];
  selectedJobId?: string | null;
  onSelectJob: (job: Job) => void;
  showRouteToJob?: Job | null;
  isLiveTracking?: boolean;
}

// Coordinate resolver for Bangalore & Hyderabad hubs
const resolveJobCoordinates = (job: Job, index: number): [number, number] => {
  if (job.exactLocation?.lat && job.exactLocation?.lng) {
    return [job.exactLocation.lat, job.exactLocation.lng];
  }
  const area = (job.approximateArea || job.exactLocation?.exactAddress || '').toLowerCase();
  if (area.includes('apmc') || area.includes('yeshwanthpur')) return [13.0280, 77.5404];
  if (area.includes('koramangala')) return [12.9352, 77.6245];
  if (area.includes('hsr')) return [12.9121, 77.6446];
  if (area.includes('indiranagar')) return [12.9784, 77.6408];
  if (area.includes('btm')) return [12.9166, 77.6101];
  if (area.includes('jayanagar')) return [12.9308, 77.5838];
  if (area.includes('whitefield')) return [12.9698, 77.7499];
  if (area.includes('electronic')) return [12.8399, 77.6770];
  if (area.includes('commercial') || area.includes('mg road')) return [12.9822, 77.6083];
  if (area.includes('gachibowli')) return [17.4401, 78.3489];
  if (area.includes('madhapur')) return [17.4483, 78.3915];
  if (area.includes('secunderabad')) return [17.4399, 78.4983];

  // Distributed defaults around Bangalore
  const defaults: [number, number][] = [
    [12.9716, 77.5946],
    [12.9538, 77.6101],
    [12.9820, 77.6350],
    [12.9250, 77.5930],
    [12.9420, 77.6520],
    [12.9610, 77.5720],
  ];
  return defaults[index % defaults.length];
};

export const InteractiveWorkMap: React.FC<MapProps> = ({
  jobs,
  selectedJobId: initialSelectedJobId,
  onSelectJob,
  showRouteToJob,
  isLiveTracking = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapLayer, setMapLayer] = useState<'standard' | 'high_wage'>('standard');
  const [activePinJob, setActivePinJob] = useState<Job | null>(
    showRouteToJob || (jobs.length > 0 ? jobs[0] : null)
  );
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Worker reference location (Koramangala Dairy Circle)
  const workerLocation: [number, number] = [12.9360, 77.6080];

  // Filter jobs based on active layer
  const displayedJobs = jobs.filter(j => {
    if (j.status === 'Cancelled' || j.status === 'CANCELLED') return false;
    if (mapLayer === 'high_wage') return j.wage >= 800;
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: workerLocation,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap Tiles Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Create LayerGroup for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      setIsMapLoaded(true);

      // Invalidate size once rendered
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    } catch (err: any) {
      console.warn('[Leaflet] Initialization error:', err);
      setMapError('Map could not initialize. Showing list fallback.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Routing whenever jobs, activeJob, or layer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Worker Location Marker
    const workerHtml = `
      <div class="relative flex items-center justify-center w-9 h-9 bg-[#2563EB] text-white rounded-full border-2 border-white shadow-md">
        <span class="text-sm">👷</span>
        <span class="absolute -top-1 -right-1 w-3 h-3 bg-[#16A34A] rounded-full border border-white"></span>
      </div>
    `;
    const workerIcon = L.divIcon({
      html: workerHtml,
      className: 'wm-worker-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    L.marker(workerLocation, { icon: workerIcon })
      .addTo(layerGroup)
      .bindPopup('<div class="text-xs font-bold text-[#111827]">Your Location (GPS Active)</div>');

    // 2. Job Markers
    const bounds = L.latLngBounds([workerLocation]);

    displayedJobs.forEach((job, idx) => {
      const coords = resolveJobCoordinates(job, idx);
      bounds.extend(coords);

      const isSelected = activePinJob?.id === job.id;
      const isConfirmed = isLiveTracking || (showRouteToJob?.id === job.id);
      const emoji = getCategoryEmoji(job.category);

      // Location privacy: For unconfirmed browse jobs, add privacy circle
      if (!isConfirmed) {
        L.circle(coords, {
          radius: 450,
          color: '#2563EB',
          weight: 1,
          dashArray: '4, 4',
          fillColor: '#DBEAFE',
          fillOpacity: 0.2,
        }).addTo(layerGroup);
      }

      // Marker pin HTML
      const isHighWage = job.wage >= 800;
      const pinHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transition-transform ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'}">
          <div class="flex items-center gap-1 px-2 py-1 rounded-full shadow-md border ${
            isSelected
              ? 'bg-[#2563EB] text-white border-white ring-2 ring-[#F5A900]'
              : isHighWage
              ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
              : 'bg-white text-[#111827] border-[#E2E8F0]'
          }">
            <span class="text-xs">${emoji}</span>
            <span class="text-[11px] font-black">₹${job.wage}</span>
          </div>
          <div class="w-2 h-2 rotate-45 -mt-1 ${isSelected ? 'bg-[#2563EB]' : isHighWage ? 'bg-[#FDE68A]' : 'bg-white'} border-r border-b ${isSelected ? 'border-white' : 'border-[#E2E8F0]'}"></div>
        </div>
      `;

      const jobIcon = L.divIcon({
        html: pinHtml,
        className: 'wm-job-marker',
        iconSize: [60, 36],
        iconAnchor: [30, 36],
      });

      const marker = L.marker(coords, { icon: jobIcon }).addTo(layerGroup);

      // Click on pin selects the job
      marker.on('click', () => {
        setActivePinJob(job);
        onSelectJob(job);
      });

      // Marker Popup
      const popupHtml = `
        <div class="p-1 space-y-1 text-xs text-[#111827]">
          <div class="font-extrabold text-sm text-[#2563EB]">${job.title}</div>
          <div class="text-[#64748B]">₹${job.wage} / shift • ${job.duration || '8 hrs'}</div>
          <div class="text-[11px] text-[#059669] font-bold">
            ${isConfirmed ? '✓ Confirmed Exact Site: ' + (job.exactLocation?.exactAddress || job.approximateArea) : '📍 ' + job.approximateArea + ' (Approx)'}
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
    });

    // 3. If route view or confirmed job, draw polyline route
    if (showRouteToJob) {
      const jobCoords = resolveJobCoordinates(showRouteToJob, 0);
      bounds.extend(jobCoords);

      const routePolyline = L.polyline([workerLocation, jobCoords], {
        color: '#2563EB',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.85,
      }).addTo(layerGroup);

      map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
    }
  }, [displayedJobs, activePinJob, showRouteToJob, isLiveTracking, mapLayer]);

  // Controls Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(workerLocation, 14);
    }
  };

  if (mapError) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm text-center space-y-3">
        <AlertTriangle className="mx-auto text-amber-500" size={32} />
        <h3 className="font-black text-sm text-[#111827]">Live Map Temporarily Unavailable</h3>
        <p className="text-xs text-[#64748B]">You can still browse and apply for all active jobs below.</p>
        <div className="space-y-2 pt-2">
          {jobs.slice(0, 3).map(j => (
            <div
              key={j.id}
              onClick={() => onSelectJob(j)}
              className="p-3 bg-[#F7F9FC] rounded-2xl border border-[#E2E8F0] flex justify-between items-center text-left cursor-pointer"
            >
              <div>
                <div className="font-extrabold text-xs text-[#111827]">{j.title}</div>
                <div className="text-[11px] text-[#64748B]">{j.approximateArea}</div>
              </div>
              <span className="text-xs font-black text-[#2563EB]">₹{j.wage}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-xs bg-[#F8FAFC]">
      {/* Live Map Canvas Wrapper */}
      <div
        ref={mapContainerRef}
        className="w-full h-[380px] sm:h-[440px] z-0"
        style={{ touchAction: 'pan-x pan-y' }}
      />

      {/* Floating Top Controls: Layer Switch & Privacy Shield */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E2E8F0] shadow-xs pointer-events-auto">
          <ShieldCheck size={14} className="text-[#16A34A]" />
          <span className="text-[11px] font-bold text-[#111827]">
            {isLiveTracking ? 'Exact Navigation GPS' : 'Privacy Radius (Approx)'}
          </span>
        </div>

        {/* High Wage Filter Toggle */}
        <button
          type="button"
          onClick={() => setMapLayer(prev => (prev === 'standard' ? 'high_wage' : 'standard'))}
          className={`px-3 py-1.5 rounded-full border text-[11px] font-bold shadow-xs transition-all pointer-events-auto cursor-pointer flex items-center gap-1 ${
            mapLayer === 'high_wage'
              ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
              : 'bg-white/95 text-[#64748B] border-[#E2E8F0]'
          }`}
        >
          <span>🔥</span>
          <span>{mapLayer === 'high_wage' ? 'High Wage (₹800+)' : 'All Gigs'}</span>
        </button>
      </div>

      {/* Map Zoom & Recenter Control Toolbar */}
      <div className="absolute right-3 top-16 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-9 h-9 bg-white hover:bg-[#F1F5F9] text-[#111827] rounded-xl shadow-md border border-[#E2E8F0] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-9 h-9 bg-white hover:bg-[#F1F5F9] text-[#111827] rounded-xl shadow-md border border-[#E2E8F0] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="w-9 h-9 bg-white hover:bg-[#F1F5F9] text-[#2563EB] rounded-xl shadow-md border border-[#E2E8F0] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Center on My Location"
        >
          <Crosshair size={16} />
        </button>
      </div>

      {/* Active Selected Job Bottom Card */}
      {activePinJob && (
        <div className="p-4 bg-white border-t border-[#E2E8F0] space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{getCategoryEmoji(activePinJob.category)}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                  {activePinJob.category}
                </span>
                <span className="text-xs text-[#64748B] font-semibold">• {activePinJob.urgency}</span>
              </div>
              <h4 className="font-extrabold text-sm text-[#111827] leading-snug">{activePinJob.title}</h4>
              <div className="flex items-center gap-3 text-xs text-[#64748B] font-medium pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-[#2563EB]" />
                  <span>{activePinJob.approximateArea}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-[#64748B]" />
                  <span>{activePinJob.startTime}</span>
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-base font-black text-[#2563EB]">₹{activePinJob.wage}</div>
              <div className="text-[10px] text-[#64748B] font-bold">per shift</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectJob(activePinJob)}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <span>View Shift Details & Apply</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
