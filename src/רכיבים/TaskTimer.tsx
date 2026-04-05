import { useState, useEffect, useRef } from 'react';

interface Props {
  /** Duration in seconds */
  duration: number;
  /** Called when timer completes */
  onDone?: () => void;
}

export default function TaskTimer({ duration, onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const animRef = useRef<number>(0);
  const startRef = useRef(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    startRef.current = performance.now();
    const totalMs = duration * 1000;

    function tick() {
      const elapsed = performance.now() - startRef.current;
      const p = Math.min(1, elapsed / totalMs);
      setProgress(p);

      if (p >= 1) {
        setDone(true);
        onDoneRef.current?.();
      } else {
        animRef.current = requestAnimationFrame(tick);
      }
    }
    animRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animRef.current);
  }, [duration]);

  const secondsLeft = Math.ceil(duration * (1 - progress));

  return (
    <div className="animate-fade-in flex flex-col gap-1.5 w-full">
      {/* Label */}
      <div className="flex items-center justify-between px-1">
        <span className={`text-xs ${done ? 'text-green-400/60' : 'text-white/25'}`}>
          {done ? '✓' : 'קחי את הזמן...'}
        </span>
        {!done && (
          <span className="text-white/30 text-xs tabular-nums">{secondsLeft}״</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            background: done ? 'rgba(74,222,128,0.45)' : 'rgba(255,255,255,0.18)',
            boxShadow: done ? '0 0 10px rgba(74,222,128,0.3)' : 'none',
            transition: 'background-color 300ms ease',
          }}
        />
      </div>
    </div>
  );
}
