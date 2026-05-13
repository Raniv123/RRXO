import { useState, useEffect, useCallback, useRef } from 'react';
import { UserPreferences, Phase, AIGuideResponse } from '../types';
import { getNextGuidance } from '../שירותים/ai-guide';
import { resetFantasy, switchFantasy } from '../נתונים/guided-content';
import AmbientBackground from '../רכיבים/AmbientBackground';
import PhaseProgress from '../רכיבים/PhaseProgress';
import GlassCard from '../רכיבים/GlassCard';
import GuidedText from '../רכיבים/GuidedText';
import ActionButton from '../רכיבים/ActionButton';
import BreathGuide from '../רכיבים/BreathGuide';
import TaskTimer from '../רכיבים/TaskTimer';

interface Props {
  preferences: UserPreferences;
  onToyChoice: (hasToy: boolean) => void;
  onCallHim: () => void;
}

function getPhaseFromTension(t: number): Phase {
  if (t >= 75) return 'FIRE';
  if (t >= 50) return 'HOT';
  if (t >= 25) return 'WARM';
  return 'ICE';
}

const PHASE_LABELS: Record<Phase, string> = {
  ICE: 'הרפיה',
  WARM: 'חימום',
  HOT: 'לוהט',
  FIRE: 'שיא',
};

// Term explanations
const TERM_GLOSSARY: Record<string, string> = {
  'אוקסיטוצין': 'הורמון הנאה וקרבה — משתחרר במגע, חיבוק, וגירוי פטמות. מעצים תחושות בכל הגוף.',
  'ברדס': 'העור הרך שמכסה את הדגדגן מלמעלה — מגע דרכו נעים יותר ופחות ישיר.',
  'רצפת אגן': 'שרירים בתחתית האגן — כיווץ ושחרור שלהם מגביר תחושות ומעצים אורגזמה.',
  'טכניקת V': 'שתי אצבעות כמו V משני צדי הברדס — גירוי עקיף ועדין של הדגדגן.',
};

function findTermsInText(text: string): string[] {
  const found: string[] = [];
  for (const term of Object.keys(TERM_GLOSSARY)) {
    if (text.includes(term)) found.push(term);
  }
  return found;
}

/** Detect if task contains breathing instructions */
function detectBreathing(task: string): { inhale: number; hold: number; exhale: number; rounds: number } | null {
  // Match patterns like "שאפי 5 שניות" "עצרי 3" "נשפי 7"
  const inhaleMatch = task.match(/שאפי\s*(\d+)/);
  const holdMatch = task.match(/עצרי\s*(\d+)/);
  const exhaleMatch = task.match(/נשפי\s*(\d+)/);

  if (inhaleMatch && exhaleMatch) {
    // Detect rounds: "חזרי 5 פעמים" / "5 פעמים" / "חזרי X"
    const roundsMatch = task.match(/חזר[יו]\s*(\d+)/) || task.match(/(\d+)\s*פעמ/);
    const rounds = roundsMatch ? parseInt(roundsMatch[1]) : 3;

    return {
      inhale: parseInt(inhaleMatch[1]),
      hold: holdMatch ? parseInt(holdMatch[1]) : 0,
      exhale: parseInt(exhaleMatch[1]),
      rounds,
    };
  }
  return null;
}

/** Keywords that indicate a physical task needing time */
const TASK_KEYWORDS = [
  'עיסוי', 'ליטוף', 'לטפי', 'מלטפת', 'עגולים', 'תנועות', 'לחצי', 'לחץ',
  'כיווץ', 'כווצי', 'שחררי', 'המשיכי', 'החליקי', 'העבירי', 'הניחי',
  'פתחי', 'קרבי', 'הרחיקי', 'החזיקי', 'משכי', 'גררי',
  'ויברטור', 'צעצוע', 'אצבע', 'אצבעות', 'כף יד', 'דגדגן',
  'שניות', 'דקה', 'דקות', 'לאט', 'בעדינות', 'בחוזקה',
  'מעגלים', 'הקשי', 'רטט', 'גירוי', 'מגע',
];

/** Check if task text describes a physical action needing time */
function isPhysicalTask(task: string): boolean {
  return TASK_KEYWORDS.some(kw => task.includes(kw));
}

/** Estimate task duration based on content */
function getTaskDuration(task: string, phase: Phase): number {
  // Breathing tasks are handled by BreathGuide
  if (detectBreathing(task)) return 0;

  // Only show timer for physical tasks that need time
  if (!isPhysicalTask(task)) return 0;

  // Check if text specifies seconds/minutes
  const secMatch = task.match(/(\d+)\s*שניות/);
  if (secMatch) return parseInt(secMatch[1]);
  const minMatch = task.match(/(\d+)\s*דקו?ת?/);
  if (minMatch) return parseInt(minMatch[1]) * 60;

  // HOT/FIRE — no timer, let her flow without pressure
  if (phase === 'HOT' || phase === 'FIRE') return 0;

  // ICE/WARM — generous time, no rush
  if (phase === 'ICE') return 40;
  return 30; // WARM
}

