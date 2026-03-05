import { Phase } from '../types';

interface Props {
  currentPhase: Phase;
  tension: number;
}

const PHASES: { key: Phase; label: string; color: string }[] = [
  { key: 'ICE', label: 'הרפיה', color: 'bg-cyan-400' },
  { key: 'WARM', label: 'חימום', color: 'bg-purple-400' },
  { key: 'HOT', label: 'לוהט', color: 'bg-warm-pink' },
  { key: 'FIRE', label: 'שיא', color: 'bg-red-500' },
];

const PHASE_ORDER: Phase[] = ['ICE', 'WARM', 'HOT', 'FIRE'];

export default function PhaseProgress({ currentPhase, tension }: Props) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  return (
    <div className="w-full px-4">
      {/* Phase dots — cinematic minimal */}
      <div className="flex items-center justify-between mb-3">
        {PHASES.map((p, i) => {
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;
          return (
            <div key={p.key} className="flex flex-col items-center gap-1.5">
              <div className={`
                rounded-full flex items-center justify-center
                transition-all duration-500
                ${isActive ? 'w-8 h-8 animate-glow-pulse' : 'w-6 h-6'}
                ${isPast ? 'bg-warm-pink/30' : isActive ? `${p.color}/50` : 'bg-white/5'}
              `}>
                <div className={`
                  rounded-full transition-all duration-500
                  ${isActive ? `w-3 h-3 ${p.color}` : isPast ? 'w-2 h-2 bg-warm-pink/60' : 'w-2 h-2 bg-white/20'}
                `} />
              </div>
              <span className={`text-[10px] tracking-wider transition-colors duration-300 ${isActive ? 'text-white/70' : 'text-white/20'}`}>
                {p.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${tension}%`,
            background: tension > 75 ? 'linear-gradient(90deg, #B42850, #EF4444)' :
                        tension > 50 ? 'linear-gradient(90deg, #8B5CF6, #B42850)' :
                        tension > 25 ? 'linear-gradient(90deg, #3B82F6, #8B5CF6)' :
                        'linear-gradient(90deg, #22D3EE, #3B82F6)'
          }}
        />
      </div>
    </div>
  );
}
