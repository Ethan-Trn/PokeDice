import type { Pokemon } from '../metadata/Pokemon';
import type { Item } from '../metadata/Item';
import type { GameMap } from '../metadata/MapNode';

// ── Dice roll result ──
export interface DiceRollResult {
  pokemonId: string;
  rolledFaceSlot: number; // which face (1-6) was rolled
  locked: boolean;        // true if player confirmed this roll
  exertUsesLeft?: number; // tracks remaining uses if move has exert
}

// ── A single action taken during a turn (used for undo) ──
export type ActionType =
  | 'lock-dice'    // player locked a dice face
  | 'use-move'     // a move was executed against a target
  | 'apply-effect' // a side effect was applied (heal, boost, status)
  | 'exert'        // a face was exerted (used up)

export interface TurnAction {
  type: ActionType;
  payload: unknown; // flexible, battle engine fills this in
}

// ── Snapshot of fight state at a point in time (for undo) ──
export interface FightSnapshot {
  playerParty: Pokemon[];      // deep copy of player party (includes HP)
  enemyParty: Pokemon[];       // deep copy of enemy party (includes HP)
  rolls: DiceRollResult[];     // which dice were locked/unlocked
  exertMap: Record<string, number>; // pokemonId_slot -> uses remaining
  usageMap: Record<string, number>; // pokemonId_slot -> uses left this round
  log: string[];               // battle log at this moment
  // NOTE: rerollsRemaining is intentionally excluded from snapshots
}

// ── Turn state ──
export interface TurnState {
  rolls: DiceRollResult[];
  rerollsRemaining: number;    // NOT undoable
  phase: 'rolling' | 'resolving' | 'done';
  exertMap: Record<string, number>; // pokemonId_slot -> exert uses remaining
  usageMap: Record<string, number>; // pokemonId_slot -> usage count left this round
  history: FightSnapshot[];    // undo stack — push on action, pop on undo
}

// ── Fight state ──
export interface FightState {
  playerParty: Pokemon[];
  enemyParty: Pokemon[];
  turn: number;
  turnState: TurnState;
  log: string[];
}

// ── Run phase ──
export type RunPhase =
  | 'title'
  | 'draft'
  | 'map'
  | 'fight'
  | 'shop'
  | 'event'
  | 'rest'
  | 'game-over'
  | 'victory';

// ── Full run state ──
export interface RunState {
  phase: RunPhase;
  party: Pokemon[];
  inventory: Item[];
  map: GameMap | null;
  gold: number;
  fightState: FightState | null;
  runCount: number;
}

// ── Helpers ──

// resolves the actual power of a dice face (override > basePower)
export function resolvePower(face: {
  move: { basePower: number };
  powerOverride?: number;
}): number {
  return Math.max(0, face.powerOverride ?? face.move.basePower);
}

// creates a deep snapshot of the current fight state for undo
export function createSnapshot(fightState: FightState): FightSnapshot {
  const { turnState } = fightState;
  return {
    playerParty: structuredClone(fightState.playerParty),
    enemyParty: structuredClone(fightState.enemyParty),
    rolls: structuredClone(turnState.rolls),
    exertMap: { ...turnState.exertMap },
    usageMap: { ...turnState.usageMap },
    log: [...fightState.log],
  };
}

// restores fight state from a snapshot (preserves rerollsRemaining)
export function restoreSnapshot(
  fightState: FightState,
  snapshot: FightSnapshot
): FightState {
  return {
    ...fightState,
    playerParty: snapshot.playerParty,
    enemyParty: snapshot.enemyParty,
    log: snapshot.log,
    turnState: {
      ...fightState.turnState,
      rolls: snapshot.rolls,
      exertMap: snapshot.exertMap,
      usageMap: snapshot.usageMap,
      // rerollsRemaining intentionally NOT restored
    },
  };
}

// ── Initial states ──
export const initialTurnState: TurnState = {
  rolls: [],
  rerollsRemaining: 2,
  phase: 'rolling',
  exertMap: {},
  usageMap: {},
  history: [],
};

export const initialRunState: RunState = {
  phase: 'title',
  party: [],
  inventory: [],
  map: null,
  gold: 0,
  fightState: null,
  runCount: 0,
};