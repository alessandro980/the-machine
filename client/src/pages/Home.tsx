/**
 * Home Page - The Machine Main Interface
 * Combines boot sequence, HUD overlay, navigation sidebar, and all view panels
 * Includes sound effects integration
 */
import { useState, useCallback, useEffect } from 'react';
import { useMachine } from '@/contexts/MachineContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import HUDOverlay from '@/components/HUDOverlay';
import NavigationSidebar from '@/components/NavigationSidebar';
import SurveillanceView from '@/components/SurveillanceView';
import DatabaseView from '@/components/DatabaseView';
import MapTrackingView from '@/components/MapTrackingView';
import TimelineView from '@/components/TimelineView';
import BootSequence from '@/components/BootSequence';
import { Volume2, VolumeX } from 'lucide-react';

export default function Home() {
  const { activeView } = useMachine();
  const [booted, setBooted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playBoot, setEnabled } = useSoundEffects();

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  // Play boot sound when boot sequence starts
  useEffect(() => {
    if (!booted) {
      // Small delay to ensure AudioContext is ready after user interaction
      const timer = setTimeout(() => {
        playBoot();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [booted, playBoot]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setEnabled(newState);
  };

  return (
    <>
      {!booted && <BootSequence onComplete={handleBootComplete} />}
      <HUDOverlay>
        <div className="flex h-full">
          <NavigationSidebar />
          <div className="flex-1 overflow-hidden relative">
            {activeView === 'surveillance' && <SurveillanceView />}
            {activeView === 'database' && <DatabaseView />}
            {activeView === 'map' && <MapTrackingView />}
            {activeView === 'timeline' && <TimelineView />}

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="absolute top-2 right-3 z-30 p-1.5 text-machine-white/20 hover:text-machine-white/50 transition-colors"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </HUDOverlay>
    </>
  );
}
