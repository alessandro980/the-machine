/**
 * MapTrackingView Component
 * Displays person positions on Google Maps with dark surveillance styling
 * Uses the pre-built MapView component with custom markers
 */
import { useRef, useMemo, useCallback, useState } from 'react';
import { MapView } from '@/components/Map';
import { useMachine } from '@/contexts/MachineContext';
import { CLASSIFICATION_COLORS, CLASSIFICATION_LABELS } from '@/lib/types';
import type { Person, Classification } from '@/lib/types';
import { MapPin, User, Navigation, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';

function createMarkerContent(person: Person): HTMLElement {
  const color = CLASSIFICATION_COLORS[person.classification];
  const div = document.createElement('div');
  div.style.cssText = `
    position: relative;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;

  // Targeting reticle
  const reticle = document.createElement('div');
  reticle.style.cssText = `
    width: 32px;
    height: 32px;
    position: relative;
    border: 1px solid ${color}80;
    background: ${color}15;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Corner brackets
  const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  corners.forEach(corner => {
    const c = document.createElement('div');
    const [v, h] = corner.split('-');
    c.style.cssText = `
      position: absolute;
      ${v}: -2px;
      ${h}: -2px;
      width: 8px;
      height: 8px;
      border-${v}: 2px solid ${color};
      border-${h}: 2px solid ${color};
    `;
    reticle.appendChild(c);
  });

  // Center dot
  const dot = document.createElement('div');
  dot.style.cssText = `
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${color};
    box-shadow: 0 0 8px ${color};
  `;
  reticle.appendChild(dot);

  // Pulse ring for threats
  if (person.classification === 'threat') {
    const pulse = document.createElement('div');
    pulse.style.cssText = `
      position: absolute;
      inset: -4px;
      border: 1px solid ${color}40;
      animation: pulse 2s ease-in-out infinite;
    `;
    reticle.appendChild(pulse);
  }

  div.appendChild(reticle);

  // Label
  const label = document.createElement('div');
  label.style.cssText = `
    margin-top: 4px;
    padding: 2px 6px;
    background: rgba(10, 10, 15, 0.9);
    border: 1px solid ${color}40;
    font-family: 'Rajdhani', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: ${color};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    white-space: nowrap;
    text-align: center;
  `;
  label.textContent = `${person.firstName} ${person.lastName}`.trim();
  div.appendChild(label);

  // Classification sub-label
  const subLabel = document.createElement('div');
  subLabel.style.cssText = `
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    color: ${color}80;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  `;
  subLabel.textContent = CLASSIFICATION_LABELS[person.classification];
  div.appendChild(subLabel);

  return div;
}

// Dark map style
const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3a4a5a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#151525' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a2a3a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1a2535' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050515' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1a3a5a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0d0d1d' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#2a3a4a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#101020' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1a2a3a' }] },
];

