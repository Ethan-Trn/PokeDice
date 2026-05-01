import { useState } from 'react';
import type { Pokemon } from '../../metadata/Pokemon';
import type { EnemyAction } from '../../state/enemyAI';
import { TYPE_COLORS } from '../../metadata/TypeColors';
import './EnemyPanel.css';

interface Props {
  party: Pokemon[];
  isTargeting: boolean;
  targetingPower: number;
  enemyActions: EnemyAction[];
  onEnemyClick: (pokemonId: string) => void;
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

export default function EnemyPanel({
  party, isTargeting, targetingPower, enemyActions, onEnemyClick, cardRefs
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="enemy-panel">
      {party.map((pokemon) => {
        const isHovered = hoveredId === pokemon.id;
        const previewDamage = isTargeting && isHovered ? targetingPower : 0;

        const action = enemyActions.find((a) => a.attackerId === pokemon.id);
        const moveName = action?.face.move.name ?? '';
        const moveType = action?.face.move.type ?? 'normal';
        const isMiss = action?.isMiss ?? true;
        const diceColor = isMiss ? '#555566' : (TYPE_COLORS[moveType] ?? '#aabbdd');
        const diceLetter = isMiss ? '—' : moveName[0]?.toUpperCase() ?? 'D';

        return (
          <div
            key={pokemon.id}
            ref={(el) => {
              if (el) cardRefs.current.set(pokemon.id, el);
              else cardRefs.current.delete(pokemon.id);
            }}
            className={`enemy-card ${isTargeting && pokemon.health > 0 ? 'targetable' : ''} ${isHovered && isTargeting && pokemon.health > 0 ? 'hovered' : ''} ${pokemon.health <= 0 ? 'used-up' : ''}`}
            onClick={() => isTargeting && pokemon.health > 0 && onEnemyClick(pokemon.id)}
            onMouseEnter={() => setHoveredId(pokemon.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {pokemon.health <= 0 && <div className="used-overlay" />}

            <div className="enemy-info">
              <img
                className="enemy-img"
                src={`/src/assets/PokeImages/${pokemon.image}`}
                alt={pokemon.name}
              />
              <div className="enemy-details">
                <div className="enemy-name">{pokemon.name}</div>
                <div className="enemy-hearts">
                  {Array.from({ length: pokemon.maxHealth }).map((_, i) => {
                    const heartIndex = i + 1;
                    const isDead = heartIndex > pokemon.health;
                    const isPreview = previewDamage > 0
                      && heartIndex > pokemon.health - previewDamage
                      && heartIndex <= pokemon.health;

                    return (
                      <img
                        key={i}
                        className="heart"
                        src={
                          isDead
                            ? '/src/assets/Battle/empty_heart.png'
                            : isPreview
                            ? '/src/assets/Battle/injured_heart.png'
                            : '/src/assets/Battle/heart.jpg'
                        }
                        alt="hp"
                      />
                    );
                  })}
                </div>
                <div className="enemy-speed">
                  {Array.from({ length: pokemon.speed }).map((_, i) => (
                    <img key={i} className="speed-boot" src="/src/assets/Battle/speed_boots.png" alt="spd" />
                  ))}
                </div>
              </div>
            </div>

            <div className="dice-btn-wrap">
              <button
                className="enemy-dice-btn"
                style={{ background: diceColor, borderColor: diceColor, color: '#111' }}
              >
                {diceLetter}
              </button>
              {!isMiss && action && (
                <span className="dice-power-badge">{action.power}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}