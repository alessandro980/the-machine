/**
 * SurveillanceView Component
 * Main surveillance camera view with webcam feed, face detection overlays,
 * and real-time HUD elements
 */
import { useCallback, useEffect, useState } from 'react';
import { useMachine } from '@/contexts/MachineContext';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import FaceBox from './FaceBox';
import type { DetectedFace } from '@/lib/types';
import { Camera, CameraOff, Eye, Shield, AlertTriangle } from 'lucide-react';

export default function SurveillanceView() {
  const {
    persons,
    detectedFaces,
    setDetectedFaces,
    updateSystemStatus,
    setSelectedPerson,
    setActiveView,
    systemStatus,
  } = useMachine();

  const [showStats, setShowStats] = useState(true);

  const handleFacesDetected = useCallback((faces: DetectedFace[]) => {
    setDetectedFaces(faces);
    const threats = faces.filter(f => f.classification === 'threat').length;
    updateSystemStatus({
      subjectsTracked: faces.length,
      threatsDetected: threats,
    });
  }, [setDetectedFaces, updateSystemStatus]);

  const handleStatusChange = useCallback((status: { modelsLoaded: boolean; camerasActive: number }) => {
    updateSystemStatus(status);
  }, [updateSystemStatus]);

  const {
    videoRef,
    isModelLoaded,
    isCameraOn,
    error,
    startCamera,
    stopCamera,
  } = useFaceDetection({
    persons,
    onFacesDetected: handleFacesDetected,
    onStatusChange: handleStatusChange,
  });

  const handleFaceClick = useCallback((face: DetectedFace) => {
    if (face.matchedPerson) {
      setSelectedPerson(face.matchedPerson);
      setActiveView('database');
    }
  }, [setSelectedPerson, setActiveView]);

  // Classification counts
  const relevantCount = detectedFaces.filter(f => f.classification === 'relevant').length;
  const irrelevantCount = detectedFaces.filter(f => f.classification === 'irrelevant').length;
  const threatCount = detectedFaces.filter(f => f.classification === 'threat').length;
  const unknownCount = detectedFaces.filter(f => f.classification === 'unknown').length;

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Camera feed area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {!isCameraOn ? (
          /* Idle state */
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <Eye className="w-16 h-16 text-machine-cyan/30" />
              <div className="absolute inset-0 animate-pulse-glow">
                <Eye className="w-16 h-16 text-machine-cyan/60" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold tracking-[0.15em] text-machine-cyan/80 uppercase mb-2">
                Surveillance System
              </h2>
              <p className="font-mono text-xs text-machine-white/40 max-w-md">
                {!isModelLoaded
                  ? 'INITIALIZING NEURAL NETWORKS... LOADING FACE RECOGNITION MODELS...'
                  : 'SYSTEM READY. ACTIVATE CAMERA FEED TO BEGIN SURVEILLANCE.'}
              </p>
              {!isModelLoaded && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-32 h-1 bg-machine-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-machine-cyan/60 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                  <span className="font-mono text-[10px] text-machine-cyan/50">LOADING</span>
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 px-4 py-2 bg-machine-red/10 border border-machine-red/30 rounded">
                <AlertTriangle className="w-4 h-4 text-machine-red" />
                <span className="font-mono text-xs text-machine-red">{error}</span>
              </div>
            )}
            <button
              onClick={startCamera}
              disabled={!isModelLoaded}
              className="flex items-center gap-3 px-6 py-3 bg-machine-cyan/10 border border-machine-cyan/40 text-machine-cyan font-display text-sm font-bold tracking-[0.15em] uppercase hover:bg-machine-cyan/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5" />
              ACTIVATE CAMERA
            </button>
          </div>
        ) : (
          /* Active camera view */
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Video overlay effects */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(10,10,15,0.3) 0%, transparent 20%, transparent 80%, rgba(10,10,15,0.3) 100%)',
              }}
            />

            {/* Noise overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Face detection overlays - mirrored to match video */}
            <div className="absolute inset-0" style={{ transform: 'scaleX(-1)' }}>
              {detectedFaces.map(face => (
                <FaceBox
                  key={face.id}
                  face={face}
                  onClick={() => handleFaceClick(face)}
                />
              ))}
            </div>

            {/* Camera info overlay */}
            <div className="absolute top-2 left-3 font-mono text-[10px] text-machine-cyan/60">
              <div>FEED: CAM_01 // LIVE</div>
              <div>RES: {videoRef.current?.videoWidth || 1280}x{videoRef.current?.videoHeight || 720}</div>
              <div>FPS: 30 // CODEC: H.264</div>
            </div>

            {/* Recording indicator */}
            <div className="absolute top-2 right-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-machine-red animate-pulse" />
              <span className="font-mono text-[10px] text-machine-red/80">REC</span>
            </div>

            {/* Stop camera button */}
            <button
              onClick={stopCamera}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-machine-bg/80 border border-machine-red/40 text-machine-red font-mono text-xs hover:bg-machine-red/10 transition-all z-10"
            >
              <CameraOff className="w-4 h-4" />
              DEACTIVATE
            </button>
          </div>
        )}
      </div>

      {/* Bottom stats panel */}
      {isCameraOn && showStats && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-machine-bg/95 to-machine-bg/60 px-4 py-3 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-machine-cyan/60" />
                <span className="font-mono text-[10px] text-machine-white/50">SUBJECTS:</span>
                <span className="font-display text-sm font-bold text-machine-cyan">{detectedFaces.length}</span>
              </div>

              <div className="flex items-center gap-4 font-mono text-[10px]">
                <span className="text-[#f5a623]">
                  <span className="text-machine-white/40">REL: </span>{relevantCount}
                </span>
                <span className="text-[#8899aa]">
                  <span className="text-machine-white/40">IRR: </span>{irrelevantCount}
                </span>
                <span className="text-[#e74c3c]">
                  <span className="text-machine-white/40">THR: </span>{threatCount}
                </span>
                <span className="text-[#555555]">
                  <span className="text-machine-white/40">UNK: </span>{unknownCount}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {threatCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-machine-red/10 border border-machine-red/30 animate-threat-flash">
                  <Shield className="w-3.5 h-3.5 text-machine-red" />
                  <span className="font-display text-[11px] font-bold text-machine-red tracking-wider uppercase">
                    THREAT DETECTED
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
