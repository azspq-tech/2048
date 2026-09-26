import { useCallback, useRef } from 'react';

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported
    }
  }, [getCtx]);

  const playMove = useCallback(() => {
    playTone(220, 0.08, 'sine', 0.08);
  }, [playTone]);

  const playMerge = useCallback((value: number) => {
    const freq = 300 + Math.log2(value) * 80;
    playTone(freq, 0.15, 'triangle', 0.12);
    setTimeout(() => playTone(freq * 1.5, 0.1, 'sine', 0.08), 50);
  }, [playTone]);

  const playWin = useCallback(() => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.15), i * 120);
    });
  }, [playTone]);

  const playLose = useCallback(() => {
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.4, 'sawtooth', 0.08), i * 150);
    });
  }, [playTone]);

  const playNewTile = useCallback(() => {
    playTone(600, 0.06, 'sine', 0.05);
  }, [playTone]);

  return { playMove, playMerge, playWin, playLose, playNewTile };
}
