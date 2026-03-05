import { useState, useEffect } from 'react';
import ActionButton from '../רכיבים/ActionButton';
import AmbientBackground from '../רכיבים/AmbientBackground';

interface Props {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const [show, setShow] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 300);
    setTimeout(() => setShowSub(true), 1200);
    setTimeout(() => setShowBtn(true), 2200);
  }, []);

  return (
    <div className="relative h-full flex flex-col items-center justify-center">
      <AmbientBackground phase="ICE" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Moon icon */}
        <div className={`transition-all duration-1000 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center animate-breath-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(180,40,80,0.25) 0%, transparent 70%)',
              boxShadow: '0 0 60px rgba(180,40,80,0.15)',
            }}
          >
            <span className="text-5xl">🌙</span>
          </div>
        </div>

        {/* Title */}
        <h1 className={`text-4xl font-light text-white transition-all duration-1000 delay-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          ערב טוב, יפה
        </h1>

        {/* Subtitle */}
        <p className={`text-lg text-white/50 font-light transition-all duration-1000 ${showSub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          מסע חושני רק בשבילך
        </p>

        {/* Button */}
        <div className={`transition-all duration-700 ${showBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <ActionButton onClick={onStart}>
            התחילי מסע ←
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
