import type { Pokemon } from '../metadata/Pokemon';
import type { DiceFace } from '../metadata/Dice';
import { applyTypeMatchup } from '../metadata/TypeChart';

export interface EnemyAction {
  attackerId: string;   // which enemy pokemon is acting
  targetId: string;     // which player pokemon is being targeted
  face: DiceFace;       // the rolled face
  power: number;        // resolved power after type matchup
  isMiss: boolean;      // true if empty face
}

// ── Scoring ──
const BASE_SCORE = 30;
const IMMUNE_PENALTY = -25;

function getTypeScore(face: DiceFace, defender: Pokemon): number {
  if (face.move.category !== 'attack') return BASE_SCORE;
  if (face.move.type === 'normal') return BASE_SCORE; // normal type has no matchup bonus

  const modifier = (() => {
    // reuse applyTypeMatchup logic but just get the modifier
    const base = 10;
    const afterMatchup = applyTypeMatchup(base, face.move.type, defender.type, defender.type2);
    if (afterMatchup === 0) return null; // immune
    return afterMatchup - base; // -2, -1, 0, +1, +2
  })();

  if (modifier === null) return BASE_SCORE + IMMUNE_PENALTY; // immune → 5
  return BASE_SCORE + modifier * 10; // -20, -10, 0, +10, +20
}

// pick a target using weighted random based on type scores
function pickTarget(face: DiceFace, playerParty: Pokemon[]): Pokemon {
  const alive = playerParty.filter((p) => p.health > 0);
  if (alive.length === 0) return playerParty[0]; // fallback

  const scores = alive.map((p) => ({
    pokemon: p,
    score: Math.max(1, getTypeScore(face, p)), // min 1 to always have a chance
  }));

  const total = scores.reduce((sum, s) => sum + s.score, 0);
  let rand = Math.random() * total;

  for (const { pokemon, score } of scores) {
    rand -= score;
    if (rand <= 0) return pokemon;
  }

  return alive[alive.length - 1]; // fallback
}

// roll a random face for a pokemon
function rollFace(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// generate all enemy actions for this turn
export function generateEnemyActions(enemyParty: Pokemon[], playerParty: Pokemon[]): EnemyAction[] {
  return enemyParty
    .filter((p) => p.health > 0)
    .map((enemy) => {
      const slot = rollFace();
      const face = enemy.dice.faces[slot - 1];
      const power = face.powerOverride ?? face.move.basePower;
      const isMiss = face.move.category === 'empty';

      if (isMiss || face.move.category !== 'attack') {
        // miss or non-attack — target self (heal/shield) or first player pokemon
        return {
          attackerId: enemy.id,
          targetId: playerParty[0]?.id ?? enemy.id,
          face,
          power,
          isMiss: isMiss || face.move.category !== 'attack',
        };
      }

      // attack — pick target based on type scoring
      const target = pickTarget(face, playerParty);
      const finalPower = applyTypeMatchup(power, face.move.type, target.type, target.type2);

      return {
        attackerId: enemy.id,
        targetId: target.id,
        face,
        power: finalPower,
        isMiss: false,
      };
    });
}
