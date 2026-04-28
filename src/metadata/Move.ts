import type { MoveEffect } from './MoveEffect';
import type { PokemonType } from './Pokemon';

export type MoveCategory = 'attack' | 'heal' | 'shield' | 'status' | 'empty';

export interface Move {
  id: string;
  name: string;
  category: MoveCategory;      // the PRIMARY action
  type: PokemonType | 'normal'; // move's elemental type, used for type chart
  basePower: number;            // base value (usually 1-6), min 0
  description: string;
  effect?: MoveEffect;          // optional side effect
  exert?: number;               // uses before face becomes empty (undefined = infinite)
  usage: number;                // how many times it triggers per round (default 1, double kick = 2)
}