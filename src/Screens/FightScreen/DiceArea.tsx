import type { FightState, DiceRollResult } from '../../state/gameState';
import type { GameAction } from '../../state/gameReducer';
import { TYPE_COLORS } from '../../metadata/TypeColors';
import MoveTooltip from './MoveTooltip';
import './DiceArea.css';

interface Props {
  fightState: FightState;
  dispatch: (action: GameAction) => void;
}

export default function DiceArea({ fightState, dispatch }: Props) {
  const { playerParty, turnState } = fightState;

  function handleDiceClick(roll: DiceRollResult) {
    if (roll.locked) {
      dispatch({ type: 'UNLOCK_DICE', pokemonId: roll.pokemonId });
    } else {
      dispatch({ type: 'LOCK_DICE', pokemonId: roll.pokemonId });
    }
  }

  return (
    <div className="dice-area-inner">
      <div className="dice-label">DICE</div>
      <div className="dice-list">
        {playerParty.map((pokemon) => {
          const roll = turnState.rolls.find((r) => r.pokemonId === pokemon.id);
          if (!roll) return null;

          const face = pokemon.dice.faces[roll.rolledFaceSlot - 1];
          const power = face.powerOverride ?? face.move.basePower;
          const isEmpty = face.move.category === 'empty';
          const color = isEmpty ? '#555566' : (TYPE_COLORS[face.move.type] ?? '#444455');

          // check if move is used up
          const usageKey = `${pokemon.id}_${roll.rolledFaceSlot}`;
          const usageLeft = usageKey in turnState.usageMap
            ? turnState.usageMap[usageKey]
            : face.move.usage;
          const isUsedUp = usageLeft <= 0;

          return (
            <div
              key={pokemon.id}
              className={`dice-face ${roll.locked ? 'locked' : ''} ${isUsedUp ? 'used' : ''}`}
              style={{ '--dice-color': color } as React.CSSProperties}
              onClick={() => !isUsedUp && handleDiceClick(roll)}
            >
              <div className="dice-pokemon-name">{pokemon.name}</div>

              <div className="dice-face-inner">
                {isUsedUp && <div className="used-overlay" />}

                {isUsedUp ? (
                  <span className="dice-move-name used-text">USED</span>
                ) : isEmpty ? (
                  <span className="dice-move-name empty-text">— Miss —</span>
                ) : (
                  <>
                    <span className="dice-move-name">{face.move.name}</span>
                    <span className="dice-move-power">{power}</span>
                    <span className="dice-move-type-badge" style={{ background: color }}>
                      {face.move.type}
                    </span>
                  </>
                )}

                {!isEmpty && !isUsedUp && (
                  <div className="dice-tooltip-wrapper">
                    <MoveTooltip face={face} power={power} />
                  </div>
                )}
              </div>

              {roll.locked && <div className="locked-badge">{isEmpty ? '!' : '✓'}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}