import type { Move } from '../metadata/Move';

// ── Empty face ──
export const empty: Move = {
  id: 'empty',
  name: '-',
  category: 'empty',
  type: 'normal',
  basePower: 0,
  usage: 1,
  description: 'Nothing happens.',
};


export const tackle: Move = {
  id: 'tackle',
  name: 'Tackle',
  category: 'attack',
  type: 'normal',
  basePower: 2,
  usage: 1,
  description: 'A full-body charge at the enemy.',
};
export const ember: Move = {
  id: 'ember',
  name: 'Ember',
  category: 'attack',
  type: 'fire',
  basePower: 2,
  usage: 1,
  description: 'Deals damage and burns the enemy.',
  effect: { type: 'burn', value: 2 },
};
export const heal: Move = {
  id: 'heal',
  name: 'Heal',
  category: 'heal',
  type: 'normal',
  basePower: 3,
  usage: 1,
  description: 'Restores HP to a friendly pokemon.',
};
 