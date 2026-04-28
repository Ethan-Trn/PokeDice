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

// ── Attack moves ──
export const scratch: Move = {
  id: 'scratch',
  name: 'Scratch',
  category: 'attack',
  type: 'normal',
  basePower: 1,
  usage: 1,
  description: 'Slashes the enemy with sharp claws.',
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

export const pound: Move = {
  id: 'pound',
  name: 'Pound',
  category: 'attack',
  type: 'normal',
  basePower: 1,
  usage: 1,
  description: 'A basic physical attack.',
};

export const rockThrow: Move = {
  id: 'rock-throw',
  name: 'Rock Throw',
  category: 'attack',
  type: 'rock',
  basePower: 3,
  usage: 1,
  description: 'Hurls a large rock at the enemy.',
};

export const quickAttack: Move = {
  id: 'quick-attack',
  name: 'Quick Attack',
  category: 'attack',
  type: 'normal',
  basePower: 1,
  usage: 1,
  description: 'A lightning-fast strike.',
};

export const doubleKick: Move = {
  id: 'double-kick',
  name: 'Double Kick',
  category: 'attack',
  type: 'fighting',
  basePower: 1,
  usage: 2, // hits twice per round
  description: 'Strikes the enemy twice in one turn.',
};

export const fakeOut: Move = {
  id: 'fake-out',
  name: 'Fake Out',
  category: 'attack',
  type: 'normal',
  basePower: 2,
  usage: 1,
  exert: 1, // can only be used once, then face becomes empty
  description: 'A startling move that can only be used once.',
};

// ── Attack + side effect moves ──
export const absorb: Move = {
  id: 'absorb',
  name: 'Absorb',
  category: 'attack',
  type: 'grass',
  basePower: 1,
  usage: 1,
  description: 'Deals damage and heals you for the same amount.',
  effect: { type: 'heal-self', value: 1 },
};

export const powerUpPunch: Move = {
  id: 'power-up-punch',
  name: 'Power Up Punch',
  category: 'attack',
  type: 'fighting',
  basePower: 1,
  usage: 1,
  description: 'Deals damage and boosts all attack faces by +1 this fight.',
  effect: { type: 'boost-attack', value: 1 },
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

export const poisonSting: Move = {
  id: 'poison-sting',
  name: 'Poison Sting',
  category: 'attack',
  type: 'poison',
  basePower: 1,
  usage: 1,
  description: 'Deals damage and poisons the enemy.',
  effect: { type: 'poison', value: 2 },
};

// ── Heal moves ──
export const rest: Move = {
  id: 'rest',
  name: 'Rest',
  category: 'heal',
  type: 'normal',
  basePower: 2,
  usage: 1,
  description: 'Takes a brief rest to recover health.',
};

// ── Shield moves ──
export const harden: Move = {
  id: 'harden',
  name: 'Harden',
  category: 'shield',
  type: 'normal',
  basePower: 2,
  usage: 1,
  description: 'Raises defense to block incoming damage.',
};

export const withdraw: Move = {
  id: 'withdraw',
  name: 'Withdraw',
  category: 'shield',
  type: 'water',
  basePower: 1,
  usage: 1,
  description: 'Braces for impact and boosts all shield faces by +1.',
  effect: { type: 'boost-shield', value: 1 },
};

// ── Status / utility moves ──
export const leer: Move = {
  id: 'leer',
  name: 'Leer',
  category: 'status',
  type: 'normal',
  basePower: 0,
  usage: 1,
  description: 'Grants an extra reroll this turn.',
  effect: { type: 'reroll', value: 1 },
};