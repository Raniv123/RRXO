import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  /** Total breathing rounds */
  rounds?: number;
  /** Inhale seconds */
  inhale?: number;
  /** Hold seconds */
  hold?: number;
  /** Exhale seconds */
  exhale?: number;
  /** Called when all rounds complete */
  onDone?: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'done';

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: 'שאפי...',
  hold: 'עצרי...',
  exhale: 'נשפי...',
  done: '',
};

const PHASE_BG: Record<BreathPhase, string> = {
  inhale: 'rgba(34,211,238,0.5)',
  hold: 'rgba(168,85,247,0.5)',
  exhale: 'rgba(236,72,153,0.5)',
  done: 'rgba(255,255,255,0.2)',
};

const PHASE_GLOW: Record<BreathPhase, string> = {
  inhale: '0 0 12px rgba(34,211,238,0.4)',
  hold: '0 0 12px rgba(168,85,247,0.4)',
  exhale: '0 0 12px rgba(236,72,153,0.4)',
  done: 'none',
};

export default function BreathGuide({ rounds = 3, inhale = 5, hold = 3, exhale = 7, onDone }: Props) {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [currentRound, setCurrentRound] = useState(1);
  const [displayProgress, setDisplayProgress] = useState(0);
  const animRef = useRef<number>(0);
  const phaseRef = useRef<BreathPhase>('inhale');
  const roundRef = useRef(1);
  const startRef = useRef(0);

  const getDuration = useCallback((phase: BreathPhase): number => {
    if (phase === 'inhale') return inhale * 1000;
    if (phase === 'hold') return hold * 1000;
    if (phase === 'exhale') return exhale * 1000;
    return 0;
  }, [inhale, hold, exhale]);

  useEffect(() => {
    phaseRef.current = 'inhale';
    roundRef.current = 1;

    function goNext() {
      const cur = phaseRef.current;
      if (cur === 'inhale') {
        phaseRef.current = hold > 0 ? 'hold' : 'exhale';
      } else if (cur === 'hold') {
        phaseRef.current = 'exhale';
      } else if (cur === 'exhale') {
        roundRef.current++;
        if (roundRef.current > rounds) {
          phaseRef.current = 'done';
          setBreathPhase('done');
          setDisplayProgress(1);
          onDone?.();
          return;
        }
        phaseRef.current = 'inhale';
        setCurrentRound(roundRef.current);
      }
      setBreathPhase(phaseRef.current);
      startRef.current = performance.now();
      runPhase();
    }

    function runPhase() {
      const duration = getDuration(phaseRef.current);
      if (duration === 0) { goNext(); return; }

      function tick() {
        const elapsed = performance.now() - startRef.current;
        const raw = Math.min(1, elapsed / duration);

        // Inhale: 0→100%, Hold: stay 100%, Exhale: 100→0%
        let visual: number;
        if (phaseRef.current === 'inhale') visual = raw;
        else if (phaseRef.current === 'hold') visual = 1;
        else visual = 1 - raw;

        setDisplayProgress(visual);

        if (raw >= 1) {
          goNext();
        } else {
          animRef.current = requestAnimationFrame(tick);
        }
      }
      animRef.current = requestAnimationFrame(tick);
    }

    startRef.current = performance.now();
    runPhase();

    return () => cancelAnimationFrame(animRef.current);
  }, [inhale, hold, exhale, rounds, getDuration]);

  const isDone = breathPhase === 'done';

  const totalSec = isDone ? 0 : (breathPhase === 'inhale' ? inhale : breathPhase === 'hold' ? hold : exhale);
  const secondsLeft = isDone ? 0 : Math.max(0, Math.ceil(totalSec * (1 - (breathPhase === 'exhale' ? displayProgress : breathPhase === 'hold' ? 0 : displayProgress))));

  return (
    <div className="animate-fade-in flex flex-col gap-3 w-full py-1">
      {/* Label + round counter */}
      <div className="flex items-center justify-between px-1">
        <span className="text-white/40 text-xs tabular-nums">
          {isDone ? '' : `${currentRound}/${rounds}`}
        </span>
        <span className={`text-sm font-light tracking-wide ${isDone ? 'text-green-400/70' : 'text-white/70'}`}>
          {isDone ? '✓' : PHASE_LABELS[breathPhase]}
        </span>
        <span className="text-white/40 text-xs tabular-nums">
          {isDone ? '' : `${secondsLeft}״`}
        </span>
      </div>

      {/* Progress bar — thick and visible */}
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${displayProgress * 100}%`,
            background: isDone ? 'rgba(74,222,128,0.45)' : PHASE_BG[breathPhase],
            boxShadow: isDone ? '0 0 12px rgba(74,222,128,0.3)' : PHASE_GLOW[breathPhase],
            transition: 'background-color 400ms ease',
          }}
        />
      </div>

      {/* Breathing circle */}
      {!isDone && (
        <div className="flex justify-center">
          <div
            className="rounded-full"
            style={{
              width: `${14 + displayProgress * 30}px`,
              height: `${14 + displayProgress * 30}px`,
              background: PHASE_BG[breathPhase],
              boxShadow: PHASE_GLOW[breathPhase],
              opacity: breathPhase === 'hold' ? 0.9 : 0.6,
              transition: 'background-color 400ms ease',
            }}
          />
        </div>
      )}
    </div>
  );
}
