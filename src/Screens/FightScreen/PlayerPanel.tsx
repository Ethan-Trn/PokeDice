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
  incomingDamageMap: Record<string, number>;
  onCardClick: (pokemonId: string) => void;
  onCardHover: (pokemonId: string | null) => void;
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

export default function PlayerPanel({
  party, rolls, usageMap, targeting,
  incomingDamageMap, onCardClick, onCardHover, cardRefs
}: Props) {
  return (
    <div className="player-panel">
      {party.map((pokemon) => {
        const roll = rolls.find((r) => r.pokemonId === pokemon.id);
        const face = roll ? pokemon.dice.faces[roll.rolledFaceSlot - 1] : null;
        const isLocked = roll?.locked ?? false;
        const isAttackLocked = isLocked && face?.move.category === 'attack';
        const isHealLocked = isLocked && face?.move.category === 'heal';
        const isActiveAttacker = targeting?.mode === 'attack' && targeting.attackerId === pokemon.id;
        const isActiveHealer = targeting?.mode === 'heal' && targeting.attackerId === pokemon.id;
        const isHealTarget = targeting?.mode === 'heal' && targeting.attackerId !== pokemon.id;

        const isDead = pokemon.health <= 0;
        const usageKey = `${pokemon.id}_${roll?.rolledFaceSlot}`;
        const usageLeft = usageKey in usageMap ? usageMap[usageKey] : (face?.move.usage ?? 1);
        const isUsedUp = usageLeft <= 0;
        const isActionable = (isAttackLocked || isHealLocked) && !isUsedUp;
        const isInactive = isDead;

        const color = isLocked && face ? TYPE_COLORS[face.move.type] : '#aabbdd';
        const letter = isLocked && face ? face.move.name[0].toUpperCase() : 'D';

        const incoming = incomingDamageMap[pokemon.id] ?? 0;
        const healAmount = isHealTarget ? (targeting?.power ?? 0) : 0;

        // border color logic
        let borderClass = '';
        if (isActiveAttacker) borderClass = 'targeting-attack';
        else if (isActiveHealer) borderClass = 'targeting-heal';
        else if (isHealTarget) borderClass = 'heal-targetable';

        return (
          <div
            key={pokemon.id}
            ref={(el) => {
              if (el) cardRefs.current.set(pokemon.id, el);
              else cardRefs.current.delete(pokemon.id);
            }}
            className={`player-card ${borderClass} ${isActionable ? 'actionable' : ''} ${isDead ? 'used-up' : ''}`}
            onClick={() => (isActionable || targeting?.mode === 'heal') ? onCardClick(pokemon.id) : undefined}
            onMouseEnter={() => onCardHover(pokemon.id)}
            onMouseLeave={() => onCardHover(null)}
          >
            {isInactive && <div className="used-overlay" />}

            <div className="player-info">
              <img
                className="player-img"
                src={`/assets/PokeImages/${pokemon.image}`}
                alt={pokemon.name}
              />
              <div className="player-details">
                <div className="player-name">{pokemon.name}</div>
                <div className="player-hearts">
                  {Array.from({ length: pokemon.maxHealth }).map((_, i) => {
                    const heartIndex = i + 1;
                    const isAlive = heartIndex <= pokemon.health;
                    const isAtFullHealth = pokemon.health >= pokemon.maxHealth;

                    // only show heal preview when in heal targeting mode
                    const inHealMode = targeting?.mode === 'heal';

                    // yellow = incoming damage (on alive hearts, from the top down)
                    const isIncoming = isAlive
                      && incoming > 0
                      && heartIndex > pokemon.health - incoming;

                    // pink = heal preview (on dead hearts, only in heal mode, not if full health)
                    const isHealPreview = !isAlive
                      && inHealMode
                      && !isAtFullHealth
                      && healAmount > 0
                      && heartIndex <= pokemon.health + healAmount
                      && heartIndex <= pokemon.maxHealth;

                    if (!isAlive && isHealPreview) {
                      return <img key={i} className="heart" src="/assets/Battle/healing_heart.png" alt="heal" />;
                    }
                    if (!isAlive) {
                      return <img key={i} className="heart" src="/assets/Battle/empty_heart.png" alt="empty" />;
                    }
                    return (
                      <img
                        key={i}
                        className="heart"
                        src={isIncoming ? '/assets/Battle/injured_heart.png' : '/assets/Battle/heart.jpg'}
                        alt="hp"
                      />
                    );
                  })}
                </div>
                <div className="player-speed">
                  {Array.from({ length: pokemon.speed }).map((_, i) => (
                    <img key={i} className="speed-boot" src="/assets/Battle/speed_boots.png" alt="spd" />
                  ))}
                </div>
              </div>
            </div>

            <div className="dice-btn-wrap">
              <button
                className="dice-btn"
                style={{ background: color, borderColor: color, color: isLocked ? '#111' : '#222' }}
              >
                {letter}
              </button>
              {isLocked && face && face.move.category !== 'empty' && (
                <span className="dice-power-badge">{face.powerOverride ?? face.move.basePower}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}