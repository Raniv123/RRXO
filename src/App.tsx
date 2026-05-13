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

/** Smooth screen wrapper — fade + light blur between mounted screens */
function ScreenWrap({ children, screenKey }: { children: React.ReactNode; screenKey: Screen }) {
  return (
    <div key={screenKey} className="screen-fade h-full w-full">
      {children}
    </div>
  );
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
        <ScreenWrap screenKey="GIFT_BOX">
          <GiftBoxScreen onDone={handleGiftDone} />
        </ScreenWrap>
      )}

      {screen === 'PASSWORD' && (
        <ScreenWrap screenKey="PASSWORD">
          <PasswordScreen onUnlock={() => setScreen('WELCOME')} />
        </ScreenWrap>
      )}

      {screen === 'WELCOME' && (
        <ScreenWrap screenKey="WELCOME">
          <WelcomeScreen onStart={() => setScreen('BREATH')} />
        </ScreenWrap>
      )}

      {screen === 'BREATH' && (
        <ScreenWrap screenKey="BREATH">
          <BreathScreen onComplete={() => setScreen('JOURNEY')} />
        </ScreenWrap>
      )}

      {screen === 'JOURNEY' && (
        <ScreenWrap screenKey="JOURNEY">
          <JourneyScreen
            preferences={preferences}
            onToyChoice={handleToyChoice}
            onCallHim={() => setScreen('CALL_HIM')}
          />
        </ScreenWrap>
      )}

      {screen === 'CALL_HIM' && (
        <ScreenWrap screenKey="CALL_HIM">
          <CallHimScreen
            onRestart={handleRestart}
          />
        </ScreenWrap>
      )}
    </div>
  );
}
