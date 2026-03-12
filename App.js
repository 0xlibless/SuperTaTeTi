import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useFonts, Bangers_400Regular } from '@expo-google-fonts/bangers';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import Menu from './screens/menu';
import Game from './screens/game';
import Lobby from './screens/lobby';
import Multiplayer from './screens/multiplayer';
import UpdateChecker from './hooks/updatechecker';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [screenParams, setScreenParams] = useState({});
  const [fontsLoaded] = useFonts({ Bangers_400Regular, Fredoka_700Bold });

  function navigate(to, params = {}) {
    setScreenParams(params);
    setScreen(to);
  }

  if (!fontsLoaded) return null;

  return (
    <>
      {screen === 'menu' && <Menu navigate={navigate} />}
      {screen === 'game' && <Game navigate={navigate} />}
      {screen === 'lobby' && <Lobby navigate={navigate} />}
      {screen === 'multiplayer' && (
        <Multiplayer navigate={navigate} roomId={screenParams.roomId} myRole={screenParams.myRole} />
      )}
      <UpdateChecker />
      <StatusBar style="light" />
    </>
  );
}
