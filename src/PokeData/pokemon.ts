import type { Pokemon } from '../metadata/Pokemon';
import {tackle, empty, ember } from './moves';

export const treeko: Pokemon = {
  id: 'treeko',
  name: 'Treeko',
  type: 'grass',
  health: 5,
  maxHealth: 5,
  speed: 70,
  ability: 'Overgrow',
  statusCondition: 'none',
  level: 1,
  battlesCount: 0,
  evolvesInto: 'grovyle',
  evolvesAt: 3,
  image: "treeko.png",
  dice: {
    faces: [
      { slot: 1, move: tackle, powerOverride: 1 },
      { slot: 2, move: tackle,  powerOverride: 1 },
      { slot: 3, move: tackle, powerOverride: 1 },
      { slot: 4, move: tackle, powerOverride: 2 },
      { slot: 5, move: empty,   powerOverride: 1 },
      { slot: 6, move: ember, powerOverride: 2 },
    ],
  },
};

export const geodude: Pokemon = {
  id: 'geodude',
  name: 'Geodude',
  type: 'rock',
  health: 5,
  maxHealth: 5,
  speed: 20,
  ability: 'Rock Head',
  statusCondition: 'none',
  level: 1,
  battlesCount: 0,
  evolvesInto: 'graveler',
  evolvesAt: 3,
  image: "geodude.png",
  dice: {
    faces: [
      { slot: 1, move: empty, powerOverride: 2 },
      { slot: 2, move: empty,    powerOverride: 2 },
      { slot: 3, move: tackle,    powerOverride: 2 },
      { slot: 4, move: empty, powerOverride: 3 },
      { slot: 5, move: empty,    powerOverride: 1 },
      { slot: 6, move: empty,      powerOverride: 1 },
    ],
  },
};
export const zigzagoon: Pokemon = {
  id: 'zigzagoon',
  name: 'Zigzagoon',
  type: 'normal',
  health: 38,
  maxHealth: 38,
  speed: 60,
  ability: 'Pick Up',
  image: 'zigzagoon.png',
  statusCondition: 'none',
  level: 1,
  battlesCount: 0,
  evolvesInto: 'linoone',
  evolvesAt: 3,
  dice: {
    faces: [
      { slot: 1, move: tackle,      powerOverride: 1 },
      { slot: 2, move: tackle,     powerOverride: 1 },
      { slot: 3, move: empty, powerOverride: 1 },
      { slot: 4, move: empty,        powerOverride: 1 },
      { slot: 5, move: tackle,       powerOverride: 1 },
      { slot: 6, move: empty },
    ],
  },
}
// pool of starters the player can draft from at the start of a run
export const allPokemon: Pokemon[] = [treeko, geodude, zigzagoon];
export const starterPool: Pokemon[] = [treeko, geodude, zigzagoon];