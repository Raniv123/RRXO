import { useState, useEffect } from 'react';
import AmbientBackground from '../רכיבים/AmbientBackground';

interface Props {
  onDone: (selectedHour: string) => void;
}

const HOURS = [
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
];

function getWhatsAppLink(hour: string) {
  const text = `💋 ${hour} אני מתחילה ב-...\nתהיה מוכן`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Calculate time left until selected hour today (or tomorrow if passed) */
function getTimeLeft(hour: string): { hours: number; minutes: number; seconds: number; total: number } {
  const [h, m] = hour.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    total,
  };
}

export default function GiftBoxScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'opened' | 'time-pick' | 'farewell'>('closed');
  const [showText, setShowText] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  // Countdown timer
  useEffect(() => {
    if (phase !== 'farewell' || !selectedHour) return;
    setCountdown(getTimeLeft(selectedHour));
    const interval = setInterval(() => {
      setCountdown(getTimeLeft(selectedHour));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, selectedHour]);

  function handleBoxClick() {
    if (phase !== 'closed') return;
    setPhase('opening');
    setTimeout(() => setPhase('opened'), 1200);
    setTimeout(() => setShowText(true), 2000);
    setTimeout(() => {
      setPhase('time-pick');
      setShowTimePicker(true);
    }, 4500);
  }

  function handleHourSelect(hour: string) {
    setSelectedHour(hour);
    setShowConfirm(true);
  }

  function handleConfirm() {
    if (selectedHour) {
      setPhase('farewell');
    }
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="relative h-full flex flex-col">
      <AmbientBackground phase="ICE" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 max-w-md w-full">

          {/* Gift Box */}
          {phase !== 'time-pick' && phase !== 'farewell' && (
            <button
              onClick={handleBoxClick}
              disabled={phase !== 'closed'}
              className="relative flex items-center justify-center focus:outline-none"
              style={{ width: '180px', height: '180px' }}
            >
              {/* Box base */}
              <div
                className={`absolute inset-0 rounded-3xl transition-all duration-1000 ${
                  phase === 'closed' ? 'scale-100' : phase === 'opening' ? 'scale-110' : 'scale-90 opacity-0'
                }`}
                style={{
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.25) 0%, rgba(168,85,247,0.25) 100%)',
                  border: '2px solid rgba(236,72,153,0.3)',
                  boxShadow: phase === 'closed'
                    ? '0 0 40px rgba(236,72,153,0.15), inset 0 0 30px rgba(168,85,247,0.1)'
                    : '0 0 80px rgba(236,72,153,0.3), 0 0 120px rgba(168,85,247,0.15)',
                }}
              >
                {/* Ribbon vertical */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-4"
                  style={{ background: 'linear-gradient(180deg, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.4) 100%)' }}
                />
                {/* Ribbon horizontal */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-4"
                  style={{ background: 'linear-gradient(90deg, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.4) 100%)' }}
                />
                {/* Bow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
                  🎀
                </div>
              </div>

              {/* Sparkles when opened */}
              {(phase === 'opening' || phase === 'opened') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-warm-pink/60"
                      style={{
                        animation: `sparkle-out 1.5s ease-out ${i * 0.1}s forwards`,
                        transform: `rotate(${i * 45}deg) translateY(-20px)`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Pulse hint */}
              {phase === 'closed' && (
                <div className="absolute -bottom-8 text-white/30 text-xs animate-pulse">
                  לחצי לפתוח...
                </div>
              )}
            </button>
          )}

          {/* Surprise text */}
          {showText && phase === 'opened' && (
            <div className="text-center flex flex-col gap-3 animate-fade-in">
              <p className="text-2xl font-light text-white leading-relaxed">
                הערב הזה שלך.
              </p>
              <p className="text-base text-white/50 font-light leading-relaxed">
                הכנתי לך מסע חושני שייקח אותך למקום שלא הכרת.
              </p>
            </div>
          )}

          {/* Time Picker */}
          {showTimePicker && phase === 'time-pick' && (
            <div className="w-full flex flex-col gap-4 animate-fade-in">
              <p className="text-center text-white/40 text-sm">
                ?...מתי רוצה להתחיל
              </p>

              <div className="grid grid-cols-3 gap-2">
                {HOURS.map(hour => (
                  <button
                    key={hour}
                    onClick={() => handleHourSelect(hour)}
                    className={`py-3 rounded-xl text-sm font-light transition-all duration-300 ${
                      selectedHour === hour
                        ? 'text-white scale-[1.05]'
                        : 'text-white/50 hover:text-white/70 hover:scale-[1.02]'
                    }`}
                    style={{
                      background: selectedHour === hour
                        ? 'linear-gradient(135deg, rgba(236,72,153,0.25) 0%, rgba(168,85,247,0.25) 100%)'
                        : 'rgba(255,255,255,0.04)',
                      border: selectedHour === hour
                        ? '1px solid rgba(236,72,153,0.4)'
                        : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: selectedHour === hour
                        ? '0 0 20px rgba(236,72,153,0.15)'
                        : 'none',
                    }}
                  >
                    {hour}
                  </button>
                ))}
              </div>

              {/* Confirm */}
              {showConfirm && selectedHour && (
                <button
                  onClick={handleConfirm}
                  className="animate-fade-in w-full py-4 rounded-2xl text-white text-lg font-light transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(168,85,247,0.3) 100%)',
                    border: '1px solid rgba(236,72,153,0.35)',
                    boxShadow: '0 0 30px rgba(236,72,153,0.1)',
                  }}
                >
                  {selectedHour} ← בחרתי
                </button>
              )}
            </div>
          )}

          {/* Farewell — countdown + share */}
          {phase === 'farewell' && selectedHour && (
            <div className="flex flex-col items-center gap-6 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
                  boxShadow: '0 0 50px rgba(236,72,153,0.15)',
                }}
              >
                <span className="text-3xl">💋</span>
              </div>

              <p className="text-xl font-light text-white leading-relaxed">
                מושלם.
              </p>

              {/* Countdown */}
              <div className="flex gap-3">
                {[
                  { val: pad(countdown.hours), label: 'שעות' },
                  { val: pad(countdown.minutes), label: 'דקות' },
                  { val: pad(countdown.seconds), label: 'שניות' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-light text-white tabular-nums"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(236,72,153,0.15)',
                      }}
                    >
                      {item.val}
                    </div>
                    <span className="text-white/25 text-xs">{item.label}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-white/40 font-light leading-relaxed">
                .{selectedHour} דקות לפני תקבלי ממני סיסמה...
                <br />
                <span className="text-white/25">תהיי מוכנה</span>
              </p>

              {/* WhatsApp share */}
              <a
                href={getWhatsAppLink(selectedHour)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgba(37,211,102,0.12)',
                  border: '1px solid rgba(37,211,102,0.25)',
                  color: 'rgba(37,211,102,0.8)',
                }}
              >
                <span className="text-lg">💬</span>
                <span>עדכני אותו בוואטסאפ</span>
              </a>

              {/* Change time */}
              <button
                onClick={() => { setPhase('time-pick'); setShowConfirm(false); setSelectedHour(null); }}
                className="text-white/20 hover:text-white/40 text-xs transition-all"
              >
                ?לשנות שעה
              </button>

              <button
                onClick={() => onDone(selectedHour)}
                className="mt-2 px-8 py-3 rounded-2xl text-white/40 hover:text-white/60 text-sm border border-white/10 hover:border-white/20 transition-all"
              >
                ♡ הבנתי
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sparkle animation keyframes */}
      <style>{`
        @keyframes sparkle-out {
          0% { transform: rotate(var(--r, 0deg)) translateY(-20px); opacity: 1; }
          100% { transform: rotate(var(--r, 0deg)) translateY(-80px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
