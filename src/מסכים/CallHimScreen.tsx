import { useState, useEffect } from 'react';
import AmbientBackground from '../רכיבים/AmbientBackground';
import ActionButton from '../רכיבים/ActionButton';

interface Props {
  partnerName?: string;
  onRestart: () => void;
}

export default function CallHimScreen({ partnerName, onRestart }: Props) {
  const [show, setShow] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [showBtns, setShowBtns] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 500);
    setTimeout(() => setShowMsg(true), 1800);
    setTimeout(() => setShowBtns(true), 3000);
  }, []);

  const callText = partnerName ? `תקראי ל${partnerName} עכשיו` : 'תקראי לו עכשיו';
  const whatsappText = encodeURIComponent(
    partnerName
      ? `${partnerName}... אני מחכה לך. בוא.`
      : 'אני מחכה לך. בוא.'
  );

  return (
    <div className="relative h-full flex flex-col items-center justify-center">
      <AmbientBackground phase="FIRE" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-md">
        {/* Heart icon */}
        <div className={`transition-all duration-1000 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="w-28 h-28 rounded-full flex items-center justify-center animate-heartbeat"
            style={{
              background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)',
              boxShadow: '0 0 80px rgba(239,68,68,0.2)',
            }}
          >
            <span className="text-6xl">💋</span>
          </div>
        </div>

        {/* Main text */}
        <div className={`flex flex-col gap-3 transition-all duration-1000 ${showMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h1 className="text-3xl font-light text-white">
            הגעת.
          </h1>
          <p className="text-xl text-white/70 font-light leading-relaxed">
            את חמה, מוכנה, ורוצה אותו.
          </p>
          <p className="text-2xl text-warm-pink font-medium mt-2">
            {callText}
          </p>
          <p className="text-white/40 text-sm mt-1">
            תגידי לו שאת מחכה.
          </p>
        </div>

        {/* Action buttons */}
        <div className={`flex flex-col gap-3 w-full transition-all duration-700 ${showBtns ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <a href="tel:" className="w-full">
            <ActionButton onClick={() => {}} className="w-full">
              📞 התקשרי אליו
            </ActionButton>
          </a>

          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <ActionButton onClick={() => {}} variant="secondary" className="w-full">
              💬 שלחי לו הודעה
            </ActionButton>
          </a>

          <ActionButton onClick={onRestart} variant="ghost" className="w-full mt-4">
            ♡ סיימתי
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
