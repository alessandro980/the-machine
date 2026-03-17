/**
 * NavigationSidebar Component
 * Vertical sidebar navigation with Machine-style icons and labels
 */
import { useMachine } from '@/contexts/MachineContext';
import { Camera, Database, Map, Clock, Info } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'surveillance' as const, icon: Camera, label: 'SURVEILLANCE', shortLabel: 'CAM' },
  { id: 'database' as const, icon: Database, label: 'DATABASE', shortLabel: 'DB' },
  { id: 'map' as const, icon: Map, label: 'TRACKING', shortLabel: 'MAP' },
  { id: 'timeline' as const, icon: Clock, label: 'TIMELINE', shortLabel: 'LOG' },
];

export default function NavigationSidebar() {
  const { activeView, setActiveView, systemStatus, persons } = useMachine();
  const [showAbout, setShowAbout] = useState(false);

  const threatCount = persons.filter(p => p.classification === 'threat').length;

  return (
    <div className="w-16 h-full bg-machine-bg border-r border-machine-white/5 flex flex-col items-center py-3 relative">
      {/* Machine logo */}
      <div className="mb-6 relative group">
        <div className="w-9 h-9 rounded-sm border border-machine-cyan/30 flex items-center justify-center bg-machine-cyan/5 relative overflow-hidden">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-machine-cyan" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
          {/* Pulse ring */}
          <div className="absolute inset-0 border border-machine-cyan/20 rounded-sm animate-pulse-glow" />
        </div>
        {/* Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-machine-bg/95 border border-machine-cyan/20 px-2 py-1 whitespace-nowrap">
            <span className="font-display text-[10px] text-machine-cyan tracking-wider">THE MACHINE</span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {NAV_ITEMS.map(item => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`relative w-11 h-11 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 group ${
                isActive
                  ? 'text-machine-cyan bg-machine-cyan/10'
                  : 'text-machine-white/30 hover:text-machine-white/60 hover:bg-machine-white/[0.03]'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-machine-cyan" />
              )}

              <Icon className="w-4 h-4" />
              <span className="font-mono text-[7px] tracking-wider">{item.shortLabel}</span>

              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-machine-bg/95 border border-machine-white/10 px-2 py-1 whitespace-nowrap">
                  <span className="font-display text-[10px] text-machine-white/70 tracking-wider">{item.label}</span>
                </div>
              </div>

              {/* Notification badge for threats */}
              {item.id === 'surveillance' && systemStatus.threatsDetected > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-machine-red flex items-center justify-center animate-pulse">
                  <span className="font-mono text-[6px] text-white font-bold">{systemStatus.threatsDetected}</span>
                </div>
              )}
              {item.id === 'database' && threatCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-machine-amber flex items-center justify-center">
                  <span className="font-mono text-[6px] text-machine-bg font-bold">{threatCount}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom - system status */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        <div className={`w-2 h-2 rounded-full ${systemStatus.isOnline ? 'bg-machine-green' : 'bg-machine-red'} animate-pulse-glow`} />
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="text-machine-white/20 hover:text-machine-white/40 transition-colors group relative"
        >
          <Info className="w-3.5 h-3.5" />
          <div className="absolute left-full ml-2 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="bg-machine-bg/95 border border-machine-white/10 px-3 py-2 whitespace-nowrap min-w-[160px]">
              <div className="font-display text-[10px] text-machine-cyan tracking-wider mb-1">SYSTEM INFO</div>
              <div className="font-mono text-[8px] text-machine-white/40 space-y-0.5">
                <div>STATUS: {systemStatus.isOnline ? 'ONLINE' : 'OFFLINE'}</div>
                <div>MODELS: {systemStatus.modelsLoaded ? 'LOADED' : 'PENDING'}</div>
                <div>CAMERAS: {systemStatus.camerasActive}</div>
                <div>SUBJECTS: {persons.length}</div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
