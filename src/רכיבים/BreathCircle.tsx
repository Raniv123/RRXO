import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  onComplete: () => void;
  totalRounds?: number;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'done';

const TEXTS: Record<BreathPhase, string> = {
  inhale: 'שאפי...',
  hold: 'עצרי.',
  exhale: 'שחררי הכל...',
  done: ''
};

const DURATIONS: Record<Exclude<BreathPhase, 'done'>, number> = {
  inhale: 4000,
  hold: 4000,
  exhale: 8000,
};

export default function BreathCircle({ onComplete, totalRounds = 3 }: Props) {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [round, setRound] = useState(1);
  const [scale, setScale] = useState(0.8);
  const completedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const roundRef = useRef(round);
  roundRef.current = round;

  const advance = useCallback((currentPhase: BreathPhase) => {
    if (currentPhase === 'inhale') {
      setScale(1.2);
      setPhase('hold');
    } else if (currentPhase === 'hold') {
      setScale(0.8);
      setPhase('exhale');
    } else if (currentPhase === 'exhale') {
      if (roundRef.current >= totalRounds) {
        if (!completedRef.current) {
          completedRef.current = true;
          setPhase('done');
          setTimeout(() => onCompleteRef.current(), 800);
        }
      } else {
        setRound(r => r + 1);
        setScale(0.8);
        setPhase('inhale');
      }
    }
  }, [totalRounds]);

  useEffect(() => {
    if (phase === 'done') return;

    if (phase === 'inhale') setScale(1.2);

    timerRef.current = setTimeout(() => advance(phase), DURATIONS[phase]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, advance]);

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-32 h-32 rounded-full bg-warm-pink/20 flex items-center justify-center">
          <span className="text-4xl">✨</span>
        </div>
        <p className="text-xl text-white/80">את מוכנה. המסע מתחיל.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className="w-48 h-48 rounded-full flex items-center justify-center transition-transform duration-[4000ms] ease-in-out"
        style={{
          transform: `scale(${scale})`,
          background: 'radial-gradient(circle, rgba(180,40,80,0.3) 0%, rgba(180,40,80,0.05) 70%)',
          boxShadow: '0 0 80px rgba(180,40,80,0.2), inset 0 0 40px rgba(180,40,80,0.1)',
          border: '1px solid rgba(180,40,80,0.2)',
        }}
      >
        <span className="text-2xl text-white/90 font-light">
          {TEXTS[phase]}
        </span>
      </div>

      <div className="text-white/30 text-sm">
        {round} / {totalRounds}
      </div>
    </div>
  );
}
