import type { Pokemon } from '../../metadata/Pokemon';
import type { DiceRollResult } from '../../state/gameState';
import type { TargetingState } from './FightScreen';
import { TYPE_COLORS } from '../../metadata/TypeColors';
import './PlayerPanel.css';

interface Props {
  party: Pokemon[];
  rolls: DiceRollResult[];
  usageMap: Record<string, number>;
  targeting: TargetingState | null;
  onCardClick: (pokemonId: string) => void;
}

export default function PlayerPanel({ party, rolls, usageMap, targeting, onCardClick }: Props) {
  return (
    <div className="player-panel">
      {party.map((pokemon) => {
        const roll = rolls.find((r) => r.pokemonId === pokemon.id);
        const face = roll ? pokemon.dice.faces[roll.rolledFaceSlot - 1] : null;
        const isLocked = roll?.locked ?? false;
        const isAttackLocked = isLocked && face?.move.category === 'attack';
        const isTargeting = targeting?.attackerId === pokemon.id;

        // check if move is used up
        const usageKey = `${pokemon.id}_${roll?.rolledFaceSlot}`;
        const usageLeft = usageKey in usageMap ? usageMap[usageKey] : (face?.move.usage ?? 1);
        const isUsedUp = usageLeft <= 0;

        const color = isLocked && face ? TYPE_COLORS[face.move.type] : '#aabbdd';
        const letter = isLocked && face ? face.move.name[0].toUpperCase() : 'D';

        return (
          <div
            key={pokemon.id}
            className={`player-card ${isTargeting ? 'targeting' : ''} ${isAttackLocked ? 'attack-ready' : ''} ${isUsedUp ? 'used-up' : ''}`}
            onClick={() => isAttackLocked ? onCardClick(pokemon.id) : undefined}
          >
            {/* used up overlay */}
            {isUsedUp && <div className="used-overlay" />}

            <div className="player-info">
              <img
                className="player-img"
                src={`/src/assets/PokeImages/${pokemon.image}`}
                alt={pokemon.name}
              />
              <div className="player-details">
                <div className="player-name">{pokemon.name}</div>
                <div className="player-hearts">
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
              style={{ background: color, borderColor: color, color: isLocked ? '#111' : '#222' }}
            >
              {letter}
            </button>
          </div>
        );
      })}
    </div>
  );
}