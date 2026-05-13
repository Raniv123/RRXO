import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  onComplete: () => void;
  totalRounds?: number;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'done';

const LABEL: Record<BreathPhase, string> = {
  inhale: 'שאפי',
  hold: 'החזיקי',
  exhale: 'נשפי',
  done: '',
};

const HINT: Record<BreathPhase, string> = {
  inhale: 'אוויר נכנס דרך האף',
  hold: 'החמצן נספג לדם',
  exhale: 'מערכת העצבים נרגעת',
  done: '',
};

const DURATION: Record<Exclude<BreathPhase, 'done'>, number> = {
  inhale: 4000,
  hold: 4000,
  exhale: 8000,
};

// Min and max scale of the circle
const MIN_SCALE = 0.78;
const MAX_SCALE = 1.18;

// Smooth easing for each phase
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function BreathCircle({ onComplete, totalRounds = 3 }: Props) {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [round, setRound] = useState(1);
  const [scale, setScale] = useState(MIN_SCALE);
  const [secondsLeft, setSecondsLeft] = useState(4);

  const phaseRef = useRef<BreathPhase>('inhale');
  const roundRef = useRef(1);
  const startRef = useRef(0);
  const completedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const advance = useCallback(() => {
    const cur = phaseRef.current;

    if (cur === 'inhale') {
      phaseRef.current = 'hold';
      setPhase('hold');
    } else if (cur === 'hold') {
      phaseRef.current = 'exhale';
      setPhase('exhale');
    } else if (cur === 'exhale') {
      if (roundRef.current >= totalRounds) {
        if (!completedRef.current) {
          completedRef.current = true;
          phaseRef.current = 'done';
          setPhase('done');
          setTimeout(() => onCompleteRef.current(), 1200);
        }
        return;
      }
      roundRef.current += 1;
      setRound(roundRef.current);
      phaseRef.current = 'inhale';
      setPhase('inhale');
    }

    startRef.current = performance.now();
  }, [totalRounds]);

  // Smooth rAF-driven tween between scale states + countdown
  useEffect(() => {
    if (phase === 'done') return;

    startRef.current = performance.now();
    const duration = DURATION[phase];

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOut(t);

      // Scale interpolation
      let s: number;
      if (phaseRef.current === 'inhale') s = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * eased;
      else if (phaseRef.current === 'hold') s = MAX_SCALE;
      else s = MAX_SCALE - (MAX_SCALE - MIN_SCALE) * eased;

      setScale(s);

      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      setSecondsLeft(remaining);

      if (elapsed >= duration) {
        advance();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, advance]);

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center morph-shape"
          style={{
            background: 'radial-gradient(circle, rgba(74,222,128,0.22) 0%, rgba(180,40,80,0.05) 60%, transparent 100%)',
            boxShadow: '0 0 60px rgba(74,222,128,0.2)',
          }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: 'rgba(74,222,128,0.85)', boxShadow: '0 0 14px rgba(74,222,128,0.6)' }}
          />
        </div>
        <p
          className="text-lg text-white/80 font-light tracking-wide"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          את כאן. נתחיל.
        </p>
      </div>
    );
  }

  // Phase color
  const phaseColor =
    phase === 'inhale' ? 'rgba(34,211,238,0.55)' :
    phase === 'hold' ? 'rgba(168,85,247,0.55)' :
    'rgba(236,72,153,0.55)';

  return (
    <div className="flex flex-col items-center gap-7">
      {/* Concise top blurb — what 4-4-8 breathing does */}
      <p
        className="text-[11px] text-white/35 tracking-[0.22em] text-center max-w-xs leading-relaxed"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        ‎4-4-8 — מאט את הדופק ופותח את הגוף
      </p>

      {/* The breathing circle — smooth rAF-driven */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Outer halo — pulses subtly with phase */}
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle, ${phaseColor.replace('0.55', '0.18')} 0%, transparent 70%)`,
            opacity: phase === 'hold' ? 0.9 : 0.6,
            filter: 'blur(8px)',
          }}
        />

        {/* Main breathing circle */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            transform: `scale(${scale})`,
            background: `radial-gradient(circle, ${phaseColor.replace('0.55','0.28')} 0%, ${phaseColor.replace('0.55','0.05')} 70%, transparent 100%)`,
            boxShadow: `0 0 60px ${phaseColor.replace('0.55','0.25')}, inset 0 0 40px ${phaseColor.replace('0.55','0.12')}`,
            border: `1px solid ${phaseColor.replace('0.55','0.25')}`,
          }}
        >
          {/* Phase label + seconds */}
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="text-2xl text-white/90 font-light tracking-wide"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {LABEL[phase]}
            </span>
            <span className="text-white/40 text-xs tabular-nums tracking-widest">
              {secondsLeft}״
            </span>
          </div>
        </div>
      </div>

      {/* Hint about what this phase does */}
      <p
        key={phase}
        className="text-xs text-white/45 tracking-wide text-center min-h-[16px] screen-fade"
      >
        {HINT[phase]}
      </p>

      {/* Round counter */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalRounds }, (_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: i < round ? '18px' : '8px',
              background: i < round
                ? (i === round - 1 ? phaseColor : 'rgba(180,40,80,0.5)')
                : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
