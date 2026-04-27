import { useState } from 'react';
import TitleScreen from './screens/TitleScreen/TitleScreen';
import FightScreen from './screens/FightScreen/FightScreen';

type Screen = 'title' | 'fight';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');

  return (
    <>
      {screen === 'title' && <TitleScreen onStart={() => setScreen('fight')} />}
      {screen === 'fight' && <FightScreen onBack={() => setScreen('title')} />}
    </>
  );
}