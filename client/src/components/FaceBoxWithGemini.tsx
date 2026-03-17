/**
 * FaceBoxWithGemini Component
 * Enhanced FaceBox that shows Gemini identification results
 * Displays identified name, profession, and confidence
 */
import { memo, useState, useEffect } from 'react';
import type { DetectedFace } from '@/lib/types';
import { CLASSIFICATION_COLORS, CLASSIFICATION_LABELS } from '@/lib/types';
import type { GeminiIdentificationResult } from '@/lib/geminiReverseSearchService';

function generateRandomHex(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16))
    .join('')
    .toUpperCase();
}

const FaceBoxWithGemini = memo(function FaceBoxWithGemini({
  face,
  geminiResult,
  isIdentifying,
  onClick,
}: {
  face: DetectedFace;
  geminiResult?: GeminiIdentificationResult | null;
  isIdentifying?: boolean;
  onClick?: () => void;
}) {
  const { box, classification, matchedPerson, confidence, expression } = face;
  const color = CLASSIFICATION_COLORS[classification];
  const label = CLASSIFICATION_LABELS[classification];
  const [decodedText, setDecodedText] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  // Use Gemini result if available, otherwise use matched person
  const displayName = geminiResult?.fullName || matchedPerson
    ? `${matchedPerson?.firstName || ''} ${matchedPerson?.lastName || ''}`.trim()
    : null;

  useEffect(() => {
    if (isIdentifying) {
      setDecodedText('GEMINI ANALYZING...');
    } else if (displayName) {
      let i = 0;
      const interval = setInterval(() => {
        if (i <= displayName.length) {
          setDecodedText(
            displayName.substring(0, i) + (i < displayName.length ? generateRandomHex(displayName.length - i) : '')
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
  }, [displayName, isIdentifying]);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const x = box.x;
  const y = box.y;
  const w = box.width;
  const h = box.height;

  // Confidence percentage
  const confidencePercent = Math.round((geminiResult?.confidence || confidence) * 100);

  // Get profession from Gemini if available
  const profession = geminiResult?.profession || 'UNKNOWN';

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer group"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
      }}
    >
      {/* Outer reticle - corners */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderColor: color,
        }}
      >
        {/* Top-left corner */}
        <div
          className="absolute top-0 left-0 w-3 h-3"
          style={{
            borderTop: `2px solid ${color}`,
            borderLeft: `2px solid ${color}`,
          }}
        />
        {/* Top-right corner */}
        <div
          className="absolute top-0 right-0 w-3 h-3"
          style={{
            borderTop: `2px solid ${color}`,
            borderRight: `2px solid ${color}`,
          }}
        />
        {/* Bottom-left corner */}
        <div
          className="absolute bottom-0 left-0 w-3 h-3"
          style={{
            borderBottom: `2px solid ${color}`,
            borderLeft: `2px solid ${color}`,
          }}
        />
        {/* Bottom-right corner */}
        <div
          className="absolute bottom-0 right-0 w-3 h-3"
          style={{
            borderBottom: `2px solid ${color}`,
            borderRight: `2px solid ${color}`,
          }}
        />
      </div>

      {/* Center targeting dot */}
      <div
        className="absolute top-1/2 left-1/2 w-1 h-1 transform -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: color }}
      />

      {/* Scanning line */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          top: `${scanProgress}%`,
          backgroundColor: color,
          opacity: 0.5,
        }}
      />

      {/* Data readout - Top */}
      <div className="absolute -top-8 left-0 font-mono text-xs whitespace-nowrap pointer-events-none" style={{ color }}>
        <div className="font-bold tracking-wider">{label}</div>
        <div className="text-machine-white/60">{decodedText}</div>
      </div>

      {/* Confidence display - Top right */}
      <div className="absolute -top-8 right-0 font-mono text-xs text-machine-white/60 pointer-events-none">
        CONF: {confidencePercent}%
      </div>

      {/* Gemini identification info - Bottom */}
      {geminiResult?.success && (
        <div className="absolute -bottom-12 left-0 font-mono text-xs pointer-events-none space-y-1">
          <div style={{ color }}>
            <span className="font-bold">ID:</span> {geminiResult.fullName}
          </div>
          {geminiResult.profession && (
            <div className="text-machine-cyan/70">
              <span className="font-bold">PROF:</span> {geminiResult.profession}
            </div>
          )}
          {geminiResult.notableFacts && geminiResult.notableFacts.length > 0 && (
            <div className="text-machine-amber/60 text-xs">
              <span className="font-bold">FACTS:</span> {geminiResult.notableFacts[0]}
            </div>
          )}
        </div>
      )}

      {/* Identifying indicator */}
      {isIdentifying && (
        <div className="absolute -bottom-6 left-0 font-mono text-xs text-machine-green animate-pulse">
          [GEMINI PROCESSING...]
        </div>
      )}

      {/* Expression indicator - Bottom right */}
      {expression && (
        <div className="absolute -bottom-8 right-0 font-mono text-xs text-machine-white/60 pointer-events-none">
          {expression}
        </div>
      )}
    </div>
  );
});

export default FaceBoxWithGemini;
