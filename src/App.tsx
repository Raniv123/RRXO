import { useState, useCallback } from 'react';
import { Screen, UserPreferences } from './types';
import GiftBoxScreen from './מסכים/GiftBoxScreen';
import PasswordScreen from './מסכים/PasswordScreen';
import WelcomeScreen from './מסכים/WelcomeScreen';
import BreathScreen from './מסכים/BreathScreen';
import JourneyScreen from './מסכים/JourneyScreen';
import CallHimScreen from './מסכים/CallHimScreen';

function getInitialScreen(): Screen {
  const giftSeen = localStorage.getItem('rrxo-gift-seen');
  return giftSeen ? 'PASSWORD' : 'GIFT_BOX';
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(getInitialScreen);
  const [preferences, setPreferences] = useState<UserPreferences>({ hasToy: false });

  const handleGiftDone = useCallback(() => {
    localStorage.setItem('rrxo-gift-seen', '1');
    setScreen('PASSWORD');
  }, []);

  const handleToyChoice = useCallback((hasToy: boolean) => {
    setPreferences({ hasToy });
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('WELCOME');
    setPreferences({ hasToy: false });
  }, []);

  return (
    <div className="h-full w-full overflow-hidden font-heebo">
      {screen === 'GIFT_BOX' && (
        <GiftBoxScreen onDone={handleGiftDone} />
      )}

      {screen === 'PASSWORD' && (
        <PasswordScreen onUnlock={() => setScreen('WELCOME')} />
      )}

      {screen === 'WELCOME' && (
        <WelcomeScreen onStart={() => setScreen('BREATH')} />
      )}

      {screen === 'BREATH' && (
        <BreathScreen onComplete={() => setScreen('JOURNEY')} />
      )}

      {screen === 'JOURNEY' && (
        <JourneyScreen
          preferences={preferences}
          onToyChoice={handleToyChoice}
          onCallHim={() => setScreen('CALL_HIM')}
        />
      )}

      {screen === 'CALL_HIM' && (
        <CallHimScreen
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
