import AmbientBackground from '../רכיבים/AmbientBackground';
import BreathCircle from '../רכיבים/BreathCircle';

interface Props {
  onComplete: () => void;
}

export default function BreathScreen({ onComplete }: Props) {
  return (
    <div className="relative h-full flex flex-col items-center justify-center">
      <AmbientBackground phase="ICE" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        <h2 className="text-2xl font-light text-white/70 animate-fade-in">
          בואי נתחיל בנשימה
        </h2>

        <BreathCircle onComplete={onComplete} totalRounds={3} />

        <p className="text-sm text-white/25 animate-fade-in-slow">
          עצמי עיניים ותתני לגוף להירגע
        </p>

        <button
          onClick={onComplete}
          className="text-white/20 hover:text-white/40 text-xs transition-colors mt-4"
        >
          דלגי →
        </button>
      </div>
    </div>
  );
}
