import type { Move } from './Move';

export interface DiceFace {
  slot: number;           // 1 through 6
  move: Move;
  powerOverride?: number; // if set, use this power instead of move.basePower
}

export interface Dice {
  faces: [DiceFace, DiceFace, DiceFace, DiceFace, DiceFace, DiceFace]; // exactly 6 faces
}