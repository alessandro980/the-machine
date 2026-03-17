/**
 * HUD Overlay Component
 * Renders the surveillance-style heads-up display elements:
 * - Corner brackets, grid lines, data streams
 * - System status bar, timestamp, coordinates
 * - Scanning animation
 */
import { useEffect, useState, memo } from 'react';
import { useMachine } from '@/contexts/MachineContext';

function formatTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

function generateRandomHex(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
}

const DataStream = memo(function DataStream({ side }: { side: 'left' | 'right' }) {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLines(prev => {
        const newLine = `${generateRandomHex(4)} ${generateRandomHex(8)} ${Math.random() > 0.5 ? 'OK' : generateRandomHex(2)}`;
        const updated = [...prev, newLine];
        return updated.slice(-15);
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`absolute top-20 ${side === 'left' ? 'left-2' : 'right-2'} w-36 overflow-hidden pointer-events-none z-10 opacity-30`}>
      <div className="font-mono text-[9px] text-machine-cyan leading-tight">
        {lines.map((line, i) => (
          <div key={i} className="animate-decode" style={{ animationDelay: `${i * 0.05}s` }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
});

export default function HUDOverlay({ children }: { children: React.ReactNode }) {
  const { systemStatus } = useMachine();
  const [time, setTime] = useState(new Date());
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setFrameCount(prev => prev + 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-machine-bg">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[2px] animate-scanline"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.15), transparent)',
          }}
        />
      </div>

      {/* Top status bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-machine-bg/90 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${systemStatus.isOnline ? 'bg-machine-green animate-pulse-glow' : 'bg-machine-red'}`} />
            <span className="font-display text-xs tracking-[0.3em] uppercase text-machine-cyan">
              THE MACHINE
            </span>
          </div>
          <span className="font-mono text-[10px] text-machine-white/40">
            v3.14.159
          </span>
        </div>

        <div className="flex items-center gap-6 font-mono text-[10px]">
          <span className="text-machine-white/50">
            FRAME: {String(frameCount).padStart(8, '0')}
          </span>
          <span className="text-machine-cyan/70">
            {formatTimestamp(time)}
          </span>
          <span className="text-machine-white/50">
            UTC{time.getTimezoneOffset() > 0 ? '-' : '+'}{Math.abs(time.getTimezoneOffset() / 60)}
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span className="text-machine-white/40">
            CAM: <span className={systemStatus.camerasActive > 0 ? 'text-machine-green' : 'text-machine-red'}>{systemStatus.camerasActive}</span>
          </span>
          <span className="text-machine-white/40">
            SUBJ: <span className="text-machine-amber">{systemStatus.subjectsTracked}</span>
          </span>
          <span className="text-machine-white/40">
            THREATS: <span className={systemStatus.threatsDetected > 0 ? 'text-machine-red' : 'text-machine-green'}>{systemStatus.threatsDetected}</span>
          </span>
          <span className={`uppercase tracking-wider ${systemStatus.modelsLoaded ? 'text-machine-green' : 'text-machine-amber animate-pulse'}`}>
            {systemStatus.modelsLoaded ? 'MODELS READY' : 'LOADING...'}
          </span>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-12 left-3 w-8 h-8 border-l-2 border-t-2 border-machine-cyan/30 pointer-events-none z-30 animate-corner-pulse" />
      <div className="absolute top-12 right-3 w-8 h-8 border-r-2 border-t-2 border-machine-cyan/30 pointer-events-none z-30 animate-corner-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-12 left-3 w-8 h-8 border-l-2 border-b-2 border-machine-cyan/30 pointer-events-none z-30 animate-corner-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-12 right-3 w-8 h-8 border-r-2 border-b-2 border-machine-cyan/30 pointer-events-none z-30 animate-corner-pulse" style={{ animationDelay: '0.75s' }} />

      {/* Data streams */}
      <DataStream side="left" />
      <DataStream side="right" />

      {/* Main content */}
      <div className="relative z-20 w-full h-full pt-10">
        {children}
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2 bg-gradient-to-t from-machine-bg/90 to-transparent">
        <div className="font-mono text-[9px] text-machine-white/30">
          NORTHERN LIGHTS // CLASSIFIED // LEVEL 5 ACCESS
        </div>
        <div className="font-mono text-[9px] text-machine-white/30">
          LAT: {(40.7128 + Math.sin(frameCount * 0.01) * 0.001).toFixed(6)} // LON: {(-74.0060 + Math.cos(frameCount * 0.01) * 0.001).toFixed(6)}
        </div>
        <div className="font-mono text-[9px] text-machine-white/30">
          SYS.INTEGRITY: 99.7% // MEM: {(45 + Math.sin(frameCount * 0.05) * 5).toFixed(1)}% // NET: SECURE
        </div>
      </div>

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5, 5, 15, 0.6) 100%)',
        }}
      />
    </div>
  );
}
