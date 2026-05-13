import { useState, useEffect, useRef } from 'react';
import AmbientBackground from '../רכיבים/AmbientBackground';
import ActionButton from '../רכיבים/ActionButton';

interface Props {
  onDone: (userName: string, partnerName: string) => void;
}

export default function NamesScreen({ onDone }: Props) {
  const [step, setStep] = useState<0 | 1>(0);
  const [userName, setUserName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus current input
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 700);
    return () => clearTimeout(t);
  }, [step]);

  function next() {
    const val = step === 0 ? userName.trim() : partnerName.trim();
    if (!val) return;
    if (step === 0) {
      setStep(1);
    } else {
      onDone(userName.trim(), partnerName.trim());
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') next();
  }

  const currentValue = step === 0 ? userName : partnerName;
  const canContinue = currentValue.trim().length > 0;

  return (
    <div className="relative h-full flex flex-col items-center justify-center px-6 screen-fade">
      <AmbientBackground phase="ICE" />

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm w-full">
        {/* Small halo accent */}
        <div className="halo">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center morph-shape"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)',
              boxShadow: '0 0 50px rgba(236,72,153,0.18)',
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: 'rgba(236,72,153,0.9)',
                boxShadow: '0 0 14px rgba(236,72,153,0.6)',
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div key={step} className="screen-fade text-center flex flex-col gap-3 w-full">
          <p
            className="text-xs tracking-[0.22em] text-white/35"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {step === 0 ? 'לפני שמתחילים' : 'דבר אחרון'}
          </p>

          <h1 className="text-3xl font-extralight text-white/95 leading-tight tracking-tight">
            {step === 0 ? 'איך אקרא לך?' : `ומי על דעתך, ${userName}?`}
          </h1>

          <p className="text-xs text-white/40 font-light tracking-[0.12em] mt-1">
            {step === 0
              ? 'שם פרטי — רק לי תגידי'
              : 'שם פרטי של מי שאת מדמיינת — הוא לא יידע'}
          </p>
        </div>

        {/* Input */}
        <div className="w-full flex flex-col gap-5">
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              dir="auto"
              value={currentValue}
              onChange={e => step === 0 ? setUserName(e.target.value) : setPartnerName(e.target.value)}
              onKeyDown={handleKey}
              maxLength={24}
              autoComplete="off"
              spellCheck={false}
              className="w-full text-center text-2xl font-light text-white bg-transparent border-0 border-b-2 outline-none py-3 transition-all duration-500"
              style={{
                borderBottomColor: canContinue ? 'rgba(236,72,153,0.55)' : 'rgba(255,255,255,0.12)',
                caretColor: 'rgba(236,72,153,0.9)',
              }}
              placeholder={step === 0 ? 'את' : 'הוא'}
            />
          </div>

          <ActionButton
            onClick={next}
            disabled={!canContinue}
            className="w-full"
          >
            {step === 0 ? 'הבא' : 'בואי נתחיל'}
          </ActionButton>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-2">
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: step === 0 ? '24px' : '8px',
              background: step === 0 ? 'rgba(236,72,153,0.6)' : 'rgba(236,72,153,0.3)',
            }}
          />
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: step === 1 ? '24px' : '8px',
              background: step === 1 ? 'rgba(236,72,153,0.6)' : 'rgba(255,255,255,0.1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
