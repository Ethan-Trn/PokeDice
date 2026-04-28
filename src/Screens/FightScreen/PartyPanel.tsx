import type { Pokemon } from '../../metadata/Pokemon';
import type { DiceRollResult } from '../../state/gameState';
import type { MoveCategory } from '../../metadata/Move';
import './PartyPanel.css';

interface Props {
  party: Pokemon[];
  side: 'left' | 'right';
  rolls?: DiceRollResult[];
  onDiceClick?: (pokemonId: string) => void;
}

const CATEGORY_COLORS: Record<MoveCategory, string> = {
  attack: '#ff6666',
  heal: '#66ff99',
  shield: '#6699ff',
  status: '#ffcc66',
  empty: '#aabbdd',
};

export default function PartyPanel({ party, side, rolls = [], onDiceClick }: Props) {
  return (
    <div className={`party-panel ${side}`}>
      {party.map((pokemon) => {
        const roll = rolls.find((r) => r.pokemonId === pokemon.id);
        const face = roll ? pokemon.dice.faces[roll.rolledFaceSlot - 1] : null;
        const isLocked = roll?.locked ?? false;
        const category = face?.move.category ?? 'empty';
        const color = isLocked ? CATEGORY_COLORS[category] : '#aabbdd';
        const letter = isLocked && face ? face.move.name[0].toUpperCase() : 'D';

        return (
          <div key={pokemon.id} className="pokemon-card">
            <div className="pokemon-info">
              <img
                className="pokemon-img"
                src={`/src/assets/PokeImages/${pokemon.image}`}
                alt={pokemon.name}
              />
              <div className="pokemon-details">
                <div className="pokemon-name">{pokemon.name}</div>
                <div className="pokemon-hearts">
                  {Array.from({ length: pokemon.health }).map((_, i) => (
                    <img
                      key={i}
                      className="heart"
                      src="/src/assets/Battle/heart.jpg"
                      alt="hp"
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              className="dice-btn"
              style={{ background: color, borderColor: color }}
              onClick={() => onDiceClick?.(pokemon.id)}
            >
              {letter}
            </button>
          </div>
        );
      })}
    </div>
  );
}