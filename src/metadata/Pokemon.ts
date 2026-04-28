import type { Dice } from './Dice';

export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export type StatusCondition = 'none' | 'burned' | 'poisoned' | 'paralyzed' | 'frozen' | 'asleep';

export interface Pokemon {
  id: string;
  name: string;
  type: PokemonType;   // primary type
  type2?: PokemonType; // optional secondary type

  // health
  health: number;
  maxHealth: number;

  // combat
  speed: number;
  ability: string;
  dice: Dice;

  // status
  statusCondition: StatusCondition;

  // progression
  level: number;
  battlesCount: number;
  evolvesInto: string | null;
  evolvesAt: number | null;
  image?: string;
}