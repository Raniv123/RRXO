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
  // Fewer, larger, more organic particles — feels less template
  const particles = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8,
      duration: Math.random() * 6 + 8,
      opacity: Math.random() * 0.18 + 0.05,
    }));
  }, []);

  const particleColor = phase === 'FIRE' ? 'bg-fire-red/25' :
                         phase === 'HOT' ? 'bg-warm-pink/22' :
                         phase === 'WARM' ? 'bg-deep-purple/20' :
                         'bg-electric-blue/15';

  // Phase-aware moving glow — feels alive
  const glowColor = phase === 'FIRE' ? 'rgba(239,68,68,0.18)' :
                    phase === 'HOT' ? 'rgba(236,72,153,0.18)' :
                    phase === 'WARM' ? 'rgba(168,85,247,0.18)' :
                    'rgba(34,211,238,0.12)';

  return (
    <div className={`fixed inset-0 ${PHASE_BG[phase]} transition-all duration-[3000ms]`}>
      {/* Slow drifting glow — adds life without being busy */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '60vw',
          height: '60vw',
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)`,
          filter: 'blur(40px)',
          animation: 'particleFloat 18s ease-in-out infinite',
          top: '20%',
          left: '20%',
        }}
      />

      {/* Soft floating particles — fewer, larger, more elegant */}
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

      {/* Film grain — analog texture over digital gradients */}
      <div className="film-grain" />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
    </div>
  );
}
