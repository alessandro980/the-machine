/**
 * FaceBox Component
 * Renders a HUD-style targeting reticle around detected faces
 * with classification colors, coordinates, and data readouts
 */
import { memo, useState, useEffect } from 'react';
import type { DetectedFace, Classification } from '@/lib/types';
import { CLASSIFICATION_COLORS, CLASSIFICATION_LABELS } from '@/lib/types';

function generateRandomHex(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
}

const FaceBox = memo(function FaceBox({
  face,
  onClick,
}: {
  face: DetectedFace;
  onClick?: () => void;
}) {
  const { box, classification, matchedPerson, confidence, expression } = face;
  const color = CLASSIFICATION_COLORS[classification];
  const label = CLASSIFICATION_LABELS[classification];
  const [decodedText, setDecodedText] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (matchedPerson) {
      const fullName = `${matchedPerson.firstName} ${matchedPerson.lastName}`.trim();
      let i = 0;
      const interval = setInterval(() => {
        if (i <= fullName.length) {
          setDecodedText(
            fullName.substring(0, i) +
            (i < fullName.length ? generateRandomHex(fullName.length - i) : '')
          );
          i++;
        } else {
          clearInterval(interval);
        }
      }, 40);
      return () => clearInterval(interval);
    } else {
      setDecodedText('ANALYZING...');
    }
  }, [matchedPerson]);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const cornerSize = Math.min(box.width, box.height) * 0.2;
  const cornerThickness = 2;

  return (
    <div
      className="absolute animate-lock-on cursor-pointer group"
      style={{
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
      }}
      onClick={onClick}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-1 opacity-20"
        style={{
          boxShadow: `0 0 15px ${color}, 0 0 30px ${color}40`,
        }}
      />

      {/* Corner brackets */}
      {/* Top-left */}
      <div className="absolute animate-corner-pulse" style={{
        top: -1, left: -1,
        width: cornerSize, height: cornerThickness,
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }} />
      <div className="absolute animate-corner-pulse" style={{
        top: -1, left: -1,
        width: cornerThickness, height: cornerSize,
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }} />

      {/* Top-right */}
      <div className="absolute animate-corner-pulse" style={{
        top: -1, right: -1,
        width: cornerSize, height: cornerThickness,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animationDelay: '0.3s',
      }} />
      <div className="absolute animate-corner-pulse" style={{
        top: -1, right: -1,
        width: cornerThickness, height: cornerSize,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animationDelay: '0.3s',
      }} />

      {/* Bottom-left */}
      <div className="absolute animate-corner-pulse" style={{
        bottom: -1, left: -1,
        width: cornerSize, height: cornerThickness,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animationDelay: '0.6s',
      }} />
      <div className="absolute animate-corner-pulse" style={{
        bottom: -1, left: -1,
        width: cornerThickness, height: cornerSize,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animationDelay: '0.6s',
      }} />

      {/* Bottom-right */}
      <div className="absolute animate-corner-pulse" style={{
        bottom: -1, right: -1,
        width: cornerSize, height: cornerThickness,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animationDelay: '0.9s',
      }} />
      <div className="absolute animate-corner-pulse" style={{
        bottom: -1, right: -1,
        width: cornerThickness, height: cornerSize,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animationDelay: '0.9s',
      }} />

      {/* Scan line inside box */}
      <div className="absolute left-0 right-0 h-[1px] opacity-40" style={{
        top: `${scanProgress}%`,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />

      {/* Classification label - top */}
      <div
        className="absolute -top-6 left-0 flex items-center gap-2"
        style={{ color }}
      >
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
        <span className="font-display text-[11px] font-bold tracking-[0.2em] uppercase">
          {label}
        </span>
      </div>

      {/* Name / ID - bottom */}
      <div className="absolute -bottom-5 left-0 right-0">
        <div className="font-mono text-[10px] tracking-wider" style={{ color }}>
          {decodedText}
        </div>
      </div>

      {/* Confidence & expression - right side */}
      <div className="absolute top-0 -right-2 translate-x-full flex flex-col gap-0.5 pl-2">
        <span className="font-mono text-[9px] text-machine-white/60">
          CONF: {(confidence * 100).toFixed(1)}%
        </span>
        {expression && (
          <span className="font-mono text-[9px] text-machine-white/40 uppercase">
            EXPR: {expression}
          </span>
        )}
        <span className="font-mono text-[9px] text-machine-white/30">
          ID: {face.id.substring(0, 8)}
        </span>
      </div>

      {/* Threat level indicator for matched persons */}
      {matchedPerson && matchedPerson.threatLevel > 0 && (
        <div className="absolute -bottom-12 left-0 flex items-center gap-1">
          <span className="font-mono text-[9px] text-machine-white/40">THR:</span>
          <div className="w-16 h-1 bg-machine-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${matchedPerson.threatLevel}%`,
                background: matchedPerson.threatLevel > 70 ? '#e74c3c' :
                  matchedPerson.threatLevel > 40 ? '#f5a623' : '#00d4ff',
              }}
            />
          </div>
          <span className="font-mono text-[9px]" style={{
            color: matchedPerson.threatLevel > 70 ? '#e74c3c' :
              matchedPerson.threatLevel > 40 ? '#f5a623' : '#00d4ff',
          }}>
            {matchedPerson.threatLevel}
          </span>
        </div>
      )}

      {/* Crosshair center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-3 h-[1px] opacity-30" style={{ background: color }} />
        <div className="w-[1px] h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" style={{ background: color }} />
      </div>

      {/* Hover info panel */}
      {matchedPerson && (
        <div className="absolute top-0 -left-2 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-machine-bg/90 border border-machine-cyan/20 p-2 min-w-[140px]" style={{ borderColor: `${color}40` }}>
            <div className="font-display text-xs font-bold" style={{ color }}>
              {matchedPerson.firstName} {matchedPerson.lastName}
            </div>
            {matchedPerson.alias && (
              <div className="font-mono text-[9px] text-machine-white/50">
                AKA: {matchedPerson.alias}
              </div>
            )}
            {matchedPerson.publicInfo.occupation && (
              <div className="font-mono text-[9px] text-machine-white/40 mt-1">
                {matchedPerson.publicInfo.occupation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default FaceBox;
