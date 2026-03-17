/**
 * Home Page - The Machine
 * Main surveillance system interface with privacy disclaimer
 */
import { useState, useEffect } from 'react';
import BootSequence from '@/components/BootSequence';
import PrivacyDisclaimerModal from '@/components/PrivacyDisclaimerModal';
import HUDOverlay from '@/components/HUDOverlay';

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    // Check if user has already accepted privacy terms
    const accepted = localStorage.getItem('machine_privacy_accepted') === 'true';
    if (accepted) {
      setPrivacyAccepted(true);
      setShowDisclaimer(false);
    }
  }, []);

  const handleBootComplete = () => {
    setBootComplete(true);
  };

  const handlePrivacyAccept = () => {
    setPrivacyAccepted(true);
    setShowDisclaimer(false);
  };

  const handlePrivacyReject = () => {
    // Redirect to a safe page or show message
    window.location.href = 'about:blank';
  };

  if (!bootComplete) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <>
      {/* Privacy Disclaimer Modal */}
      {showDisclaimer && (
        <PrivacyDisclaimerModal onAccept={handlePrivacyAccept} onReject={handlePrivacyReject} />
      )}

      {/* Main HUD Interface */}
      {privacyAccepted && (
        <HUDOverlay>
          <div />
        </HUDOverlay>
      )}
    </>
  );
}
