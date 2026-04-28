import type { FightState, DiceRollResult } from '../../state/gameState';
import type { GameAction } from '../../state/gameReducer';
import type { MoveCategory } from '../../metadata/Move';
import './DiceArea.css';

interface Props {
  fightState: FightState;
  dispatch: (action: GameAction) => void;
}

// color per move category
const CATEGORY_COLORS: Record<MoveCategory, string> = {
  attack: '#ff6666',
  heal: '#66ff99',
  shield: '#6699ff',
  status: '#ffcc66',
  empty: '#444455',
};

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
          const color = CATEGORY_COLORS[face.move.category];
          const isEmpty = face.move.category === 'empty';

          return (
            <div
              key={pokemon.id}
              className={`dice-face ${roll.locked ? 'locked' : ''} ${isEmpty ? 'empty' : ''}`}
              style={{ '--dice-color': color } as React.CSSProperties}
              onClick={() => handleDiceClick(roll)}
            >
              {/* pokemon name above dice */}
              <div className="dice-pokemon-name">{pokemon.name}</div>

              {/* dice face content */}
              <div className="dice-face-inner">
                {isEmpty ? (
                  <span className="dice-move-name">—</span>
                ) : (
                  <>
                    <span className="dice-move-name">{face.move.name}</span>
                    <span className="dice-move-power">{power}</span>
                    <span className="dice-move-type">{face.move.type}</span>
                  </>
                )}
              </div>

              {/* locked indicator */}
              {roll.locked && <div className="locked-badge">✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
