import { useState } from 'react';
import type { Pokemon } from '../../metadata/Pokemon';
import './EnemyPanel.css';

interface Props {
  party: Pokemon[];
  isTargeting: boolean;
  targetingPower: number;
  onEnemyClick: (pokemonId: string) => void;
}

export default function EnemyPanel({ party, isTargeting, targetingPower, onEnemyClick }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="enemy-panel">
      {party.map((pokemon) => {
        const isHovered = hoveredId === pokemon.id;
        const previewDamage = isTargeting && isHovered ? targetingPower : 0;

        return (
          <div
            key={pokemon.id}
            className={`enemy-card ${isTargeting ? 'targetable' : ''} ${isHovered && isTargeting ? 'hovered' : ''}`}
            onClick={() => isTargeting && onEnemyClick(pokemon.id)}
            onMouseEnter={() => setHoveredId(pokemon.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
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
                    const heartIndex = i + 1; // 1-based
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
              </div>
            </div>
            <button className="enemy-dice-btn">D</button>
          </div>
        );
      })}
    </div>
  );
}