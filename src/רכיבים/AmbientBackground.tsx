import { Phase } from '../types';
import { useMemo } from 'react';

interface Props {
  phase: Phase;
}

const PHASE_BG: Record<Phase, string> = {
  ICE: 'bg-ice',
  WARM: 'bg-warm',
  HOT: 'bg-hot',
  FIRE: 'bg-fire',
};

export default function AmbientBackground({ phase }: Props) {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 4,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  const particleColor = phase === 'FIRE' ? 'bg-fire-red/30' :
                         phase === 'HOT' ? 'bg-warm-pink/25' :
                         phase === 'WARM' ? 'bg-deep-purple/20' :
                         'bg-electric-blue/15';

  return (
    <div className={`fixed inset-0 ${PHASE_BG[phase]} transition-all duration-[3000ms]`}>
      {particles.map(p => (
        <div
          key={p.id}
          className={`particle ${particleColor}`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
    </div>
  );
}
