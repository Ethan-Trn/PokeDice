import type { RunState, FightState, DiceRollResult } from './gameState';
import { createSnapshot, restoreSnapshot, initialTurnState } from './gameState';
import type { Pokemon } from '../metadata/Pokemon';
import { generateEnemyActions } from './enemyAI';

export type GameAction =
  | { type: 'START_FIGHT'; playerParty: Pokemon[]; enemyParty: Pokemon[] }
  | { type: 'ROLL_DICE' }
  | { type: 'LOCK_DICE'; pokemonId: string }
  | { type: 'UNLOCK_DICE'; pokemonId: string }
  | { type: 'REROLL' }
  | { type: 'DEAL_DAMAGE'; attackerId: string; targetId: string; amount: number }
  | { type: 'HEAL_POKEMON'; healerId: string; targetId: string; amount: number }
  | { type: 'RESOLVE_TURN' }
  | { type: 'UNDO' }
  | { type: 'END_FIGHT' };

function rollFace(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function generateRolls(party: Pokemon[]): DiceRollResult[] {
  return party.map((p) => ({
    pokemonId: p.id,
    rolledFaceSlot: rollFace(),
    locked: false,
  }));
}

function isMoveDone(pokemonId: string, slot: number, usageMap: Record<string, number>): boolean {
  const key = `${pokemonId}_${slot}`;
  return key in usageMap && usageMap[key] <= 0;
}

function allDone(rolls: DiceRollResult[], usageMap: Record<string, number>): boolean {
  return rolls.every((r) => r.locked || isMoveDone(r.pokemonId, r.rolledFaceSlot, usageMap));
}

function decrementUsage(
  pokemonId: string,
  roll: DiceRollResult | undefined,
  face: { move: { usage: number } } | null,
  usageMap: Record<string, number>
): Record<string, number> {
  const usageKey = `${pokemonId}_${roll?.rolledFaceSlot}`;
  const currentUsage = usageKey in usageMap ? usageMap[usageKey] : (face?.move.usage ?? 1);
  return { ...usageMap, [usageKey]: currentUsage - 1 };
}

export function gameReducer(state: RunState, action: GameAction): RunState {
  switch (action.type) {

    case 'START_FIGHT': {
      const rolls = generateRolls(action.playerParty);
      const fightState: FightState = {
        playerParty: action.playerParty,
        enemyParty: action.enemyParty,
        turn: 1,
        log: ['--- TURN 1 ---', 'A wild battle has started!'],
        turnState: { ...initialTurnState, rolls },
        enemyActions: generateEnemyActions(action.enemyParty, action.playerParty),
      };
      return { ...state, phase: 'fight', fightState };
    }

    case 'ROLL_DICE': {
      if (!state.fightState) return state;
      const { turnState, playerParty } = state.fightState;
      const newRolls: DiceRollResult[] = turnState.rolls.length === 0
        ? generateRolls(playerParty)
        : turnState.rolls.map((r) => r.locked ? r : { ...r, rolledFaceSlot: rollFace() });
      return {
        ...state,
        fightState: { ...state.fightState, turnState: { ...turnState, rolls: newRolls } },
      };
    }

    case 'LOCK_DICE': {
      if (!state.fightState) return state;
      const { turnState } = state.fightState;
      const roll = turnState.rolls.find((r) => r.pokemonId === action.pokemonId);
      if (!roll) return state;
      if (isMoveDone(action.pokemonId, roll.rolledFaceSlot, turnState.usageMap)) return state;
      const snapshot = createSnapshot(state.fightState);
      const newRolls = turnState.rolls.map((r) =>
        r.pokemonId === action.pokemonId ? { ...r, locked: true } : r
      );
      return {
        ...state,
        fightState: {
          ...state.fightState,
          turnState: { ...turnState, rolls: newRolls, history: [...turnState.history, snapshot] },
        },
      };
    }

    case 'UNLOCK_DICE': {
      if (!state.fightState) return state;
      const { turnState } = state.fightState;
      const newRolls = turnState.rolls.map((r) =>
        r.pokemonId === action.pokemonId ? { ...r, locked: false } : r
      );
      return {
        ...state,
        fightState: { ...state.fightState, turnState: { ...turnState, rolls: newRolls } },
      };
    }

    case 'REROLL': {
      if (!state.fightState) return state;
      const { turnState, playerParty } = state.fightState;
      if (turnState.rerollsRemaining <= 0) return state;
      const newRerolls = turnState.rerollsRemaining - 1;
      let newRolls = turnState.rolls.map((r) =>
        r.locked ? r : { ...r, rolledFaceSlot: rollFace() }
      );
      if (newRerolls <= 0) {
        newRolls = newRolls.map((r) => {
          if (r.locked) return r;
          const pokemon = playerParty.find((p) => p.id === r.pokemonId);
          if (!pokemon) return r;
          const face = pokemon.dice.faces[r.rolledFaceSlot - 1];
          if (face.move.category === 'empty') return { ...r, locked: true };
          return r;
        });
      }
      return {
        ...state,
        fightState: {
          ...state.fightState,
          turnState: { ...turnState, rolls: newRolls, rerollsRemaining: newRerolls },
        },
      };
    }

    case 'DEAL_DAMAGE': {
      if (!state.fightState) return state;
      const snapshot = createSnapshot(state.fightState);
      const { attackerId, targetId, amount } = action;
      const { turnState } = state.fightState;

      const attacker = state.fightState.playerParty.find((p) => p.id === attackerId);
      const target = state.fightState.enemyParty.find((p) => p.id === targetId);
      if (!attacker || !target) return state;

      const newEnemyParty = state.fightState.enemyParty.map((p) =>
        p.id === targetId ? { ...p, health: Math.max(0, p.health - amount) } : p
      );

      const roll = turnState.rolls.find((r) => r.pokemonId === attackerId);
      const face = roll ? attacker.dice.faces[roll.rolledFaceSlot - 1] : null;
      const newUsageMap = decrementUsage(attackerId, roll, face, turnState.usageMap);
      const newRolls = turnState.rolls.map((r) =>
        r.pokemonId === attackerId ? { ...r, locked: false } : r
      );

      const logEntry = `${attacker.name} dealt ${amount} damage to ${target.name}!`;
      const fainted = target.health - amount <= 0;
      const faintLog = fainted ? `${target.name} fainted!` : null;

      return {
        ...state,
        fightState: {
          ...state.fightState,
          enemyParty: newEnemyParty,
          log: [...state.fightState.log, logEntry, ...(faintLog ? [faintLog] : [])],
          turnState: {
            ...turnState,
            rolls: newRolls,
            usageMap: newUsageMap,
            history: [...turnState.history, snapshot],
          },
        },
      };
    }

    case 'HEAL_POKEMON': {
      if (!state.fightState) return state;
      const snapshot = createSnapshot(state.fightState);
      const { healerId, targetId, amount } = action;
      const { turnState } = state.fightState;

      const healer = state.fightState.playerParty.find((p) => p.id === healerId);
      const target = state.fightState.playerParty.find((p) => p.id === targetId);
      if (!healer || !target) return state;

      const newPlayerParty = state.fightState.playerParty.map((p) =>
        p.id === targetId
          ? { ...p, health: Math.min(p.maxHealth, p.health + amount) }
          : p
      );

      const roll = turnState.rolls.find((r) => r.pokemonId === healerId);
      const face = roll ? healer.dice.faces[roll.rolledFaceSlot - 1] : null;
      const newUsageMap = decrementUsage(healerId, roll, face, turnState.usageMap);
      const newRolls = turnState.rolls.map((r) =>
        r.pokemonId === healerId ? { ...r, locked: false } : r
      );

      const healed = Math.min(amount, target.maxHealth - target.health);
      const logEntry = `${healer.name} healed ${target.name} for ${healed} HP!`;

      return {
        ...state,
        fightState: {
          ...state.fightState,
          playerParty: newPlayerParty,
          log: [...state.fightState.log, logEntry],
          turnState: {
            ...turnState,
            rolls: newRolls,
            usageMap: newUsageMap,
            history: [...turnState.history, snapshot],
          },
        },
      };
    }

    case 'UNDO': {
      if (!state.fightState) return state;
      const { turnState } = state.fightState;
      if (turnState.history.length === 0) return state;
      const history = [...turnState.history];
      const snapshot = history.pop()!;
      const restored = restoreSnapshot(state.fightState, snapshot);
      return {
        ...state,
        fightState: { ...restored, turnState: { ...restored.turnState, history } },
      };
    }

    case 'RESOLVE_TURN': {
      if (!state.fightState) return state;
      const { turnState, playerParty, enemyParty } = state.fightState;
      if (!allDone(turnState.rolls, turnState.usageMap)) return state;

      const log: string[] = [...state.fightState.log];
      let newEnemyParty = [...enemyParty];
      let newPlayerParty = [...playerParty];

      // player miss logs
      turnState.rolls.forEach((r) => {
        const pokemon = playerParty.find((p) => p.id === r.pokemonId);
        if (!pokemon) return;
        const face = pokemon.dice.faces[r.rolledFaceSlot - 1];
        if (r.locked && face.move.category === 'empty') {
          log.push(`${pokemon.name} missed!`);
        }
      });

      // use the pre-generated enemy actions (same ones shown as yellow hearts)
      const enemyActions = state.fightState.enemyActions;
      enemyActions.forEach((action) => {
        const enemy = newEnemyParty.find((p) => p.id === action.attackerId);
        if (!enemy) return;

        if (action.isMiss) {
          log.push(`${enemy.name} missed!`);
          return;
        }

        const target = newPlayerParty.find((p) => p.id === action.targetId);
        if (!target) return;

        newPlayerParty = newPlayerParty.map((p) =>
          p.id === action.targetId
            ? { ...p, health: Math.max(0, p.health - action.power) }
            : p
        );

        log.push(`${enemy.name} used ${action.face.move.name} on ${target.name} for ${action.power} damage!`);
        if (target.health - action.power <= 0) log.push(`${target.name} fainted!`);
      });

      const nextTurn = state.fightState.turn + 1;
      return {
        ...state,
        fightState: {
          ...state.fightState,
          turn: nextTurn,
          playerParty: newPlayerParty,
          enemyParty: newEnemyParty,
          log: [...log, `--- TURN ${nextTurn} ---`],
          enemyActions: generateEnemyActions(newEnemyParty, newPlayerParty),
          turnState: { ...initialTurnState, rolls: generateRolls(playerParty) },
        },
      };
    }

    case 'END_FIGHT': {
      return { ...state, phase: 'map', fightState: null };
    }

    default:
      return state;
  }
}