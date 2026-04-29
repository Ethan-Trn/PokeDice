import { useState } from 'react';
import type { FightState } from '../../state/gameState';
import type { GameAction } from '../../state/gameReducer';
import PlayerPanel from './PlayerPanel';
import EnemyPanel from './EnemyPanel';
import DiceArea from './DiceArea';
import './FightScreen.css';

interface Props {
  fightState: FightState;
  dispatch: (action: GameAction) => void;
}

export interface TargetingState {
  attackerId: string;
  power: number;
}

function allDone(fightState: FightState): boolean {
  const { rolls, usageMap } = fightState.turnState;
  return rolls.every((r) => {
    if (r.locked) return true;
    const key = `${r.pokemonId}_${r.rolledFaceSlot}`;
    return key in usageMap && usageMap[key] <= 0;
  });
}

export default function FightScreen({ fightState, dispatch }: Props) {
  const { turnState, log } = fightState;
  const canUndo = turnState.history.length > 0;
  const canResolve = allDone(fightState);
  const [targeting, setTargeting] = useState<TargetingState | null>(null);

  function handlePlayerCardClick(pokemonId: string) {
    const roll = turnState.rolls.find((r) => r.pokemonId === pokemonId);
    if (!roll?.locked) return;
    const pokemon = fightState.playerParty.find((p) => p.id === pokemonId);
    if (!pokemon) return;
    const face = pokemon.dice.faces[roll.rolledFaceSlot - 1];
    if (face.move.category !== 'attack') return;
    if (targeting?.attackerId === pokemonId) {
      setTargeting(null);
    } else {
      const power = face.powerOverride ?? face.move.basePower;
      setTargeting({ attackerId: pokemonId, power });
    }
  }

  function handleEnemyClick(targetId: string) {
    if (!targeting) return;
    dispatch({ type: 'DEAL_DAMAGE', attackerId: targeting.attackerId, targetId, amount: targeting.power });
    setTargeting(null);
  }

  return (
    <div className="fight-screen">

      <div className="fight-topbar">
        <span className="turn-label">TURN {fightState.turn}</span>
        {targeting && <span className="targeting-label">SELECT TARGET</span>}
      </div>

      <div className="fight-arena">
        <div className="fight-arena-left">
          <PlayerPanel
            party={fightState.playerParty}
            rolls={turnState.rolls}
            usageMap={turnState.usageMap}
            targeting={targeting}
            onCardClick={handlePlayerCardClick}
          />
        </div>

        <div className="fight-arena-center">
          <DiceArea fightState={fightState} dispatch={dispatch} />
        </div>

        <div className="fight-arena-right">
          <EnemyPanel
            party={fightState.enemyParty}
            isTargeting={!!targeting}
            targetingPower={targeting?.power ?? 0}
            onEnemyClick={handleEnemyClick}
          />
        </div>
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
          disabled={!canResolve}
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