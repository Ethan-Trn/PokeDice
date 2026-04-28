import type { PokemonType } from './Pokemon';

type Effectiveness = 'super' | 'resist' | 'immune' | 'normal';

// Full Gen 7 type chart
// attackingType -> defendingType -> effectiveness
// Only non-normal matchups are listed (everything else is 'normal')
const TYPE_CHART: Partial<Record<PokemonType, Partial<Record<PokemonType, Effectiveness>>>> = {
  normal: {
    rock: 'resist',
    steel: 'resist',
    ghost: 'immune',
  },
  fire: {
    fire: 'resist',
    water: 'resist',
    rock: 'resist',
    dragon: 'resist',
    grass: 'super',
    ice: 'super',
    bug: 'super',
    steel: 'super',
  },
  water: {
    water: 'resist',
    grass: 'resist',
    dragon: 'resist',
    fire: 'super',
    ground: 'super',
    rock: 'super',
  },
  grass: {
    fire: 'resist',
    grass: 'resist',
    poison: 'resist',
    flying: 'resist',
    bug: 'resist',
    dragon: 'resist',
    steel: 'resist',
    water: 'super',
    ground: 'super',
    rock: 'super',
  },
  electric: {
    grass: 'resist',
    electric: 'resist',
    dragon: 'resist',
    ground: 'immune',
    water: 'super',
    flying: 'super',
  },
  ice: {
    fire: 'resist',
    water: 'resist',
    ice: 'resist',
    steel: 'resist',
    grass: 'super',
    ground: 'super',
    flying: 'super',
    dragon: 'super',
  },
  fighting: {
    poison: 'resist',
    flying: 'resist',
    psychic: 'resist',
    bug: 'resist',
    fairy: 'resist',
    ghost: 'immune',
    normal: 'super',
    ice: 'super',
    rock: 'super',
    dark: 'super',
    steel: 'super',
  },
  poison: {
    poison: 'resist',
    ground: 'resist',
    rock: 'resist',
    ghost: 'resist',
    steel: 'immune',
    grass: 'super',
    fairy: 'super',
  },
  ground: {
    grass: 'resist',
    bug: 'resist',
    flying: 'immune',
    fire: 'super',
    electric: 'super',
    poison: 'super',
    rock: 'super',
    steel: 'super',
  },
  flying: {
    electric: 'resist',
    rock: 'resist',
    steel: 'resist',
    grass: 'super',
    fighting: 'super',
    bug: 'super',
  },
  psychic: {
    psychic: 'resist',
    steel: 'resist',
    dark: 'immune',
    fighting: 'super',
    poison: 'super',
  },
  bug: {
    fire: 'resist',
    fighting: 'resist',
    flying: 'resist',
    ghost: 'resist',
    steel: 'resist',
    fairy: 'resist',
    grass: 'super',
    psychic: 'super',
    dark: 'super',
  },
  rock: {
    fighting: 'resist',
    ground: 'resist',
    steel: 'resist',
    fire: 'super',
    ice: 'super',
    flying: 'super',
    bug: 'super',
    grass: 'super',
  },
  ghost: {
    normal: 'immune',
    dark: 'resist',
    ghost: 'super',
    psychic: 'super',
  },
  dragon: {
    steel: 'resist',
    fairy: 'immune',
    dragon: 'super',
  },
  dark: {
    fighting: 'resist',
    dark: 'resist',
    fairy: 'resist',
    psychic: 'super',
    ghost: 'super',
  },
  steel: {
    fire: 'resist',
    water: 'resist',
    electric: 'resist',
    steel: 'resist',
    ice: 'super',
    rock: 'super',
    fairy: 'super',
  },
  fairy: {
    fire: 'resist',
    poison: 'resist',
    steel: 'resist',
    fighting: 'super',
    dragon: 'super',
    dark: 'super',
  },
};

function getSingleEffectiveness(
  attackType: PokemonType,
  defendType: PokemonType
): Effectiveness {
  return TYPE_CHART[attackType]?.[defendType] ?? 'normal';
}

function effectivenessToModifier(e: Effectiveness): number {
  switch (e) {
    case 'super':  return 1;   // +1 to basePower
    case 'resist': return -1;  // -1 to basePower
    case 'normal': return 0;   // no change
    case 'immune': return Infinity; // handled separately
  }
}

/**
 * Returns the power modifier to add to basePower based on type matchup.
 *
 * Examples:
 *   ice -> grass          = +1 (super effective)
 *   ice -> grass/flying   = +2 (super super effective, hits both weak)
 *   normal -> ghost       = null (immune, caller sets damage to 0)
 *   grass -> fire/dragon  = -2 (both resist)
 *   grass -> fire/water   = -2 (both resist)
 *   electric -> ground    = null (immune)
 *   fire -> grass/water   = 0 (one super, one resist — cancel out)
 */
export function getTypeModifier(
  attackType: PokemonType,
  defenderType1: PokemonType,
  defenderType2?: PokemonType
): number | null {
  const e1 = getSingleEffectiveness(attackType, defenderType1);
  if (e1 === 'immune') return null;

  let modifier = effectivenessToModifier(e1);

  if (defenderType2) {
    const e2 = getSingleEffectiveness(attackType, defenderType2);
    if (e2 === 'immune') return null;
    modifier += effectivenessToModifier(e2);
  }

  // clamp modifier between -2 and +2
  return Math.max(-2, Math.min(2, modifier));
}

/**
 * Applies type matchup to a basePower value.
 * Returns 0 for immunity, clamps final value to minimum 0.
 *
 * Usage:
 *   applyTypeMatchup(3, 'ice', 'grass')          // 3 + 1 = 4
 *   applyTypeMatchup(3, 'ice', 'grass', 'flying') // 3 + 2 = 5
 *   applyTypeMatchup(3, 'normal', 'ghost')        // 0 (immune)
 *   applyTypeMatchup(1, 'grass', 'fire')          // max(0, 1 - 1) = 0
 */
export function applyTypeMatchup(
  basePower: number,
  attackType: PokemonType,
  defenderType1: PokemonType,
  defenderType2?: PokemonType
): number {
  const modifier = getTypeModifier(attackType, defenderType1, defenderType2);
  if (modifier === null) return 0; // immune
  return Math.max(0, basePower + modifier);
}
