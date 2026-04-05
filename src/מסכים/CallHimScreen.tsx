import { useState, useEffect, useRef } from 'react';
import AmbientBackground from '../רכיבים/AmbientBackground';
import ActionButton from '../רכיבים/ActionButton';

interface Props {
  onRestart: () => void;
}

interface MessageOption {
  id: string;
  label: string;
  message: string;
  tip: string;
  tipTitle: string;
}

const MESSAGES: MessageOption[] = [
  {
    id: 'oral-give',
    label: 'אני רוצה לרדת לך...',
    message: 'בוא. אני רוצה לרדת לך ולהרגיש אותך מתקשה בפה שלי. תן לי לטעום אותך עכשיו.',
    tipTitle: 'איך לרדת לו ברמה שתטריף אותו',
    tip: 'תתחילי בנשיקות לאט על הירכיים הפנימיות — אל תיגעי שם עדיין. כשתגיעי, לשון שטוחה ורחבה מהבסיס עד הקצה. עכשיו — שאיבה: תסגרי שפתיים סביב הראש, לחץ קל כמו שותה משאייק עבה דרך קשית. הוסיפי זמזום — הרטט דרך השפתיים מטריף אותו. יד אחת מלפלת את הבסיס בסנכרון עם הפה, השנייה מלטפת ביצים בעדינות. הקצב שהורג: לאט ← מהר ← לאט. כשתרגישי שהוא מתקרב — אל תשני כלום.',
  },
  {
    id: 'hard',
    label: 'תדחוף לי הכי חזק...',
    message: 'אני רטובה ומוכנה. בוא תיכנס לי הכי עמוק שאתה יכול. אני רוצה להרגיש אותך מלא בפנים.',
    tipTitle: 'מה הכי מטריף בחדירה עמוקה',
    tip: 'תני לו להיכנס לאט בהתחלה — כמה חדירות רדודות שרק הראש נכנס, זה ייקח לו את השכל. אחרי זה שיכנס עמוק ואיטי. כרית מתחת לאגן שלך משנה את הזווית לגמרי — הוא מגיע ל-G-spot ישירות. נדנדי את האגן מולו, אל תשכבי פסיבית — התנועה המשותפת מכפילה הנאה לשניכם. תגידי לו מה מרגיש טוב, תגידי את השם שלו — הקול שלך הוא הדבר הכי מטריף שיש.',
  },
  {
    id: 'oral-receive',
    label: 'תרד לי...',
    message: 'בוא לפה. אני רוצה להרגיש את הלשון שלך עליי. תרד לי עד שאני אגמור על הפנים שלך.',
    tipTitle: 'מה הכי מטריף כשהוא יורד לך',
    tip: 'תגידי לו: לשון רחבה ושטוחה, לא חדה — כמו שמלקק גלידה. עיגולים איטיים סביב הדגדגן בלי לגעת ישירות בהתחלה. שאיבה עדינה על הדגדגן = טילים. כשמשהו עובד — שלא ישנה קצב בשום מצב, גם אם את רועדת. שתי אצבעות בפנים שמתעקלות למעלה (כמו "בואי לפה") על ה-G-spot בזמן שהלשון על הדגדגן — זה הקומבו שמביא לשיא הכי חזק. אם הוא מזמזם על הדגדגן — זה מכפיל הכל פי עשר.',
  },
  {
    id: 'custom',
    label: 'יש לי משהו משלי...',
    message: '',
    tipTitle: '',
    tip: '',
  },
];

