import { useState } from 'react';
import AmbientBackground from '../רכיבים/AmbientBackground';

interface Props {
  onUnlock: () => void;
}

const CORRECT_PIN = '1900';

export default function PasswordScreen({ onUnlock }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === CORRECT_PIN) {
        setTimeout(() => onUnlock(), 300);
      } else {
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
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-center">
      <AmbientBackground phase="ICE" />

      <div className="relative z-10 flex flex-col items-center gap-10 px-6">
        {/* Lock icon */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(180,40,80,0.2) 0%, transparent 70%)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Dots */}
        <div className={`flex gap-4 ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? error ? 'bg-red-500' : 'bg-warm-pink'
                  : 'bg-white/10 border border-white/20'
              }`}
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
                transition-all duration-150
                ${!key ? 'invisible' : ''}
                ${key === '←'
                  ? 'text-white/40 hover:text-white/60'
                  : 'text-white/80 bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10'
                }
              `}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
