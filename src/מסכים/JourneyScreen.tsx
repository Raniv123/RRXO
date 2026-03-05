import { useState, useEffect, useCallback, useRef } from 'react';
import { UserPreferences, Phase, AIGuideResponse } from '../types';
import { getNextGuidance } from '../שירותים/ai-guide';
import AmbientBackground from '../רכיבים/AmbientBackground';
import PhaseProgress from '../רכיבים/PhaseProgress';
import GlassCard from '../רכיבים/GlassCard';
import GuidedText from '../רכיבים/GuidedText';
import ActionButton from '../רכיבים/ActionButton';

interface Props {
  preferences: UserPreferences;
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

export default function JourneyScreen({ preferences, onCallHim }: Props) {
  const [phase, setPhase] = useState<Phase>('WARM');
  const [tension, setTension] = useState(20);
  const [stepIndex, setStepIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<AIGuideResponse | null>(null);
  const [textDone, setTextDone] = useState(false);

  // Refs to always have latest values in callbacks
  const tensionRef = useRef(tension);
  const phaseRef = useRef(phase);
  const stepRef = useRef(stepIndex);
  const historyRef = useRef(history);
  tensionRef.current = tension;
  phaseRef.current = phase;
  stepRef.current = stepIndex;
  historyRef.current = history;

  const loadGuidance = useCallback(async (overrideTension?: number, overridePhase?: Phase) => {
    setLoading(true);
    setTextDone(false);

    const useTension = overrideTension ?? tensionRef.current;
    const usePhase = overridePhase ?? phaseRef.current;

    try {
      const response = await getNextGuidance(preferences, usePhase, useTension, stepRef.current, historyRef.current);

      setCurrent(response);
      setTension(response.tension);
      setStepIndex(i => i + 1);
      setHistory(h => [...h.slice(-5), response.currentInstruction]);

      const newPhase = getPhaseFromTension(response.tension);
      setPhase(newPhase);

      if (response.readyToCall) {
        setTimeout(() => onCallHim(), 3000);
      }
    } catch {
      // Fallback handled in ai-guide
    } finally {
      setLoading(false);
    }
  }, [preferences, onCallHim]);

  // Load first guidance on mount
  useEffect(() => {
    loadGuidance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(async () => {
    setLoading(true);
    setTextDone(false);

    try {
      const response = await getNextGuidance(preferences, phaseRef.current, Math.max(tensionRef.current - 3, 0), stepRef.current, historyRef.current);
      setCurrent(response);
      setTension(Math.min(response.tension, tensionRef.current + 3));
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  const slowDown = useCallback(() => {
    const newTension = Math.max(0, tensionRef.current - 8);
    setTension(newTension);
    loadGuidance(newTension, getPhaseFromTension(newTension));
  }, [loadGuidance]);

  return (
    <div className="relative h-full flex flex-col">
      <AmbientBackground phase={phase} />

      {/* Floating "Call Him" button — bottom-left on mobile */}
      {tension >= 30 && (
        <button
          onClick={onCallHim}
          className="fixed left-4 bottom-6 z-50
            bg-warm-pink/20 hover:bg-warm-pink/40 backdrop-blur-md
            border border-warm-pink/30 rounded-full px-4 py-2.5
            text-white/70 hover:text-white text-xs
            transition-all duration-300 hover:scale-105
            shadow-lg shadow-warm-pink/10"
          style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0px))' }}
        >
          קראי לו →
        </button>
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* Header — Phase progress */}
        <div className="pt-6 pb-4 px-4">
          <PhaseProgress currentPhase={phase} tension={tension} />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-4 overflow-y-auto">
          {current && (
            <div className="w-full max-w-md flex flex-col gap-5 animate-fade-in">
              {/* Phase indicator — cinematic, no emoji */}
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

              {/* Main instruction */}
              <GlassCard className="!p-8">
                <GuidedText
                  text={current.currentInstruction}
                  speed={60}
                  className="text-xl font-light text-white leading-relaxed text-center"
                  onDone={() => setTextDone(true)}
                />
              </GlassCard>

              {/* Detailed guidance */}
              {textDone && current.detailedGuidance && (
                <div className="animate-fade-in">
                  <GlassCard className="!p-5 !bg-white/[0.03]">
                    <p className="text-white/60 text-base leading-relaxed text-center">
                      {current.detailedGuidance}
                    </p>
                  </GlassCard>
                </div>
              )}

              {/* Whisper */}
              {textDone && current.whisper && (
                <p className="text-center text-sexy-fuchsia/50 text-sm italic animate-fade-in">
                  "{current.whisper}"
                </p>
              )}

              {/* Encouragement */}
              {textDone && current.encouragement && (
                <p className="text-center text-warm-pink/60 text-sm animate-fade-in">
                  {current.encouragement}
                </p>
              )}

              {/* Breath pattern */}
              {textDone && current.breathPattern && (
                <p className="text-center text-electric-blue/40 text-xs animate-fade-in">
                  {current.breathPattern}
                </p>
              )}
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

        {/* Bottom actions */}
        <div className="px-5" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}>
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <ActionButton onClick={() => loadGuidance()} disabled={loading} className="w-full">
              ממשיכה
            </ActionButton>

            <ActionButton onClick={loadMore} variant="secondary" disabled={loading} className="w-full">
              עוד מזה
            </ActionButton>

            <ActionButton onClick={slowDown} variant="ghost" disabled={loading} className="w-full text-sm">
              אט אט...
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
