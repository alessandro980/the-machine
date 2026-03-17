/**
 * Privacy Disclaimer Modal
 * Warns user about facial recognition and data collection practices
 */
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface PrivacyDisclaimerModalProps {
  onAccept: () => void;
  onReject: () => void;
}

export default function PrivacyDisclaimerModal({ onAccept, onReject }: PrivacyDisclaimerModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    setScrolled(isAtBottom);
  };

  const handleAccept = () => {
    if (scrolled || accepted) {
      localStorage.setItem('machine_privacy_accepted', 'true');
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-machine-panel border-2 border-machine-red/50 rounded-sm max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-machine-red/30 bg-machine-red/5">
          <AlertTriangle className="w-6 h-6 text-machine-red flex-shrink-0" />
          <div>
            <h1 className="font-display text-lg font-bold text-machine-red uppercase tracking-[0.1em]">
              PRIVACY & LEGAL DISCLAIMER
            </h1>
            <p className="font-mono text-xs text-machine-white/60 mt-1">
              FACIAL RECOGNITION & DATA COLLECTION SYSTEM
            </p>
          </div>
        </div>

        {/* Content */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm text-machine-white/80"
        >
          <section>
            <h2 className="font-bold text-machine-cyan mb-2 uppercase">⚠️ CRITICAL WARNING</h2>
            <p className="text-machine-white/70">
              This application uses facial recognition technology to identify individuals from webcam feeds. By using
              this system, you acknowledge that you are responsible for all legal and ethical implications of its use.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-machine-amber mb-2 uppercase">🔍 Reverse Image Search</h2>
            <p className="text-machine-white/70">
              This system performs reverse image searches to identify people. It may:
            </p>
            <ul className="list-disc list-inside text-machine-white/60 mt-2 space-y-1">
              <li>Extract facial images from your webcam</li>
              <li>Search the internet for matching images</li>
              <li>Identify individuals based on search results</li>
              <li>Collect personal information (names, profiles, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-machine-red mb-2 uppercase">⚖️ Legal Responsibilities</h2>
            <p className="text-machine-white/70">
              You are solely responsible for:
            </p>
            <ul className="list-disc list-inside text-machine-white/60 mt-2 space-y-1">
              <li>Obtaining consent from all individuals being monitored</li>
              <li>Complying with local privacy laws (GDPR, CCPA, etc.)</li>
              <li>Proper data storage and security</li>
              <li>Preventing misuse for stalking, harassment, or doxxing</li>
              <li>Respecting individuals' right to privacy</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-machine-orange mb-2 uppercase">🚫 Prohibited Uses</h2>
            <p className="text-machine-white/70">This system must NOT be used for:</p>
            <ul className="list-disc list-inside text-machine-white/60 mt-2 space-y-1">
              <li>Unauthorized surveillance of individuals</li>
              <li>Stalking, harassment, or doxxing</li>
              <li>Discrimination or profiling</li>
              <li>Violating anyone's privacy rights</li>
              <li>Illegal activities of any kind</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-machine-cyan mb-2 uppercase">📊 Data Collection</h2>
            <p className="text-machine-white/70">This system collects and stores:</p>
            <ul className="list-disc list-inside text-machine-white/60 mt-2 space-y-1">
              <li>Facial images and descriptors</li>
              <li>Identified names and personal information</li>
              <li>Instagram profiles and social media data</li>
              <li>Location data and timestamps</li>
              <li>Threat level assessments</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-machine-green mb-2 uppercase">✅ Best Practices</h2>
            <ul className="list-disc list-inside text-machine-white/60 space-y-1">
              <li>Use only for authorized, lawful purposes</li>
              <li>Inform individuals about monitoring</li>
              <li>Secure all collected data</li>
              <li>Delete data when no longer needed</li>
              <li>Audit your usage regularly</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-machine-white mb-2 uppercase">📝 Disclaimer</h2>
            <p className="text-machine-white/70">
              This application is provided "AS IS" for educational and personal use only. The developers are not
              responsible for misuse, legal violations, or harm caused by this system. By accepting these terms, you
              assume all responsibility for your use of this application.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-machine-white/10 p-4 space-y-3 bg-machine-white/[0.02]">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="accept-terms"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="accept-terms" className="font-mono text-xs text-machine-white/70">
              I have read and understand the privacy implications and legal responsibilities
            </label>
          </div>

          {!scrolled && (
            <div className="text-xs text-machine-amber/80 font-mono">
              ⬇️ Please scroll down to read the full disclaimer
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 px-4 py-2 bg-machine-red/20 border border-machine-red/50 text-machine-red font-mono font-bold uppercase text-sm hover:bg-machine-red/30 transition-all"
            >
              REJECT & EXIT
            </button>
            <button
              onClick={handleAccept}
              disabled={!scrolled && !accepted}
              className="flex-1 px-4 py-2 bg-machine-green/20 border border-machine-green/50 text-machine-green font-mono font-bold uppercase text-sm hover:bg-machine-green/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              ACCEPT & CONTINUE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
