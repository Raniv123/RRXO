import { Phase } from '../types';

interface Props {
  currentPhase: Phase;
  tension: number;
}

const PHASES: { key: Phase; label: string; color: string; glow: string }[] = [
  { key: 'ICE',  label: 'הרפיה', color: 'bg-cyan-400',   glow: 'rgba(34,211,238,0.45)' },
  { key: 'WARM', label: 'חימום', color: 'bg-purple-400', glow: 'rgba(168,85,247,0.45)' },
  { key: 'HOT',  label: 'לוהט',  color: 'bg-warm-pink',  glow: 'rgba(236,72,153,0.45)' },
  { key: 'FIRE', label: 'שיא',   color: 'bg-red-500',    glow: 'rgba(239,68,68,0.55)' },
];

const PHASE_ORDER: Phase[] = ['ICE', 'WARM', 'HOT', 'FIRE'];

export default function PhaseProgress({ currentPhase, tension }: Props) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  return (
    <div className="w-full px-4">
      {/* Phase dots — organic, breathing */}
      <div className="flex items-center justify-between mb-4">
        {PHASES.map((p, i) => {
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;
          return (
            <div key={p.key} className="flex flex-col items-center gap-2">
              <div className={`
                flex items-center justify-center
                transition-all duration-700 ease-out
                ${isActive ? 'w-9 h-9 morph-shape' : 'w-6 h-6 rounded-full'}
              `}
                style={{
                  background: isActive ? `${p.glow}` : isPast ? 'rgba(180,40,80,0.3)' : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive
                    ? `0 0 24px ${p.glow}, 0 0 48px ${p.glow}`
                    : 'none',
                }}
              >
                <div
                  className={`
                    rounded-full transition-all duration-700
                    ${isActive ? 'w-3 h-3' : isPast ? 'w-2 h-2' : 'w-1.5 h-1.5'}
                  `}
                  style={{
                    background: isActive ? p.glow.replace('0.45','0.95').replace('0.55','0.95') :
                                isPast ? 'rgba(255,180,200,0.7)' :
                                'rgba(255,255,255,0.25)',
                  }}
                />
              </div>
              <span
                className={`
                  text-[10px] tracking-[0.18em] transition-all duration-500
                  ${isActive ? 'text-white/75 font-light' : 'text-white/20'}
                `}
              >
                {p.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar — flowing river, no number */}
      <div
        className="h-[3px] rounded-full overflow-hidden relative"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <div
          className="absolute inset-y-0 right-0 rounded-full transition-all duration-[1500ms] ease-out"
          style={{
            width: `${tension}%`,
            background: tension > 75
              ? 'linear-gradient(270deg, #EF4444 0%, #B42850 100%)'
              : tension > 50
              ? 'linear-gradient(270deg, #B42850 0%, #8B5CF6 100%)'
              : tension > 25
              ? 'linear-gradient(270deg, #8B5CF6 0%, #3B82F6 100%)'
              : 'linear-gradient(270deg, #3B82F6 0%, #22D3EE 100%)',
            boxShadow: tension > 50
              ? '0 0 12px rgba(236,72,153,0.4)'
              : '0 0 8px rgba(139,92,246,0.3)',
          }}
        />
      </div>
    </div>
  );
}
