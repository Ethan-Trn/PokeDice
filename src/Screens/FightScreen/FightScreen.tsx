import type { FightState } from '../../state/gameState';
import type { GameAction } from '../../state/gameReducer';
import PartyPanel from './PartyPanel';
import DiceArea from './DiceArea';
import './FightScreen.css';

interface Props {
  fightState: FightState;
  dispatch: (action: GameAction) => void;
}

export default function FightScreen({ fightState, dispatch }: Props) {
  const { turnState, log } = fightState;
  const canUndo = turnState.history.length > 0;
  const allLocked = turnState.rolls.length > 0 && turnState.rolls.every((r) => r.locked);

  return (
    <div className="fight-screen">

      <div className="fight-topbar">
        <span className="turn-label">TURN {fightState.turn}</span>
      </div>

      <div className="fight-arena">
        <PartyPanel
          party={fightState.playerParty}
          side="left"
          rolls={turnState.rolls}
          onDiceClick={(id) => dispatch({ type: 'LOCK_DICE', pokemonId: id })}
        />

        <DiceArea fightState={fightState} dispatch={dispatch} />

        <PartyPanel
          party={fightState.enemyParty}
          side="right"
          rolls={[]}
        />
      </div>

      <div className="fight-bottombar">
        <button
          className="action-btn reroll-btn"
          onClick={() => dispatch({ type: 'REROLL' })}
          disabled={turnState.rerollsRemaining <= 0}
        >
          REROLL ({turnState.rerollsRemaining}/2)
        </button>

        <button
          className="action-btn undo-btn"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={!canUndo}
        >
          UNDO
        </button>

        <button
          className="action-btn resolve-btn"
          onClick={() => dispatch({ type: 'RESOLVE_TURN' })}
          disabled={!allLocked}
        >
          RESOLVE TURN
        </button>
      </div>

      <div className="battle-log">
        {log.slice(-3).map((entry, i) => (
          <div key={i} className="log-entry">{entry}</div>
        ))}
      </div>

    </div>
  );
}