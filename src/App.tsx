import { useState, useCallback } from 'react';
import { Screen, UserPreferences } from './types';
import GiftBoxScreen from './מסכים/GiftBoxScreen';
import PasswordScreen from './מסכים/PasswordScreen';
import NamesScreen from './מסכים/NamesScreen';
import WelcomeScreen from './מסכים/WelcomeScreen';
import BreathScreen from './מסכים/BreathScreen';
import JourneyScreen from './מסכים/JourneyScreen';
import CallHimScreen from './מסכים/CallHimScreen';

interface SavedNames {
  user: string;
  partner: string;
}

function loadSavedNames(): SavedNames | null {
  try {
    const raw = localStorage.getItem('rrxo-names-v2');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedNames;
    if (typeof parsed.user === 'string' && typeof parsed.partner === 'string'
        && parsed.user.trim() && parsed.partner.trim()) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveNames(names: SavedNames) {
  try { localStorage.setItem('rrxo-names-v2', JSON.stringify(names)); } catch { /* ignore */ }
}

function getInitialScreen(): Screen {
  const giftSeen = localStorage.getItem('rrxo-gift-seen');
  return giftSeen ? 'PASSWORD' : 'GIFT_BOX';
}

/** Smooth screen wrapper */
function ScreenWrap({ children, screenKey }: { children: React.ReactNode; screenKey: Screen }) {
  return (
    <div key={screenKey} className="screen-fade h-full w-full">
      {children}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(getInitialScreen);
  const savedNames = loadSavedNames();
  const [preferences, setPreferences] = useState<UserPreferences>({
    hasToy: false,
    userName: savedNames?.user,
    partnerName: savedNames?.partner,
  });

  const handleGiftDone = useCallback(() => {
    localStorage.setItem('rrxo-gift-seen', '1');
    setScreen('PASSWORD');
  }, []);

  const handlePasswordUnlock = useCallback(() => {
    // If names already saved, skip the names screen
    if (savedNames?.user && savedNames?.partner) {
      setScreen('WELCOME');
    } else {
      setScreen('NAMES');
    }
  }, [savedNames]);

  const handleNamesDone = useCallback((userName: string, partnerName: string) => {
    saveNames({ user: userName, partner: partnerName });
    setPreferences(p => ({ ...p, userName, partnerName }));
    setScreen('WELCOME');
  }, []);

  const handleToyChoice = useCallback((hasToy: boolean) => {
    setPreferences(p => ({ ...p, hasToy }));
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('WELCOME');
    setPreferences(p => ({ ...p, hasToy: false }));
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
          <PasswordScreen onUnlock={handlePasswordUnlock} />
        </ScreenWrap>
      )}

      {screen === 'NAMES' && (
        <ScreenWrap screenKey="NAMES">
          <NamesScreen onDone={handleNamesDone} />
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