export default function CallHimScreen({ onRestart }: Props) {
  const [show, setShow] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showTip, setShowTip] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => setShow(true), 300);
    setTimeout(() => setShowQuestion(true), 1000);
    setTimeout(() => setShowOptions(true), 1800);
  }, []);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  function getWhatsAppLink(text: string) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  function handleSelect(msg: MessageOption) {
    if (msg.id === 'custom') {
      setShowCustomInput(true);
      setSelectedId('custom');
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    setSelectedId(msg.id);
    copyToClipboard(msg.message);
  }

  function handleCustomSend() {
    if (customText.trim()) {
      copyToClipboard(customText.trim());
      setSelectedId('custom-sent');
    }
  }

  const selectedMsg = MESSAGES.find(m => m.id === selectedId);

  return (
    <div className="relative h-full flex flex-col">
      <AmbientBackground phase="FIRE" />

      <div className="relative z-10 flex-1 flex flex-col items-center px-5 py-6 overflow-y-auto">
        <div className="w-full max-w-md flex flex-col items-center gap-5">

          {/* Heart icon — smaller, faster */}
          <div className={`transition-all duration-700 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center animate-heartbeat"
              style={{
                background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)',
                boxShadow: '0 0 40px rgba(239,68,68,0.15)',
              }}
            >
              <span className="text-3xl">💋</span>
            </div>
          </div>

          {/* Question */}
          <div className={`flex flex-col gap-1 text-center transition-all duration-800 ${showQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-2xl font-light text-white">
              מה את רוצה לומר לגבר שלך?
            </h1>
            <p className="text-white/35 text-xs">
              לחצי על הודעה — היא תועתק אוטומטית
            </p>
          </div>

          {/* Message options */}
          <div className={`w-full flex flex-col gap-2.5 transition-all duration-700 ${showOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {MESSAGES.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-0">
                {/* Message card */}
                <div className="flex gap-2 items-start">
                  <button
                    onClick={() => handleSelect(msg)}
                    className={`flex-1 text-right rounded-2xl px-5 py-3.5 transition-all duration-300 ${
                      selectedId === msg.id ? 'scale-[1.01]' : 'hover:scale-[1.005] active:scale-[0.99]'
                    }`}
                    style={{
                      background: selectedId === msg.id
                        ? 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(239,68,68,0.15) 100%)'
                        : 'rgba(255,255,255,0.04)',
                      border: selectedId === msg.id
                        ? '1px solid rgba(236,72,153,0.35)'
                        : '1px solid rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <p className={`text-base font-light leading-relaxed ${
                      selectedId === msg.id ? 'text-white' : 'text-white/75'
                    }`}>
                      {msg.label}
                    </p>

                    {/* Show the actual message after selection */}
                    {selectedId === msg.id && msg.id !== 'custom' && (
                      <div className="mt-2.5 pt-2.5 border-t border-white/10 animate-fade-in">
                        <p className="text-white/55 text-sm leading-relaxed italic">
                          "{msg.message}"
                        </p>
                        {/* Action buttons inline */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(msg.message); }}
                            className="flex-1 py-2 rounded-xl text-xs bg-white/5 text-white/50 hover:text-white/70 border border-white/10 transition-all"
                          >
                            📋 העתיקי
                          </button>
                          <a
                            href={getWhatsAppLink(msg.message)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="w-full py-2 rounded-xl text-xs bg-green-600/20 text-green-300/70 hover:text-green-300 border border-green-600/20 transition-all">
                              💬 שלחי בוואטסאפ
                            </button>
                          </a>
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Tip button — exclamation mark */}
                  {msg.id !== 'custom' && (
                    <button
                      onClick={() => setShowTip(showTip === msg.id ? null : msg.id)}
                      className={`mt-3 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        showTip === msg.id
                          ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                          : 'bg-white/5 text-white/25 hover:text-amber-300/60 border border-white/5'
                      }`}
                    >
                      <span className="text-sm font-bold">!</span>
                    </button>
                  )}
                </div>

                {/* Tip tooltip */}
                {showTip === msg.id && msg.tip && (
                  <div className="animate-fade-in mx-2 mt-1.5 mb-1 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-300/80 font-medium mb-1">{msg.tipTitle}</p>
                    <p className="text-xs text-amber-200/50 leading-relaxed">{msg.tip}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Custom input */}
            {showCustomInput && (
              <div className="animate-fade-in rounded-2xl px-5 py-4"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(168,85,247,0.25)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <textarea
                  ref={inputRef}
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="כתבי מה שבא לך..."
                  rows={3}
                  className="w-full bg-transparent text-white placeholder-white/20 outline-none resize-none text-right text-sm leading-relaxed"
                  dir="rtl"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleCustomSend}
                    disabled={!customText.trim()}
                    className={`flex-1 py-2 rounded-xl text-xs transition-all ${
                      customText.trim()
                        ? 'bg-white/10 text-white/60 hover:text-white/80 border border-white/10'
                        : 'bg-white/3 text-white/15 border border-white/5'
                    }`}
                  >
                    📋 העתיקי
                  </button>
                  {customText.trim() && (
                    <a
                      href={getWhatsAppLink(customText.trim())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <button className="w-full py-2 rounded-xl text-xs bg-green-600/20 text-green-300/70 hover:text-green-300 border border-green-600/20 transition-all">
                        💬 שלחי בוואטסאפ
                      </button>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Copied confirmation */}
          {copied && (
            <div className="animate-fade-in flex items-center gap-2 bg-green-500/15 border border-green-500/25 rounded-xl px-4 py-2.5">
              <span className="text-green-400">✓</span>
              <p className="text-green-300/70 text-xs">הועתק! תדביקי לו בהודעה</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom — finish button */}
      <div className="relative z-10 px-5" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-md mx-auto">
          <ActionButton onClick={onRestart} variant="ghost" className="w-full">
            ♡ סיימתי
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