export default function MapTrackingView() {
  const { persons, selectedPerson, setSelectedPerson, setActiveView } = useMachine();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const personsWithPosition = useMemo(() => persons.filter(p => p.position), [persons]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // Apply dark styles
    map.setOptions({
      styles: DARK_MAP_STYLES,
      disableDefaultUI: false,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMapReady(true);

    // Add markers for all persons with positions
    personsWithPosition.forEach(person => {
      if (!person.position) return;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: person.position.lat, lng: person.position.lng },
        content: createMarkerContent(person),
        title: `${person.firstName} ${person.lastName}`,
      });

      marker.addListener('click', () => {
        setSelectedPerson(person);
      });

      markersRef.current.push(marker);
    });
  }, [personsWithPosition, setSelectedPerson]);

  const handleZoomIn = () => mapRef.current?.setZoom((mapRef.current.getZoom() || 12) + 1);
  const handleZoomOut = () => mapRef.current?.setZoom((mapRef.current.getZoom() || 12) - 1);
  const handleRecenter = () => {
    mapRef.current?.setCenter({ lat: 40.7128, lng: -74.0060 });
    mapRef.current?.setZoom(12);
  };

  const handleFocusPerson = (person: Person) => {
    if (person.position && mapRef.current) {
      mapRef.current.panTo({ lat: person.position.lat, lng: person.position.lng });
      mapRef.current.setZoom(15);
    }
    setSelectedPerson(person);
  };

  // Classification stats
  const stats = useMemo(() => {
    const counts: Record<Classification, number> = { relevant: 0, irrelevant: 0, threat: 0, admin: 0, unknown: 0 };
    personsWithPosition.forEach(p => counts[p.classification]++);
    return counts;
  }, [personsWithPosition]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-machine-white/5 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-display text-sm font-bold tracking-[0.15em] text-machine-cyan uppercase">
            Position Tracking
          </h2>
          <p className="font-mono text-[10px] text-machine-white/30 mt-1">
            {personsWithPosition.length} SUBJECTS WITH KNOWN POSITIONS
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 font-mono text-[9px]">
            {Object.entries(stats).map(([cls, count]) => count > 0 && (
              <span key={cls} style={{ color: CLASSIFICATION_COLORS[cls as Classification] }}>
                {CLASSIFICATION_LABELS[cls as Classification]}: {count}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={handleZoomIn} className="p-1.5 border border-machine-white/10 text-machine-white/40 hover:text-machine-cyan hover:border-machine-cyan/30 transition-all">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleZoomOut} className="p-1.5 border border-machine-white/10 text-machine-white/40 hover:text-machine-cyan hover:border-machine-cyan/30 transition-all">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleRecenter} className="p-1.5 border border-machine-white/10 text-machine-white/40 hover:text-machine-cyan hover:border-machine-cyan/30 transition-all">
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <MapView
            className="w-full h-full"
            initialCenter={{ lat: 40.7128, lng: -74.0060 }}
            initialZoom={12}
            onMapReady={handleMapReady}
          />

          {/* Map overlay info */}
          <div className="absolute top-3 left-3 font-mono text-[9px] text-machine-cyan/40 pointer-events-none z-10">
            <div>SURVEILLANCE GRID: ACTIVE</div>
            <div>SECTOR: NYC METROPOLITAN</div>
            <div>RESOLUTION: HIGH</div>
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 212, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 212, 255, 0.02) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Side panel for selected person */}
        {selectedPerson && (
          <div className="w-64 border-l border-machine-white/5 p-3 bg-machine-panel/50 shrink-0 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-sm flex items-center justify-center border shrink-0"
                style={{
                  borderColor: `${CLASSIFICATION_COLORS[selectedPerson.classification]}40`,
                  background: `${CLASSIFICATION_COLORS[selectedPerson.classification]}10`,
                }}
              >
                <User className="w-4 h-4" style={{ color: CLASSIFICATION_COLORS[selectedPerson.classification] }} />
              </div>
              <div className="min-w-0">
                <div className="font-display text-xs font-bold text-machine-white truncate">
                  {selectedPerson.firstName} {selectedPerson.lastName}
                </div>
                <div className="font-mono text-[9px]" style={{ color: CLASSIFICATION_COLORS[selectedPerson.classification] }}>
                  {CLASSIFICATION_LABELS[selectedPerson.classification]}
                </div>
              </div>
            </div>

            {selectedPerson.position && (
              <div className="space-y-1.5 font-mono text-[10px] mb-3">
                <div className="flex items-center gap-1.5 text-machine-green/60">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{selectedPerson.position.label}</span>
                </div>
                <div className="text-machine-white/30">LAT: {selectedPerson.position.lat.toFixed(6)}</div>
                <div className="text-machine-white/30">LNG: {selectedPerson.position.lng.toFixed(6)}</div>
              </div>
            )}

            <div className="mb-3">
              <span className="font-mono text-[9px] text-machine-white/30">THREAT LEVEL:</span>
              <div className="mt-1 w-full h-1.5 bg-machine-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${selectedPerson.threatLevel}%`,
                    background: selectedPerson.threatLevel > 70 ? '#e74c3c' :
                      selectedPerson.threatLevel > 40 ? '#f5a623' : '#00d4ff',
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => setActiveView('database')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-machine-cyan/30 text-machine-cyan font-display text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-machine-cyan/10 transition-all"
            >
              <Navigation className="w-3 h-3" />
              VIEW FULL PROFILE
            </button>

            {/* Person list */}
            <div className="mt-4 pt-3 border-t border-machine-white/5">
              <span className="font-mono text-[9px] text-machine-white/20 block mb-2">ALL TRACKED SUBJECTS</span>
              <div className="space-y-1">
                {personsWithPosition.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleFocusPerson(p)}
                    className={`w-full text-left px-2 py-1.5 flex items-center gap-2 transition-all ${
                      selectedPerson?.id === p.id ? 'bg-machine-white/5' : 'hover:bg-machine-white/[0.03]'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: CLASSIFICATION_COLORS[p.classification] }} />
                    <span className="font-mono text-[10px] text-machine-white/50 truncate">
                      {p.firstName} {p.lastName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
