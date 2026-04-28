import type { RunState, FightState, DiceRollResult } from './gameState';
import { createSnapshot, restoreSnapshot, initialTurnState } from './gameState';
import type { Pokemon } from '../metadata/Pokemon';

// ── All possible game actions ──
export type GameAction =
  | { type: 'START_FIGHT'; playerParty: Pokemon[]; enemyParty: Pokemon[] }
  | { type: 'ROLL_DICE' }
  | { type: 'LOCK_DICE'; pokemonId: string }
  | { type: 'UNLOCK_DICE'; pokemonId: string }
  | { type: 'REROLL' }
  | { type: 'RESOLVE_TURN' }
  | { type: 'UNDO' }
  | { type: 'END_FIGHT' };

// ── Helper: roll a random face slot (1-6) ──
function rollFace(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// ── Helper: generate fresh rolls for a party ──
function generateRolls(party: Pokemon[]): DiceRollResult[] {
  return party.map((p) => ({
    pokemonId: p.id,
    rolledFaceSlot: rollFace(),
    locked: false,
  }));
}

// ── The reducer ──
export function gameReducer(state: RunState, action: GameAction): RunState {
  switch (action.type) {

    // enter a fight
    case 'START_FIGHT': {
      const rolls = generateRolls(action.playerParty);
      const fightState: FightState = {
        playerParty: action.playerParty,
        enemyParty: action.enemyParty,
        turn: 1,
        log: ['A wild battle has started!'],
        turnState: {
          ...initialTurnState,
          rolls,
        },
      };
      return { ...state, phase: 'fight', fightState };
    }

    // roll all unlocked dice (or all if first roll)
    case 'ROLL_DICE': {
      if (!state.fightState) return state;
      const { turnState, playerParty } = state.fightState;

      const newRolls: DiceRollResult[] = turnState.rolls.length === 0
        ? generateRolls(playerParty)
        : turnState.rolls.map((r) =>
            r.locked ? r : { ...r, rolledFaceSlot: rollFace() }
          );

      return {
        ...state,
        fightState: {
          ...state.fightState,
          turnState: { ...turnState, rolls: newRolls },
        },
      };
    }

    // lock a dice face (push snapshot to history first for undo)
    case 'LOCK_DICE': {
      if (!state.fightState) return state;
      const { turnState } = state.fightState;

      const snapshot = createSnapshot(state.fightState);

      const newRolls = turnState.rolls.map((r) =>
        r.pokemonId === action.pokemonId ? { ...r, locked: true } : r
      );

      return {
        ...state,
        fightState: {
          ...state.fightState,
          turnState: {
            ...turnState,
            rolls: newRolls,
            history: [...turnState.history, snapshot],
          },
        },
      };
    }

    // unlock a dice face
    case 'UNLOCK_DICE': {
      if (!state.fightState) return state;
      const { turnState } = state.fightState;

      const newRolls = turnState.rolls.map((r) =>
        r.pokemonId === action.pokemonId ? { ...r, locked: false } : r
      );

      return {
        ...state,
        fightState: {
          ...state.fightState,
          turnState: { ...turnState, rolls: newRolls },
        },
      };
    }

    // reroll all unlocked dice (rerolls NOT undoable)
    case 'REROLL': {
      if (!state.fightState) return state;
      const { turnState } = state.fightState;
      if (turnState.rerollsRemaining <= 0) return state;

      const newRolls = turnState.rolls.map((r) =>
        r.locked ? r : { ...r, rolledFaceSlot: rollFace() }
      );

      return {
        ...state,
        fightState: {
          ...state.fightState,
          turnState: {
            ...turnState,
            rolls: newRolls,
            rerollsRemaining: turnState.rerollsRemaining - 1,
          },
        },
      };
    }

    // undo last action (restores snapshot, rerolls stay the same)
    case 'UNDO': {
      if (!state.fightState) return state;
      const { turnState } = state.fightState;
      if (turnState.history.length === 0) return state;

      const history = [...turnState.history];
      const snapshot = history.pop()!;
      const restored = restoreSnapshot(state.fightState, snapshot);

      return {
        ...state,
        fightState: {
          ...restored,
          turnState: { ...restored.turnState, history },
        },
      };
    }

    // resolve the turn (placeholder — battle engine goes here later)
    case 'RESOLVE_TURN': {
      if (!state.fightState) return state;
      return {
        ...state,
        fightState: {
          ...state.fightState,
          log: [...state.fightState.log, 'Turn resolved! (battle engine coming soon)'],
          turnState: {
            ...initialTurnState,
            rolls: generateRolls(state.fightState.playerParty),
          },
        },
      };
    }

    // end the fight, go back to map
    case 'END_FIGHT': {
      return { ...state, phase: 'map', fightState: null };
    }

    default:
      return state;
  }
}
