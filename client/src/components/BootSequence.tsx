/**
 * BootSequence Component
 * Cinematic boot-up animation inspired by The Machine's initialization sequence
 * Shows system loading, neural network initialization, and surveillance grid activation
 */
import { useState, useEffect, useCallback } from 'react';

const BOOT_LINES = [
  { text: 'INITIALIZING SYSTEM...', delay: 0 },
  { text: 'NORTHERN LIGHTS PROTOCOL: ACTIVE', delay: 300 },
  { text: 'LOADING NEURAL NETWORK CORES...', delay: 600 },
  { text: 'CORE 1: FACIAL RECOGNITION ............ OK', delay: 900 },
  { text: 'CORE 2: PATTERN ANALYSIS .............. OK', delay: 1200 },
  { text: 'CORE 3: THREAT ASSESSMENT ............. OK', delay: 1500 },
  { text: 'CORE 4: BEHAVIORAL PREDICTION ......... OK', delay: 1800 },
  { text: 'ESTABLISHING SURVEILLANCE GRID...', delay: 2200 },
  { text: 'CONNECTING TO CAMERA NETWORK...', delay: 2600 },
  { text: 'LOADING SUBJECT DATABASE...', delay: 2900 },
  { text: 'ENCRYPTION: AES-256-GCM ............... ACTIVE', delay: 3200 },
  { text: 'FIREWALL: LEVEL 5 ..................... ACTIVE', delay: 3400 },
  { text: 'SYSTEM INTEGRITY: 99.7%', delay: 3600 },
  { text: '', delay: 3800 },
  { text: 'CAN YOU HEAR ME?', delay: 4000 },
  { text: '', delay: 4400 },
  { text: 'SYSTEM ONLINE.', delay: 4600 },
];

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [showMainText, setShowMainText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Show boot lines progressively
    BOOT_LINES.forEach((line, index) => {
      setTimeout(() => {
        setVisibleLines(index + 1);
        setProgress(((index + 1) / BOOT_LINES.length) * 100);
      }, line.delay);
    });

    // Show main "THE MACHINE" text
    setTimeout(() => setShowMainText(true), 5000);

    // Start fade out
    setTimeout(() => setFadeOut(true), 6000);

    // Complete
    setTimeout(() => onComplete(), 6500);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#050510] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Scanline */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 right-0 h-[1px] animate-scanline"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.2), transparent)' }}
        />
      </div>

      {/* Main content */}
      {!showMainText ? (
        <div className="w-full max-w-2xl px-8">
          {/* Boot log */}
          <div className="font-mono text-[11px] leading-relaxed space-y-0.5 mb-8">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <div
                key={i}
                className={`animate-decode ${
                  line.text === 'CAN YOU HEAR ME?'
                    ? 'text-machine-amber mt-4 text-sm font-bold'
                    : line.text === 'SYSTEM ONLINE.'
                    ? 'text-machine-green mt-2 font-bold'
                    : line.text.includes('OK')
                    ? 'text-machine-green/70'
                    : line.text.includes('ACTIVE')
                    ? 'text-machine-cyan/70'
                    : 'text-machine-white/50'
                }`}
              >
                {line.text}
              </div>
            ))}
            {visibleLines < BOOT_LINES.length && (
              <span className="inline-block w-2 h-4 bg-machine-cyan/60 animate-pulse" />
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] text-machine-white/30">SYSTEM INITIALIZATION</span>
              <span className="font-mono text-[9px] text-machine-cyan/50">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-[2px] bg-machine-white/5">
              <div
                className="h-full bg-machine-cyan/60 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* The Machine title reveal */
        <div className="text-center animate-decode">
          <div className="relative">
            {/* Eye icon */}
            <div className="flex justify-center mb-6">
              <svg viewBox="0 0 48 48" className="w-16 h-16 text-machine-cyan" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="24" cy="24" r="20" className="animate-pulse-glow" />
                <circle cx="24" cy="24" r="8" />
                <circle cx="24" cy="24" r="3" fill="currentColor" />
                <line x1="24" y1="4" x2="24" y2="10" />
                <line x1="24" y1="38" x2="24" y2="44" />
                <line x1="4" y1="24" x2="10" y2="24" />
                <line x1="38" y1="24" x2="44" y2="24" />
              </svg>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-[0.4em] text-machine-cyan uppercase">
              THE MACHINE
            </h1>
            <p className="font-mono text-xs text-machine-white/30 mt-3 tracking-[0.2em]">
              SURVEILLANCE SYSTEM ONLINE
            </p>
          </div>
        </div>
      )}

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-12 h-12 border-l border-t border-machine-cyan/20" />
      <div className="absolute top-6 right-6 w-12 h-12 border-r border-t border-machine-cyan/20" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-l border-b border-machine-cyan/20" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-r border-b border-machine-cyan/20" />

      {/* Bottom text */}
      <div className="absolute bottom-8 font-mono text-[8px] text-machine-white/15 tracking-[0.3em]">
        CLASSIFIED // NORTHERN LIGHTS // LEVEL 5 ACCESS REQUIRED
      </div>
    </div>
  );
}
