import { useState } from 'react';
import AmbientBackground from '../רכיבים/AmbientBackground';

interface Props {
  onUnlock: () => void;
}

const CORRECT_PIN = '2626';

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
        buzz(35);
        setTimeout(() => onUnlock(), 350);
      } else {
        buzz(55);
        setShake(true);
        setError(true);
        setTimeout(() => {
          setPin('');
          setShake(false);
        }, 700);
      }
    }
  };

  const handleDelete = () => {
    setPin(p => p.slice(0, -1));
    setError(false);
    buzz(6);
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-center px-6 screen-fade">
      <AmbientBackground phase="ICE" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Glass container — matches inner app aesthetic */}
        <div
          className="glass !rounded-[28px] flex flex-col items-center gap-8 px-8 py-10"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)' }}
        >
          {/* Halo with pulse */}
          <div className="halo">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center morph-shape"
              style={{
                background: 'radial-gradient(circle, rgba(236,72,153,0.28) 0%, rgba(168,85,247,0.18) 50%, transparent 75%)',
                boxShadow: '0 0 50px rgba(236,72,153,0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: 'rgba(236,72,153,0.95)',
                  boxShadow: '0 0 18px rgba(236,72,153,0.7)',
                }}
              />
            </div>
          </div>

          {/* Microcopy — sensual serif */}
          <div className="text-center flex flex-col gap-1.5 -mt-2">
            <p
              className="text-[10px] tracking-[0.32em] uppercase"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: error ? 'rgba(248,113,113,0.9)' : 'rgba(255,255,255,0.35)',
                transition: 'color 400ms ease',
              }}
            >
              {error ? 'לא מדויק' : 'הערב שלך'}
            </p>
            <p className="text-xs text-white/35 font-light tracking-[0.14em]">
              {error ? 'נסי שוב' : 'הקלידי קוד'}
            </p>
          </div>

          {/* Dots */}
          <div className={`flex gap-4 ${shake ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  background: i < pin.length
                    ? error
                      ? 'rgba(239,68,68,0.95)'
                      : 'rgba(236,72,153,0.95)'
                    : 'rgba(255,255,255,0.07)',
                  border: i < pin.length ? 'none' : '1px solid rgba(255,255,255,0.16)',
                  boxShadow: i < pin.length && !error ? '0 0 16px rgba(236,72,153,0.6)' : 'none',
                  transform: i < pin.length ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3.5">
            {['1','2','3','4','5','6','7','8','9','','0','←'].map((key) => (
              <button
                key={key || 'empty'}
                onClick={() => {
                  if (key === '←') handleDelete();
                  else if (key) handleDigit(key);
                }}
                disabled={!key}
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center text-xl
                  transition-all duration-200 ease-out select-none
                  ${!key ? 'invisible' : ''}
                  ${key === '←'
                    ? 'text-white/35 hover:text-white/55 active:scale-90'
                    : 'text-white/85 active:scale-90'
                  }
                `}
                style={key && key !== '←' ? {
                  fontFamily: 'Heebo, sans-serif',
                  fontWeight: 300,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.2)',
                } : undefined}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
