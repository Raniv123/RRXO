import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Current fantasy id (e.g., "hotel-stranger"). Empty/null = stop. */
  fantasyId: string;
}

const BASE_URL = `${import.meta.env.BASE_URL ?? '/'}audio/`;
const TARGET_VOLUME = 0.32;
const FADE_DURATION_MS = 1800;

/** Tween a value over time using rAF */
function tween(from: number, to: number, ms: number, onUpdate: (v: number) => void): () => void {
  const start = performance.now();
  let id = 0;
  function frame(now: number) {
    const t = Math.min(1, (now - start) / ms);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    onUpdate(from + (to - from) * eased);
    if (t < 1) id = requestAnimationFrame(frame);
  }
  id = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(id);
}

export default function AmbientAudio({ fantasyId }: Props) {
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<'A' | 'B'>('A');
  const currentSrcRef = useRef<string>('');
  const cancelFadeRef = useRef<(() => void) | null>(null);

  const [muted, setMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // First interaction unmutes by default
  useEffect(() => {
    function onFirstInteract() {
      setHasInteracted(true);
      // Best effort: try to start audio after first gesture
      if (muted) setMuted(false);
      window.removeEventListener('pointerdown', onFirstInteract);
      window.removeEventListener('keydown', onFirstInteract);
    }
    window.addEventListener('pointerdown', onFirstInteract, { once: true });
    window.addEventListener('keydown', onFirstInteract, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstInteract);
      window.removeEventListener('keydown', onFirstInteract);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Init audio elements once
  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.preload = 'auto';
    a.crossOrigin = 'anonymous';
    a.volume = 0;
    const b = new Audio();
    b.loop = true;
    b.preload = 'auto';
    b.crossOrigin = 'anonymous';
    b.volume = 0;
    audioARef.current = a;
    audioBRef.current = b;
    return () => {
      a.pause(); b.pause();
      a.src = ''; b.src = '';
      audioARef.current = null;
      audioBRef.current = null;
    };
  }, []);

  // Crossfade on fantasy change
  useEffect(() => {
    if (!fantasyId || !audioARef.current || !audioBRef.current) return;
    const src = `${BASE_URL}${fantasyId}.mp3`;
    if (currentSrcRef.current === src) return;
    currentSrcRef.current = src;

    cancelFadeRef.current?.();

    const active = activeRef.current === 'A' ? audioARef.current : audioBRef.current;
    const next = activeRef.current === 'A' ? audioBRef.current : audioARef.current;

    next.src = src;
    next.volume = 0;
    if (!muted) {
      next.play().catch(() => { /* autoplay blocked — wait for next interaction */ });
    }

    const fromActive = active.volume;
    const targetNext = muted ? 0 : TARGET_VOLUME;

    cancelFadeRef.current = tween(0, 1, FADE_DURATION_MS, (t) => {
      active.volume = Math.max(0, fromActive * (1 - t));
      next.volume = Math.min(targetNext, targetNext * t);
      if (t >= 1) {
        try { active.pause(); active.src = ''; } catch { /* ignore */ }
      }
    });

    activeRef.current = activeRef.current === 'A' ? 'B' : 'A';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fantasyId]);

  // Mute toggle
  useEffect(() => {
    const a = audioARef.current;
    const b = audioBRef.current;
    if (!a || !b) return;

    const active = activeRef.current === 'A' ? a : b;
    if (muted) {
      tween(active.volume, 0, 600, (v) => { active.volume = v; });
    } else {
      if (active.src && active.paused) active.play().catch(() => { /* ignore */ });
      tween(active.volume, TARGET_VOLUME, 600, (v) => { active.volume = v; });
    }
  }, [muted]);

  if (!fantasyId) return null;

  return (
    <button
      onClick={() => setMuted(m => !m)}
      aria-label={muted ? 'הפעלי קול' : 'השתיקי'}
      className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
      style={{
        background: muted ? 'rgba(255,255,255,0.04)' : 'rgba(180,40,80,0.18)',
        backdropFilter: 'blur(12px)',
        border: muted ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(180,40,80,0.3)',
        boxShadow: muted ? 'none' : '0 0 24px rgba(180,40,80,0.2)',
      }}
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      )}
      {!hasInteracted && !muted && (
        <span className="absolute -bottom-7 right-0 text-[10px] text-white/40 whitespace-nowrap tracking-wide">
          הקליקי כדי להפעיל
        </span>
      )}
    </button>
  );
}
