import type { DiceFace } from '../../metadata/Dice';
import type { MoveEffectType } from '../../metadata/MoveEffect';
import { TYPE_COLORS } from '../../metadata/TypeColors';
import './MoveTooltip.css';

interface Props {
  face: DiceFace;
  power: number;
}

export const EFFECT_COLORS: Record<MoveEffectType, string> = {
  'heal-self':    '#66ff99',
  'boost-attack': '#8B0000',
  'boost-shield': '#555566',
  'boost-heal':   '#44cc77',
  'poison':       '#A040A0',
  'burn':         '#F08030',
  'paralyze':     '#F8D030',
  'freeze':       '#98D8D8',
  'reroll':       '#ffffff',
  'draw':         '#aaaaaa',
};

export const EFFECT_DESCRIPTIONS: Record<MoveEffectType, (value: number) => string> = {
  'heal-self':    (v) => `Restores ${v} HP to self.`,
  'boost-attack': (v) => `All attack pips gain +${v} for this fight.`,
  'boost-shield': (v) => `All shield pips gain +${v} for this fight.`,
  'boost-heal':   (v) => `All heal pips gain +${v} for this fight.`,
  'poison':       (v) => `Enemy is poisoned for ${v} turns. Takes damage each turn, decreasing by 1 each round.`,
  'burn':         (v) => `Enemy takes ${v} burn damage over time. All enemy damaging pips decrease by 50% while burned.`,
  'paralyze':     (v) => `Enemy is paralyzed for ${v} turns. May be unable to act each turn.`,
  'freeze':       (v) => `Enemy is frozen for ${v} turns. Cannot act while frozen.`,
  'reroll':       (v) => `Grants +${v} extra reroll(s) this turn.`,
  'draw':         (v) => `Refreshes ${v} locked face(s) with a new roll.`,
};

export default function MoveTooltip({ face, power }: Props) {
  const typeColor = TYPE_COLORS[face.move.type] ?? '#aaa';
  const effect = face.move.effect;

  return (
    <div className="move-tooltip">

      {/* Bubble 1 — summary */}
      <div className="tooltip-bubble bubble-one" style={{ borderColor: typeColor }}>
        {face.move.category === 'attack' && (
          <div className="tooltip-line">
            <span className="tooltip-text white">Does </span>
            <span className="tooltip-power-pill" style={{ background: typeColor }}>{power}</span>
            <span className="tooltip-text white"> damage</span>
          </div>
        )}
        {face.move.category === 'heal' && (
          <div className="tooltip-line">
            <span className="tooltip-text" style={{ color: EFFECT_COLORS['heal-self'] }}>Heals {power} HP</span>
          </div>
        )}
        {face.move.category === 'shield' && (
          <div className="tooltip-line">
            <span className="tooltip-text" style={{ color: EFFECT_COLORS['boost-shield'] }}>Shields {power}</span>
          </div>
        )}
        {effect && (
          <div className="tooltip-line">
            <span className="tooltip-effect-pill" style={{ background: EFFECT_COLORS[effect.type] }}>
              {effect.value} {effect.type.replace(/-/g, ' ')}
            </span>
          </div>
        )}
        {face.move.usage > 1 && (
          <div className="tooltip-line">
            <span className="tooltip-text gray">Hits {face.move.usage}×</span>
          </div>
        )}
        {face.move.exert && (
          <div className="tooltip-line">
            <span className="tooltip-text gray">Exert: {face.move.exert} use(s)</span>
          </div>
        )}
      </div>

      {/* Bubble 2 — effect description (only if there's an effect) */}
      {effect && (
        <div className="tooltip-bubble bubble-two" style={{ borderColor: EFFECT_COLORS[effect.type] }}>
          <span className="tooltip-effect-label" style={{ color: EFFECT_COLORS[effect.type] }}>
            {effect.type.replace(/-/g, ' ').toUpperCase()}
          </span>
          <span className="tooltip-effect-desc">
            {EFFECT_DESCRIPTIONS[effect.type](effect.value)}
          </span>
        </div>
      )}

    </div>
  );
}
