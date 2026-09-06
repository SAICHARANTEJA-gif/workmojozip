import React, { useState, useEffect, useRef } from 'react';
import { Job } from '../../types';
import {
  Navigation,
  MapPin,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
  Radio,
  Star,
  Users,
} from 'lucide-react';

interface MapProps {
  jobs: Job[];
  selectedJobId?: string | null;
  onSelectJob: (job: Job) => void;
  showRouteToJob?: Job | null;
  isLiveTracking?: boolean;
}

export const InteractiveWorkMap: React.FC<MapProps> = ({
  jobs,
  selectedJobId: initialSelectedJobId,
  onSelectJob,
  showRouteToJob,
  isLiveTracking = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan transformation
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Selected Pin for Floating Drawer
  const [activePinJob, setActivePinJob] = useState<Job | null>(
    showRouteToJob || (jobs.length > 0 ? jobs[0] : null)
  );

  // Live GPS Simulation
  const [workerPosProgress, setWorkerPosProgress] = useState(0.2); // 0 to 1 along path
  const [mapLayer, setMapLayer] = useState<'standard' | 'high_wage'>('standard');

  // Base canvas dimensions
  const mapWidth = 600;
  const mapHeight = 520;

  // Real Bangalore Hub Coordinates on canvas
  const getCoordinatesForArea = (area: string, index: number) => {
    const areaLower = area.toLowerCase();
    if (areaLower.includes('apmc') || areaLower.includes('yeshwanthpur')) {
      return { x: 210, y: 130 };
    }
    if (areaLower.includes('koramangala')) {
      return { x: 340, y: 290 };
    }
    if (areaLower.includes('hsr')) {
      return { x: 390, y: 360 };
    }
    if (areaLower.includes('indiranagar')) {
      return { x: 380, y: 210 };
    }
    if (areaLower.includes('btm')) {
      return { x: 290, y: 370 };
    }
    if (areaLower.includes('jayanagar')) {
      return { x: 240, y: 310 };
    }
    if (areaLower.includes('whitefield')) {
      return { x: 480, y: 230 };
    }
    if (areaLower.includes('electronic')) {
      return { x: 410, y: 440 };
    }
    if (areaLower.includes('commercial') || areaLower.includes('mg road')) {
      return { x: 320, y: 190 };
    }

    // Default fallback offsets around Bangalore central
    const fallbackCoords = [
      { x: 320, y: 260 },
      { x: 260, y: 220 },
      { x: 370, y: 320 },
      { x: 280, y: 340 },
      { x: 350, y: 170 },
      { x: 420, y: 270 },
    ];
    return fallbackCoords[index % fallbackCoords.length];
  };

  const workerHomeCoords = { x: 310, y: 300 }; // Near Koramangala / Dairy Circle

  // Target coordinates if navigating to a specific job
  const targetJobCoords = showRouteToJob
    ? getCoordinatesForArea(showRouteToJob.approximateArea, 0)
    : activePinJob
    ? getCoordinatesForArea(activePinJob.approximateArea, 0)
    : null;

  // Smooth live GPS worker movement
  useEffect(() => {
    if (!isLiveTracking || !showRouteToJob) return;

    const interval = setInterval(() => {
      setWorkerPosProgress(prev => {
        if (prev >= 0.96) return 0.2;
        return Number((prev + 0.04).toFixed(2));
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLiveTracking, showRouteToJob]);

  // Current worker animated live GPS position
  const currentWorkerCoords = targetJobCoords
    ? {
        x: workerHomeCoords.x + (targetJobCoords.x - workerHomeCoords.x) * workerPosProgress,
        y: workerHomeCoords.y + (targetJobCoords.y - workerHomeCoords.y) * workerPosProgress,
      }
    : workerHomeCoords;

  // --- MOUSE & TOUCH PANNING ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Recenter Map on Worker
  const handleRecenter = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1.1);
  };

  const displayedJobs =
    mapLayer === 'high_wage' ? jobs.filter(j => j.wage >= 800) : jobs;

  // Open in Real Google Maps
  const handleOpenGoogleMaps = (job: Job) => {
    const query = encodeURIComponent(
      `${job.exactLocation.exactAddress || job.approximateArea}, Bengaluru, Karnataka`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[470px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl select-none touch-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Control Deck */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-700 shadow-md flex items-center gap-1.5">
          <Compass size={14} className="text-amber-400" />
          <span>Bengaluru Urban Grid</span>
        </div>

        {isLiveTracking && (
          <div className="bg-emerald-500 text-slate-950 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
            <Radio size={12} />
            <span>GPS TRACKING LIVE</span>
          </div>
        )}
      </div>

      {/* Map Action Controls (Zoom / Recenter / Layer) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => setZoomLevel(z => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 shadow-md transition-all active:scale-95"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>

        <button
          onClick={() => setZoomLevel(z => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 shadow-md transition-all active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>

        <button
          onClick={handleRecenter}
          className="p-2.5 bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-slate-200 rounded-xl border border-slate-700 shadow-md transition-all active:scale-95"
          title="Recenter on My Location"
        >
          <Crosshair size={16} />
        </button>

        <button
          onClick={() => setMapLayer(l => (l === 'standard' ? 'high_wage' : 'standard'))}
          className={`p-2.5 rounded-xl border shadow-md transition-all active:scale-95 ${
            mapLayer === 'high_wage'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-slate-900/90 text-slate-200 border-slate-700'
          }`}
          title="Filter High Wage (₹800+)"
        >
          <Layers size={16} />
        </button>
      </div>

      {/* SVG Canvas with Dynamic Pan & Zoom Matrix */}
      <svg
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="w-full h-full transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          {/* Street pattern */}
          <pattern id="streetGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1E293B" strokeWidth="1" strokeOpacity="0.6" />
          </pattern>
          {/* Navigation route glow */}
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Map Dark Base Ground */}
        <rect width={mapWidth} height={mapHeight} fill="#090E17" />
        <rect width={mapWidth} height={mapHeight} fill="url(#streetGrid)" />

        {/* --- REAL BANGALORE ARTERIAL ROADS & HIGHWAYS --- */}
        {/* Outer Ring Road (ORR) */}
        <path
          d="M 120 180 Q 200 120, 360 140 T 490 280 T 410 450 T 260 410"
          fill="none"
          stroke="#1E293B"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 120 180 Q 200 120, 360 140 T 490 280 T 410 450 T 260 410"
          fill="none"
          stroke="#334155"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Hosur Road Highway */}
        <path d="M 280 230 L 440 480" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
        <path d="M 280 230 L 440 480" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" />

        {/* Old Airport Road & Indiranagar 100ft */}
        <path d="M 270 200 L 510 200" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <path d="M 380 140 L 380 320" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

        {/* Koramangala 80ft & Sarjapur Road */}
        <path d="M 310 280 L 480 320" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
        <path d="M 230 310 L 360 310" fill="none" stroke="#1E293B" strokeWidth="4" />
        <path d="M 290 310 L 290 420" fill="none" stroke="#1E293B" strokeWidth="4" />

        {/* Bellandur / Agara Lakes */}
        <ellipse cx="440" cy="300" rx="35" ry="22" fill="#0369A1" fillOpacity="0.25" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.4" />
        <text x="415" y="304" fill="#38BDF8" fontSize="8" fontWeight="bold">Bellandur Lake</text>

        <ellipse cx="360" cy="360" rx="26" ry="16" fill="#0369A1" fillOpacity="0.25" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.4" />
        <text x="342" y="363" fill="#38BDF8" fontSize="7" fontWeight="bold">Agara Lake</text>

        {/* Cubbon Park Area */}
        <rect x="230" y="160" width="45" height="30" rx="8" fill="#065F46" fillOpacity="0.25" stroke="#059669" strokeWidth="1" strokeOpacity="0.4" />
        <text x="235" y="178" fill="#34D399" fontSize="7" fontWeight="bold">Cubbon Park</text>

        {/* City Hub Labels */}
        <g fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="middle">
          <text x="340" y="275">Koramangala</text>
          <text x="390" y="345">HSR Layout</text>
          <text x="380" y="195">Indiranagar</text>
          <text x="290" y="395">BTM Layout</text>
          <text x="230" y="330">Jayanagar</text>
          <text x="200" y="115">Yeshwanthpur (APMC)</text>
          <text x="470" y="215">Whitefield</text>
          <text x="410" y="465">Electronic City</text>
        </g>

        {/* Route Path Guidance Line (if navigating) */}
        {showRouteToJob && targetJobCoords && (
          <g>
            <path
              d={`M ${workerHomeCoords.x} ${workerHomeCoords.y} Q ${(workerHomeCoords.x + targetJobCoords.x) / 2 + 20} ${(workerHomeCoords.y + targetJobCoords.y) / 2 - 20}, ${targetJobCoords.x} ${targetJobCoords.y}`}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="5"
              strokeDasharray="7 5"
              strokeLinecap="round"
              filter="url(#routeGlow)"
            />

            {/* Destination Pin */}
            <g transform={`translate(${targetJobCoords.x}, ${targetJobCoords.y})`}>
              <circle r="16" fill="#EF4444" opacity="0.25" className="animate-ping" />
              <circle r="9" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
              <text x="-25" y="-14" fill="#F87171" fontSize="9" fontWeight="bold">
                Workplace
              </text>
            </g>
          </g>
        )}

        {/* Job Pins */}
        {displayedJobs.map((job, idx) => {
          const coords = getCoordinatesForArea(job.approximateArea, idx);
          const isSelected = activePinJob?.id === job.id;

          return (
            <g
              key={job.id}
              transform={`translate(${coords.x}, ${coords.y})`}
              className="cursor-pointer transition-transform hover:scale-115"
              onClick={e => {
                e.stopPropagation();
                setActivePinJob(job);
              }}
            >
              {/* Outer Pulse Halo if selected */}
              {isSelected && (
                <circle r="24" fill="#F59E0B" opacity="0.35" className="animate-ping" />
              )}

              {/* Pin Disc */}
              <circle
                r="18"
                fill={isSelected ? '#F59E0B' : '#0F172A'}
                stroke={isSelected ? '#FEF3C7' : '#F59E0B'}
                strokeWidth="2.5"
                filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))"
              />

              {/* Wage Pill Over Pin */}
              <rect
                x="-24"
                y="-32"
                width="48"
                height="17"
                rx="8.5"
                fill={isSelected ? '#F59E0B' : '#0F172A'}
                stroke={isSelected ? '#FFFFFF' : '#F59E0B'}
                strokeWidth="1.2"
              />
              <text
                x="0"
                y="-20"
                textAnchor="middle"
                fill={isSelected ? '#0F172A' : '#FCD34D'}
                fontSize="9"
                fontWeight="900"
              >
                ₹{job.wage}
              </text>

              {/* Category Icon */}
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fontSize="11"
              >
                {job.category === 'Delivery'
                  ? '🚚'
                  : job.category === 'Cleaning'
                  ? '🧹'
                  : job.category === 'Construction'
                  ? '🏗️'
                  : job.category === 'Gardening'
                  ? '🌿'
                  : job.category === 'Repair'
                  ? '🔧'
                  : '📦'}
              </text>
            </g>
          );
        })}

        {/* Worker Location GPS Pin (Blue with Pulsing Ring) */}
        <g transform={`translate(${currentWorkerCoords.x}, ${currentWorkerCoords.y})`}>
          <circle r="20" fill="#38BDF8" opacity="0.3" className="animate-ping" />
          <circle r="11" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle r="4" fill="#FFFFFF" />
          <text x="-22" y="24" fill="#38BDF8" fontSize="9" fontWeight="bold">
            You (Worker)
          </text>
        </g>
      </svg>

      {/* Floating Bottom Card: Interactive Job Preview Card */}
      {activePinJob && (
        <div
          onClick={e => e.stopPropagation()}
          className="absolute bottom-3 left-3 right-3 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-700/80 shadow-2xl space-y-2.5 animate-in slide-in-from-bottom-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src={activePinJob.image}
                alt={activePinJob.title}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md border border-slate-700">
                    {activePinJob.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {activePinJob.approximateDistanceKm} km away
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white line-clamp-1 mt-0.5">
                  {activePinJob.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin size={11} className="text-amber-400" />
                  <span className="truncate">{activePinJob.approximateArea}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-base font-black text-amber-400">
                ₹{activePinJob.wage}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">per shift</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            {/* Open in Google Maps */}
            <button
              onClick={() => handleOpenGoogleMaps(activePinJob)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              title="Open location in Google Maps"
            >
              <ExternalLink size={13} />
              <span>Google Maps</span>
            </button>

            {/* View Details & Apply */}
            <button
              onClick={() => onSelectJob(activePinJob)}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98"
            >
              <span>View Details & Apply</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
