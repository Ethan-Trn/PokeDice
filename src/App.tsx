import { useReducer } from 'react';
import { gameReducer } from './state/gameReducer';
import { initialRunState } from './state/gameState';
import TitleScreen from './Screens/TitleScreen/TitleScreen';
import FightScreen from './Screens/FightScreen/FightScreen';
import { allPokemon } from './PokeData/pokemon';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialRunState);

  // temp: start a test fight with treeko vs treeko when pressing start
  function handleStart() {
    // will be replaced with proper draft screen later
    dispatch({
      type: 'START_FIGHT',
      playerParty: [allPokemon[0], allPokemon[2]],
      enemyParty: [allPokemon[1]],
    });
  }

  return (
    <>
      {state.phase === 'title' && (
        <TitleScreen onStart={handleStart} />
      )}
      {state.phase === 'fight' && state.fightState && (
        <FightScreen
          fightState={state.fightState}
          dispatch={dispatch}
        />
      )}
      {/* default to title screen if phase not yet handled */}
      {state.phase !== 'fight' && state.phase !== 'title' && (
        <TitleScreen onStart={handleStart} />
      )}
    </>
  );
}