export default function JourneyScreen({ preferences, onToyChoice, onCallHim }: Props) {
  const [phase, setPhase] = useState<Phase>('ICE');
  const [tension, setTension] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<AIGuideResponse | null>(null);
  const [textDone, setTextDone] = useState(false);
  const [fading, setFading] = useState(false);
  const mountedRef = useRef(false);

  // Toy popup state
  const [showToyPopup, setShowToyPopup] = useState(false);
  const [toyAsked, setToyAsked] = useState(false);

  // Term tooltip state
  const [showTermTooltip, setShowTermTooltip] = useState<string | null>(null);

  // Task timer state
  const [timerDone, setTimerDone] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  // Refs
  const tensionRef = useRef(tension);
  const phaseRef = useRef(phase);
  const stepRef = useRef(stepIndex);
  const historyRef = useRef(history);
  const currentRef = useRef(current);
  const prefsRef = useRef(preferences);
  tensionRef.current = tension;
  phaseRef.current = phase;
  stepRef.current = stepIndex;
  historyRef.current = history;
  currentRef.current = current;
  prefsRef.current = preferences;

  const loadGuidance = useCallback(async (overrideTension?: number, overridePhase?: Phase) => {
    if (currentRef.current) {
      setFading(true);
      await new Promise(r => setTimeout(r, 500));
    }
    setFading(false);
    setCurrent(null);
    setLoading(true);
    setTextDone(false);
    setShowTermTooltip(null);
    setTimerDone(false);
    setTimerKey(k => k + 1);

    const useTension = overrideTension ?? tensionRef.current;
    const usePhase = overridePhase ?? phaseRef.current;

    try {
      const response = await getNextGuidance(prefsRef.current, usePhase, useTension, stepRef.current, historyRef.current);

      setCurrent(response);
      setTension(response.tension);
      setStepIndex(i => i + 1);
      setHistory(h => [...h.slice(-15), response.currentInstruction]);
      setPhase(response.phase);

      // Show toy popup mid-WARM
      if (!toyAsked && response.tension >= 33 && response.tension < 45 && response.phase === 'WARM') {
        setToyAsked(true);
        setTimeout(() => setShowToyPopup(true), 2000);
      }

      // readyToCall → go to call screen
      if (response.readyToCall) {
        setTimeout(() => onCallHim(), 4000);
      }

    } catch {
      // Fallback handled in ai-guide
    } finally {
      setLoading(false);
    }
  }, [onCallHim, toyAsked]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    resetFantasy();
    loadGuidance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance after timer/breathing completes — generous pause
  useEffect(() => {
    if (!timerDone || loading || !current) return;
    const delay = phase === 'ICE' ? 5000 : phase === 'WARM' ? 4000 : 3000;
    const timeout = setTimeout(() => {
      loadGuidance();
    }, delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerDone]);

  function handleToySelect(hasToy: boolean) {
    onToyChoice(hasToy);
    setShowToyPopup(false);
  }

  // Detect breathing and timer for current task
  const breathData = current?.task ? detectBreathing(current.task) : null;
  const taskDuration = current?.task ? getTaskDuration(current.task, phase) : 0;
  const termsInTask = current?.task ? findTermsInText(current.task) : [];

  return (
    <div className="relative h-full flex flex-col">
      <AmbientBackground phase={phase} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="pt-6 pb-4 px-4 relative">
          <PhaseProgress currentPhase={phase} tension={tension} />

          {/* Switch story button */}
          <button
            onClick={() => {
              switchFantasy();
              setStepIndex(0);
              setHistory([]);
              loadGuidance(tension, phase);
            }}
            disabled={loading}
            className="absolute top-6 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300/50 hover:text-purple-300/80 hover:bg-purple-500/15 transition-all disabled:opacity-30"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/>
            </svg>
            <span className="text-xs">סיפור אחר</span>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-4 overflow-y-auto">
          {current && !showToyPopup && (
            <div className={`w-full max-w-md flex flex-col gap-5 transition-opacity duration-500 ease-out ${fading ? 'opacity-0' : 'animate-fade-in'}`}>
              {/* Phase indicator */}
              <div className="flex items-center gap-3 justify-center">
                <div className={`w-2 h-2 rounded-full ${
                  phase === 'ICE' ? 'bg-cyan-400' :
                  phase === 'WARM' ? 'bg-purple-400' :
                  phase === 'HOT' ? 'bg-warm-pink' :
                  'bg-red-500 animate-pulse'
                }`} />
                <span className="text-white/40 text-sm tracking-widest uppercase">
                  {PHASE_LABELS[phase]}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  phase === 'ICE' ? 'bg-cyan-400' :
                  phase === 'WARM' ? 'bg-purple-400' :
                  phase === 'HOT' ? 'bg-warm-pink' :
                  'bg-red-500 animate-pulse'
                }`} />
              </div>

              {/* Fantasy story — dramatic typography */}
              <GlassCard className="!p-8">
                <GuidedText
                  text={current.currentInstruction}
                  speed={phase === 'ICE' ? 80 : phase === 'WARM' ? 65 : 55}
                  className="text-[26px] font-extralight text-white/95 leading-[1.7] tracking-tight text-center"
                  onDone={() => setTextDone(true)}
                />
              </GlassCard>

              {/* Task — physical instruction */}
              {textDone && current.task && (
                <div className="animate-fade-in border border-white/10 rounded-2xl px-5 py-3 bg-white/5 backdrop-blur-sm flex flex-col gap-3">
                  <p className="text-center text-white/60 text-sm leading-relaxed">
                    {current.task}
                  </p>

                  {/* Breathing guide */}
                  {breathData && (
                    <BreathGuide
                      key={timerKey}
                      inhale={breathData.inhale}
                      hold={breathData.hold}
                      exhale={breathData.exhale}
                      rounds={breathData.rounds}
                      onDone={() => setTimerDone(true)}
                    />
                  )}

                  {/* Task timer (for non-breathing tasks) */}
                  {!breathData && taskDuration > 0 && (
                    <TaskTimer
                      key={timerKey}
                      duration={taskDuration}
                      onDone={() => setTimerDone(true)}
                    />
                  )}

                  {/* Term explanation buttons */}
                  {termsInTask.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-white/5">
                      {termsInTask.map(term => (
                        <button
                          key={term}
                          onClick={() => setShowTermTooltip(showTermTooltip === term ? null : term)}
                          className={`text-xs px-2 py-1 rounded-lg transition-all ${
                            showTermTooltip === term
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-white/5 text-white/30 hover:text-white/50 border border-white/5'
                          }`}
                        >
                          ?{term}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Term tooltip */}
                  {showTermTooltip && TERM_GLOSSARY[showTermTooltip] && (
                    <div className="animate-fade-in px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-xs text-purple-300/70 leading-relaxed text-center">
                        {TERM_GLOSSARY[showTermTooltip]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Whisper — serif, neon halo, intimate */}
              {textDone && current.whisper && (
                <p
                  className="text-center text-sm italic animate-fade-in tracking-widest"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    color: 'rgba(232,121,249,0.78)',
                    textShadow: '0 0 14px rgba(232,121,249,0.45), 0 0 28px rgba(232,121,249,0.15)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {current.whisper}
                </p>
              )}
            </div>
          )}

          {/* Toy Popup */}
          {showToyPopup && (
            <div className="w-full max-w-md animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.15) 50%, rgba(239,68,68,0.1) 100%)',
                  boxShadow: '0 0 60px rgba(236,72,153,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                  border: '1px solid rgba(236,72,153,0.2)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="px-8 py-10 flex flex-col items-center gap-6">
                  <div className="w-4 h-4 rounded-full bg-purple-400/60 animate-pulse"
                    style={{ boxShadow: '0 0 30px rgba(168,85,247,0.4)' }}
                  />
                  <p className="text-xl font-light text-white/90 text-center leading-relaxed">
                    הגוף שלך כבר מוכן ליותר...
                  </p>
                  <p className="text-white/50 text-sm text-center">
                    יש לך משהו שיכול להגביר את ההנאה?
                  </p>
                  <div className="flex flex-col gap-3 w-full mt-2">
                    <button
                      onClick={() => handleToySelect(true)}
                      className="w-full py-4 px-6 rounded-2xl text-white font-light text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.3) 100%)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        boxShadow: '0 0 30px rgba(168,85,247,0.1)',
                      }}
                    >
                      <span className="flex items-center justify-center gap-3">
                        <span className="text-2xl">💜</span>
                        <span>יש לי... אני לוקחת אותו</span>
                      </span>
                    </button>
                    <button
                      onClick={() => handleToySelect(false)}
                      className="w-full py-3 px-6 rounded-2xl text-white/50 hover:text-white/70 text-sm transition-all duration-300"
                    >
                      ממשיכה ככה
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-warm-pink/50 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-warm-pink/50 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-warm-pink/50 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>

        {/* Bottom actions — always available, she chooses when to continue */}
        {!showToyPopup && !current?.readyToCall && (
          <div className="px-5" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}>
            <div className="max-w-md mx-auto">
              <ActionButton
                onClick={() => loadGuidance()}
                disabled={loading}
                className="w-full"
              >
                ממשיכה
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
