import { useCallback, useRef } from 'react';
import { type SoundType } from '@/lib/sounds';

interface SoundOptions {
  volume?: number;
  pitch?: number;
}

/**
 * useSound hook inspired by SoundCN (https://www.soundcn.xyz/)
 * Uses Web Audio API for fast, zero-latency, zero-dependency UI sounds.
 */
export function useSound(soundType: SoundType = 'click', options: SoundOptions = {}) {
  const { volume = 0.5, pitch = 1.0 } = options;
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSynthesized = useCallback((type: SoundType) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'click':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(200 * pitch, now + 0.04);
        gain.gain.setValueAtTime(volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
        break;

      case 'pop':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(650 * pitch, now + 0.06);
        gain.gain.setValueAtTime(volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
        break;

      case 'switch':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440 * pitch, now);
        osc.frequency.setValueAtTime(660 * pitch, now + 0.03);
        gain.gain.setValueAtTime(volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;

      case 'success':
        // Two-tone cheerful chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25 * pitch, now); // C5
        osc.frequency.setValueAtTime(659.25 * pitch, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99 * pitch, now + 0.16); // G5
        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'tap':
      default:
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(140 * pitch, now + 0.03);
        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
    }
  }, [getAudioContext, pitch, volume]);

  const play = useCallback((overrideType?: SoundType) => {
    try {
      const type = overrideType || soundType;
      playSynthesized(type);
    } catch {
      // Audio playback best effort
    }
  }, [playSynthesized, soundType]);

  return [play] as const;
}

export default useSound;
