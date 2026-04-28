export type MoveEffectType =
  | 'heal-self'      // heal yourself for value
  | 'boost-attack'   // all attack faces get +value for this fight
  | 'boost-shield'   // all shield faces get +value for this fight
  | 'boost-heal'     // all heal faces get +value for this fight
  | 'poison'         // apply poison to enemy for value turns
  | 'burn'           // apply burn to enemy for value turns
  | 'paralyze'       // apply paralysis to enemy for value turns
  | 'freeze'         // apply freeze to enemy for value turns
  | 'reroll'         // grant +value extra rerolls this turn
  | 'draw';          // reroll value locked faces (refresh them)

export interface MoveEffect {
  type: MoveEffectType;
  value: number; // how much / how many turns the effect applies
}
