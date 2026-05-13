import { useState } from 'react';
import AmbientBackground from '../רכיבים/AmbientBackground';

interface Props {
  onUnlock: () => void;
}

const CORRECT_PIN = '2626';

/** Tiny vibration if device supports it — feels physical */
function buzz(ms = 12) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(ms); } catch { /* ignore */ }
  }
}

export default function PasswordScreen({ onUnlock }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);
    buzz(8);

    if (newPin.length === 4) {
      if (newPin === CORRECT_PIN) {
        buzz(30);
        setTimeout(() => onUnlock(), 300);
      } else {
        buzz(50);
        setShake(true);
        setError(true);
        setTimeout(() => {
          setPin('');
          setShake(false);
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    setPin(p => p.slice(0, -1));
    setError(false);
    buzz(6);
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-center screen-fade">
      <AmbientBackground phase="ICE" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        {/* Lock icon with halo */}
        <div className="halo">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(180,40,80,0.22) 0%, transparent 70%)',
              boxShadow: '0 0 40px rgba(180,40,80,0.15)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2.5" ry="2.5" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        {/* Intimate microcopy */}
        <div className="text-center flex flex-col gap-1.5 -mt-2">
          <p
            className="text-xs tracking-[0.22em] uppercase"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: error ? 'rgba(248,113,113,0.85)' : 'rgba(255,255,255,0.45)',
              transition: 'color 300ms ease',
              letterSpacing: '0.18em',
            }}
          >
            {error ? 'לא מדויק. נסי שוב.' : 'רגע שלך בלבד'}
          </p>
        </div>

        {/* Dots */}
        <div className={`flex gap-4 ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                i < pin.length
                  ? error ? 'bg-red-500' : 'bg-warm-pink'
                  : 'bg-white/10 border border-white/20'
              }`}
              style={{
                boxShadow: i < pin.length && !error ? '0 0 14px rgba(180,40,80,0.55)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4">
          {['1','2','3','4','5','6','7','8','9','','0','←'].map((key) => (
            <button
              key={key || 'empty'}
              onClick={() => {
                if (key === '←') handleDelete();
                else if (key) handleDigit(key);
              }}
              disabled={!key}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl
                transition-all duration-200 ease-out select-none
                ${!key ? 'invisible' : ''}
                ${key === '←'
                  ? 'text-white/40 hover:text-white/60 active:scale-90'
                  : 'text-white/85 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.16] border border-white/10 active:scale-90'
                }
              `}
              style={key && key !== '←' ? { fontFamily: 'Heebo, sans-serif', fontWeight: 300 } : undefined}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
