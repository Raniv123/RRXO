import { useState } from 'react';
import { UserPreferences } from '../types';
import GlassCard from '../רכיבים/GlassCard';
import ActionButton from '../רכיבים/ActionButton';
import AmbientBackground from '../רכיבים/AmbientBackground';

interface Props {
  onDone: (prefs: UserPreferences) => void;
}

type Step = 'mood' | 'toy' | 'comfort' | 'names';

const MOODS = [
  { value: 'relaxed' as const, label: 'רגועה', icon: '🧘‍♀️', desc: 'רוצה להתחיל לאט ובנעימות' },
  { value: 'curious' as const, label: 'סקרנית', icon: '✨', desc: 'פתוחה לגלות דברים חדשים' },
  { value: 'needy' as const, label: 'חסרה לי', icon: '🔥', desc: 'כבר מרגישה צורך' },
];

const COMFORT_LEVELS = [
  { value: 'gentle' as const, label: 'עדין', icon: '🌿', desc: 'לאט ובנעימות' },
  { value: 'moderate' as const, label: 'מאוזן', icon: '🌊', desc: 'קצב טבעי ונוח' },
  { value: 'intense' as const, label: 'אינטנסיבי', icon: '🔥', desc: 'ישיר וחזק' },
];

export default function PreferencesScreen({ onDone }: Props) {
  const [step, setStep] = useState<Step>('mood');
  const [mood, setMood] = useState<UserPreferences['mood']>('relaxed');
  const [hasToy, setHasToy] = useState(false);
  const [comfortLevel, setComfortLevel] = useState<UserPreferences['comfortLevel']>('moderate');
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');

  function handleFinish() {
    onDone({
      name: name.trim(),
      mood,
      hasToy,
      toyType: undefined,
      comfortLevel,
      partnerName: partnerName.trim() || undefined,
    });
  }

  return (
    <div className="relative h-full flex flex-col">
      <AmbientBackground phase="ICE" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Step: Mood */}
          {step === 'mood' && (
            <div className="animate-fade-in flex flex-col gap-4">
              <h2 className="text-2xl font-light text-center text-white mb-2">מה את מרגישה עכשיו?</h2>
              <div className="flex flex-col gap-3">
                {MOODS.map(m => (
                  <GlassCard
                    key={m.value}
                    onClick={() => { setMood(m.value); setStep('toy'); }}
                    className={`flex items-center gap-4 ${mood === m.value ? 'border-warm-pink/40' : ''}`}
                  >
                    <span className="text-3xl">{m.icon}</span>
                    <div>
                      <p className="text-white text-lg">{m.label}</p>
                      <p className="text-white/40 text-sm">{m.desc}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Step: Has toy? */}
          {step === 'toy' && (
            <div className="animate-fade-in flex flex-col gap-4">
              <h2 className="text-2xl font-light text-center text-white mb-2">יש לך צעצוע?</h2>
              <p className="text-center text-white/40 text-sm mb-2">ההנחיות יותאמו בהתאם</p>
              <div className="flex flex-col gap-3">
                <GlassCard onClick={() => { setHasToy(true); setStep('comfort'); }}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">💜</span>
                    <div>
                      <p className="text-white text-lg">כן, יש לי</p>
                      <p className="text-white/40 text-sm">אשלב אותו במסע</p>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard onClick={() => { setHasToy(false); setStep('comfort'); }}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🤲</span>
                    <div>
                      <p className="text-white text-lg">לא, רק ידיים</p>
                      <p className="text-white/40 text-sm">מגע עצמי בלבד</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* Step: Comfort level */}
          {step === 'comfort' && (
            <div className="animate-fade-in flex flex-col gap-4">
              <h2 className="text-2xl font-light text-center text-white mb-2">איזו עוצמה מתאימה לך?</h2>
              <div className="flex flex-col gap-3">
                {COMFORT_LEVELS.map(c => (
                  <GlassCard
                    key={c.value}
                    onClick={() => { setComfortLevel(c.value); setStep('names'); }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{c.icon}</span>
                      <div>
                        <p className="text-white text-lg">{c.label}</p>
                        <p className="text-white/40 text-sm">{c.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Step: Names */}
          {step === 'names' && (
            <div className="animate-fade-in flex flex-col gap-6">
              <h2 className="text-2xl font-light text-center text-white mb-2">עוד רגע מתחילות</h2>

              <GlassCard>
                <label className="block text-white/60 text-sm mb-2">שם שלך (אופציונלי)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="כדי שאפנה אלייך אישית"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-warm-pink/40 transition-colors"
                />
              </GlassCard>

              <GlassCard>
                <label className="block text-white/60 text-sm mb-2">שם בן הזוג (אופציונלי)</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={e => setPartnerName(e.target.value)}
                  placeholder="למסר בסוף המסע"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-warm-pink/40 transition-colors"
                />
              </GlassCard>

              <ActionButton onClick={handleFinish} className="w-full">
                אני מוכנה ←
              </ActionButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
