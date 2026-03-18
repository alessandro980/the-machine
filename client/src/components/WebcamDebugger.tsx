/**
 * WebcamDebugger Component
 * Helps diagnose webcam issues with detailed logging
 */
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function WebcamDebugger() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<{
    browserSupport: boolean;
    permissionStatus: string;
    deviceFound: boolean;
    streamActive: boolean;
    videoPlaying: boolean;
    error: string | null;
  }>({
    browserSupport: false,
    permissionStatus: 'unknown',
    deviceFound: false,
    streamActive: false,
    videoPlaying: false,
    error: null,
  });

  useEffect(() => {
    async function diagnose() {
      try {
        // Check browser support
        const hasSupport = !!navigator.mediaDevices?.getUserMedia;
        setStatus(prev => ({ ...prev, browserSupport: hasSupport }));

        if (!hasSupport) {
          setStatus(prev => ({
            ...prev,
            error: 'Browser does not support getUserMedia API',
          }));
          return;
        }

        // Check permission status
        if (navigator.permissions?.query) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
            setStatus(prev => ({ ...prev, permissionStatus: permissionStatus.state }));
          } catch (e) {
            console.log('Permission query not supported');
          }
        }

        // Try to enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setStatus(prev => ({ ...prev, deviceFound: videoDevices.length > 0 }));

        if (videoDevices.length === 0) {
          setStatus(prev => ({
            ...prev,
            error: 'No camera devices found',
          }));
          return;
        }

        // Try to get stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });

        setStatus(prev => ({ ...prev, streamActive: true }));

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onplay = () => {
            setStatus(prev => ({ ...prev, videoPlaying: true }));
          };

          videoRef.current.onerror = (err) => {
            setStatus(prev => ({
              ...prev,
              error: `Video error: ${err}`,
            }));
          };

          try {
            await videoRef.current.play();
          } catch (playErr) {
            setStatus(prev => ({
              ...prev,
              error: `Play error: ${playErr}`,
            }));
          }
        }

        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (error) {
        const err = error as Error & { name?: string };
        let errorMsg = 'Unknown error';

        if (err.name === 'NotAllowedError') {
          errorMsg = 'Camera permission denied by user';
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'No camera device found';
        } else if (err.name === 'NotReadableError') {
          errorMsg = 'Camera is in use by another application';
        } else if (err.message) {
          errorMsg = err.message;
        }

        setStatus(prev => ({
          ...prev,
          error: errorMsg,
        }));
      }
    }

    diagnose();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-machine-dark border border-machine-cyan/30 rounded p-4 font-mono text-xs space-y-2 z-50">
      <div className="text-machine-cyan font-bold mb-3">WEBCAM DIAGNOSTICS</div>

      <div className="space-y-2 text-machine-white/70">
        <div className="flex items-center gap-2">
          {status.browserSupport ? (
            <CheckCircle className="w-4 h-4 text-machine-green" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-machine-red" />
          )}
          <span>Browser Support: {status.browserSupport ? 'OK' : 'FAILED'}</span>
        </div>

        <div className="flex items-center gap-2">
          {status.deviceFound ? (
            <CheckCircle className="w-4 h-4 text-machine-green" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-machine-red" />
          )}
          <span>Camera Device: {status.deviceFound ? 'FOUND' : 'NOT FOUND'}</span>
        </div>

        <div className="flex items-center gap-2">
          {status.streamActive ? (
            <CheckCircle className="w-4 h-4 text-machine-green" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-machine-red" />
          )}
          <span>Stream Active: {status.streamActive ? 'YES' : 'NO'}</span>
        </div>

        <div className="flex items-center gap-2">
          {status.videoPlaying ? (
            <CheckCircle className="w-4 h-4 text-machine-green" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-machine-red" />
          )}
          <span>Video Playing: {status.videoPlaying ? 'YES' : 'NO'}</span>
        </div>

        <div className="text-machine-white/50">
          Permission: <span className="text-machine-cyan">{status.permissionStatus}</span>
        </div>

        {status.error && (
          <div className="text-machine-red mt-2 p-2 bg-machine-red/10 rounded border border-machine-red/30">
            ERROR: {status.error}
          </div>
        )}
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-32 object-cover rounded mt-3 hidden"
      />
    </div>
  );
}
