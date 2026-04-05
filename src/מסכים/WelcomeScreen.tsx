import { useState, useEffect } from 'react';
import ActionButton from '../רכיבים/ActionButton';
import AmbientBackground from '../רכיבים/AmbientBackground';

interface Props {
  onStart: () => void;
}

interface TipStep {
  title: string;
  text: string;
  hasMusic?: boolean;
}

const TIPS: TipStep[] = [
  {
    title: 'שתי מים',
    text: 'כוס-שתיים של מים עכשיו. הגוף צריך נוזלים כדי להגיע לשיא מלא — גם להשפרצה. ברצינות.',
  },
  {
    title: 'לכי לשירותים',
    text: 'רוקנות שלפוחית לפני. בהמשך תרגישי לחץ שדומה לצורך לפנות — זה סימן טוב, לא סימן לעצור. אם התרוקנת לפני, תדעי שזה לא מה שנדמה.',
  },
  {
    title: 'מקום בטוח',
    text: 'מיטה, ספה, רצפה רכה. שימי מגבת מתחתייך — ככה תוכלי לשחרר בלי מחשבות. מנורה כבויה או אור נרות.',
  },
  {
    title: 'חומר סיכה או שמן',
    text: 'עם צעצוע סיליקון → חומר סיכה על בסיס מים בלבד (שמן הורס סיליקון). בלי צעצוע → שמן קוקוס מושלם: טבעי, חלק, לא מייבש. שימי על הידיים והגוף. מגע חלק = תחושות חזקות פי כמה.',
  },
  {
    title: 'צעצוע? הכיני אותו',
    text: 'אם יש לך ויברטור או כל צעצוע — עכשיו הזמן. תבדקי שהוא טעון, נקי, ומוכן לידך. לא חובה — אבל אם יש, הוא יכול לקחת אותך לרמה אחרת לגמרי.',
  },
  {
    title: 'מוזיקה שתיקח אותך',
    text: 'שימי פלייליסט חושני ברקע — מוזיקה איטית עם בס עמוק. מנגינה עוזרת לגוף להיכנס לקצב ומשחררת את הראש מלחשוב.',
    hasMusic: true,
  },
  {
    title: 'טלפון על שקט',
    text: 'הפרעה אחת קטנה שוברת את כל הבנייה. המסע הזה דורש 100% נוכחות — הגוף לא ישחרר אם הראש במקום אחר.',
  },
  {
    title: 'הכלל הכי חשוב',
    text: 'אל תנסי לשלוט. כשתרגישי שמשהו בונה — לא להתכווץ, לא להילחם. לדחוף החוצה בעדינות, כמו פתיחה. ככה הגוף מגיע לשיא האמיתי.',
  },
];

export default function WelcomeScreen({ onStart }: Props) {
  const [show, setShow] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 300);
    const t2 = setTimeout(() => setShowSub(true), 1200);
    const t3 = setTimeout(() => setCurrentStep(0), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  function handleNext() {
    if (currentStep < TIPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  const allDone = currentStep >= TIPS.length - 1;

  return (
    <div className="relative h-full flex flex-col">
      <AmbientBackground phase="ICE" />

      <div className="relative z-10 flex-1 flex flex-col items-center px-6 py-8 overflow-y-auto">
        <div className="flex flex-col items-center gap-5 text-center max-w-md w-full">

          {/* Moon icon */}
          <div className={`transition-all duration-1000 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center animate-breath-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(180,40,80,0.25) 0%, transparent 70%)',
                boxShadow: '0 0 60px rgba(180,40,80,0.15)',
              }}
            >
              <span className="text-3xl">🌙</span>
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-light text-white transition-all duration-1000 delay-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            ערב טוב, יפה
          </h1>

          {/* Subtitle */}
          <p className={`text-base text-white/50 font-light transition-all duration-1000 ${showSub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            לפני שמתחילות — כמה דברים קטנים שישנו הכל
          </p>

          {/* Progress dots */}
          {currentStep >= 0 && (
            <div className="flex gap-1.5 animate-fade-in">
              {TIPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i < currentStep
                      ? 'w-4 bg-green-400/60'
                      : i === currentStep
                        ? 'w-4 bg-warm-pink/50'
                        : 'w-1.5 bg-white/10'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Tips - step by step */}
          {currentStep >= 0 && (
            <div className="w-full flex flex-col gap-2 animate-fade-in">

              {/* Completed tips - collapsed with V */}
              {TIPS.slice(0, currentStep).map((tip, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl text-right"
                  style={{
                    background: 'rgba(74,222,128,0.05)',
                    border: '1px solid rgba(74,222,128,0.12)',
                  }}
                >
                  <span className="text-green-400/60 text-xs flex-shrink-0">✓</span>
                  <span className="text-green-300/40 text-sm">{tip.title}</span>
                </div>
              ))}

              {/* Current tip - expanded */}
              <div
                key={currentStep}
                className="animate-fade-in rounded-2xl px-5 py-4 text-right"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(236,72,153,0.15)',
                  boxShadow: '0 0 30px rgba(236,72,153,0.05)',
                }}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-warm-pink/60 text-xs font-bold">{currentStep + 1}/{TIPS.length}</span>
                    <p className="text-white/80 text-sm font-medium">{TIPS[currentStep].title}</p>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{TIPS[currentStep].text}</p>

                  {/* Music links */}
                  {TIPS[currentStep].hasMusic && (
                    <div className="flex gap-2 mt-2">
                      <a
                        href="https://open.spotify.com/search/sensual%20slow%20playlist"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-green-600/15 text-green-300/60 hover:text-green-300 border border-green-600/15 transition-all"
                      >
                        🎵 חפשי ב-Spotify
                      </a>
                    </div>
                  )}
                </div>

                {/* Next button inside card */}
                {!allDone && (
                  <button
                    onClick={handleNext}
                    className="w-full mt-3 pt-3 border-t border-white/5 text-white/30 hover:text-white/50 text-xs transition-all"
                  >
                    הבא →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Start button */}
          {allDone && (
            <div className="w-full animate-fade-in mt-2">
              <ActionButton onClick={onStart} className="w-full">
                הגיע הזמן שלך להתענג ←
              </ActionButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
