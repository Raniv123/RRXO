import { useState, useCallback } from 'react';
import { Screen, UserPreferences } from './types';
import PasswordScreen from './מסכים/PasswordScreen';
import WelcomeScreen from './מסכים/WelcomeScreen';
import PreferencesScreen from './מסכים/PreferencesScreen';
import BreathScreen from './מסכים/BreathScreen';
import JourneyScreen from './מסכים/JourneyScreen';
import CallHimScreen from './מסכים/CallHimScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('PASSWORD');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const handlePreferencesDone = useCallback((prefs: UserPreferences) => {
    setPreferences(prefs);
    setScreen('BREATH');
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('WELCOME');
    setPreferences(null);
  }, []);

  return (
    <div className="h-full w-full overflow-hidden font-heebo">
      {screen === 'PASSWORD' && (
        <PasswordScreen onUnlock={() => setScreen('WELCOME')} />
      )}

      {screen === 'WELCOME' && (
        <WelcomeScreen onStart={() => setScreen('PREFERENCES')} />
      )}

      {screen === 'PREFERENCES' && (
        <PreferencesScreen onDone={handlePreferencesDone} />
      )}

      {screen === 'BREATH' && (
        <BreathScreen onComplete={() => setScreen('JOURNEY')} />
      )}

      {screen === 'JOURNEY' && preferences && (
        <JourneyScreen
          preferences={preferences}
          onCallHim={() => setScreen('CALL_HIM')}
        />
      )}

      {screen === 'CALL_HIM' && (
        <CallHimScreen
          partnerName={preferences?.partnerName}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
