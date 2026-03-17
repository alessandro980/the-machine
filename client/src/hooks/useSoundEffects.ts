/**
 * useSoundEffects Hook
 * Generates and plays synthesized sound effects using Web Audio API
 * Inspired by Person of Interest's distinctive audio cues
 */
import { useCallback, useRef, useEffect } from 'react';

export function useSoundEffects() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Machine "beep" - short high-pitched tone
  const playBeep = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) { /* ignore audio errors */ }
  }, [getContext]);

  // Face detected - ascending tone
  const playFaceDetected = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) { /* ignore */ }
  }, [getContext]);

  // Threat alert - low pulsing tone
  const playThreatAlert = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      const ctx = getContext();
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 200;
        osc.type = 'square';
        const t = ctx.currentTime + i * 0.2;
        gain.gain.setValueAtTime(0.03, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
      }
    } catch (e) { /* ignore */ }
  }, [getContext]);

  // Classification sound - quick double beep
  const playClassification = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      const ctx = getContext();
      [0, 0.08].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 1000;
        osc.type = 'sine';
        const t = ctx.currentTime + delay;
        gain.gain.setValueAtTime(0.03, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
      });
    } catch (e) { /* ignore */ }
  }, [getContext]);

  // Scan sound - sweeping frequency
  const playScan = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1500, ctx.currentTime + 0.3);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { /* ignore */ }
  }, [getContext]);

  // Boot sound - complex layered tones
  const playBoot = useCallback(() => {
    if (!enabledRef.current) return;
    try {
      const ctx = getContext();
      const freqs = [200, 300, 400, 500, 600, 800, 1000];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch (e) { /* ignore */ }
  }, [getContext]);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  return {
    playBeep,
    playFaceDetected,
    playThreatAlert,
    playClassification,
    playScan,
    playBoot,
    setEnabled,
  };
}
