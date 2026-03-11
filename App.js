import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useFonts, Bangers_400Regular } from '@expo-google-fonts/bangers';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import Menu from './screens/menu';
import Game from './screens/game';
import Multiplayer from './screens/multiplayer';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [fontsLoaded] = useFonts({ Bangers_400Regular, Fredoka_700Bold });

  if (!fontsLoaded) return null;

  return (
    <>
      {screen === 'menu' && <Menu navigate={setScreen} />}
      {screen === 'game' && <Game navigate={setScreen} />}
      {screen === 'multiplayer' && <Multiplayer navigate={setScreen} />}
      <StatusBar style="light" />
    </>
  );
}
