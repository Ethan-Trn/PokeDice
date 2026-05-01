import { useState, useRef, useEffect } from 'react';
import type { FightState } from '../../state/gameState';
import type { GameAction } from '../../state/gameReducer';
import type { EnemyAction } from '../../state/enemyAI';
import PlayerPanel from './PlayerPanel';
import EnemyPanel from './EnemyPanel';
import DiceArea from './DiceArea';
import './FightScreen.css';

interface Props {
  fightState: FightState;
  dispatch: (action: GameAction) => void;
}

export interface TargetingState {
  attackerId: string;
  power: number;
  mode: 'attack' | 'heal';
}

function allDone(fightState: FightState): boolean {
  const { rolls, usageMap } = fightState.turnState;
  return rolls.every((r) => {
    if (r.locked) return true;
    const key = `${r.pokemonId}_${r.rolledFaceSlot}`;
    return key in usageMap && usageMap[key] <= 0;
  });
}

export default function FightScreen({ fightState, dispatch }: Props) {
  const { turnState, log } = fightState;
  const canUndo = turnState.history.length > 0;
  const canResolve = allDone(fightState);

  const [targeting, setTargeting] = useState<TargetingState | null>(null);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const playerCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const enemyCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const logEndRef = useRef<HTMLDivElement>(null);

  // auto-scroll log to bottom when new entries arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  const enemyActions: EnemyAction[] = fightState.enemyActions;

  function getAttackersOf(playerId: string): EnemyAction[] {
    return enemyActions.filter((a) => a.targetId === playerId && !a.isMiss);
  }

  function incomingDamage(playerId: string): number {
    return getAttackersOf(playerId).reduce((sum, a) => sum + a.power, 0);
  }

  function handlePlayerCardClick(pokemonId: string) {
    const roll = turnState.rolls.find((r) => r.pokemonId === pokemonId);

    // if in heal targeting mode — clicking any friendly card heals them (including self)
    if (targeting?.mode === 'heal') {
      dispatch({
        type: 'HEAL_POKEMON',
        healerId: targeting.attackerId,
        targetId: pokemonId,
        amount: targeting.power,
      });
      setTargeting(null);
      return;
    }

    if (!roll?.locked) return;
    const pokemon = fightState.playerParty.find((p) => p.id === pokemonId);
    if (!pokemon) return;
    const face = pokemon.dice.faces[roll.rolledFaceSlot - 1];

    // cancel targeting if clicking the same pokemon
    if (targeting?.attackerId === pokemonId) {
      setTargeting(null);
      return;
    }

    const power = face.powerOverride ?? face.move.basePower;

    if (face.move.category === 'attack') {
      setTargeting({ attackerId: pokemonId, power, mode: 'attack' });
    } else if (face.move.category === 'heal') {
      setTargeting({ attackerId: pokemonId, power, mode: 'heal' });
    }
  }

  function handleEnemyClick(targetId: string) {
    if (!targeting || targeting.mode !== 'attack') return;
    dispatch({ type: 'DEAL_DAMAGE', attackerId: targeting.attackerId, targetId, amount: targeting.power });
    setTargeting(null);
  }

  function getArrows(): { x1: number; y1: number; x2: number; y2: number; key: string }[] {
    if (!hoveredPlayerId || !arenaRef.current) return [];
    const arenaRect = arenaRef.current.getBoundingClientRect();
    const attackers = getAttackersOf(hoveredPlayerId);
    const playerEl = playerCardRefs.current.get(hoveredPlayerId);
    if (!playerEl) return [];
    const playerRect = playerEl.getBoundingClientRect();
    const px = playerRect.right - arenaRect.left;
    const py = playerRect.top + playerRect.height / 2 - arenaRect.top;

    return attackers.map((a) => {
      const enemyEl = enemyCardRefs.current.get(a.attackerId);
      if (!enemyEl) return null;
      const enemyRect = enemyEl.getBoundingClientRect();
      const ex = enemyRect.left - arenaRect.left;
      const ey = enemyRect.top + enemyRect.height / 2 - arenaRect.top;
      return { x1: ex, y1: ey, x2: px, y2: py, key: a.attackerId };
    }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number; key: string }[];
  }

  const arrows = getArrows();

  return (
    <div className="fight-screen">

      <div className="fight-topbar">
        <span className="turn-label">TURN {fightState.turn}</span>
        {targeting?.mode === 'attack' && <span className="targeting-label">SELECT ENEMY</span>}
        {targeting?.mode === 'heal' && <span className="targeting-label heal-label">SELECT ALLY</span>}
      </div>

      <div className="fight-arena" ref={arenaRef}>

        {arrows.length > 0 && (
          <svg className="arrow-overlay" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="rgba(255,140,0,0.9)" />
              </marker>
            </defs>
            {arrows.map((a) => (
              <line
                key={a.key}
                x1={a.x1} y1={a.y1}
                x2={a.x2} y2={a.y2}
                stroke="rgba(255,140,0,0.6)"
                strokeWidth="3"
                strokeDasharray="8 5"
                markerEnd="url(#arrowhead)"
              />
            ))}
          </svg>
        )}

        <div className="fight-arena-left">
          <PlayerPanel
            party={fightState.playerParty}
            rolls={turnState.rolls}
            usageMap={turnState.usageMap}
            targeting={targeting}
            incomingDamageMap={Object.fromEntries(
              fightState.playerParty.map((p) => [p.id, incomingDamage(p.id)])
            )}
            onCardClick={handlePlayerCardClick}
            onCardHover={setHoveredPlayerId}
            cardRefs={playerCardRefs}
          />
        </div>

        <div className="fight-arena-center">
          <DiceArea fightState={fightState} dispatch={dispatch} />
        </div>

        <div className="fight-arena-right">
          <EnemyPanel
            party={fightState.enemyParty}
            isTargeting={!!targeting && targeting.mode === 'attack'}
            targetingPower={targeting?.power ?? 0}
            enemyActions={enemyActions}
            onEnemyClick={handleEnemyClick}
            cardRefs={enemyCardRefs}
          />
        </div>
      </div>

      <div className="fight-bottombar">
        <button
          className="action-btn reroll-btn"
          onClick={() => dispatch({ type: 'REROLL' })}
          disabled={turnState.rerollsRemaining <= 0}
        >
          REROLL ({turnState.rerollsRemaining}/2)
        </button>
        <button
          className="action-btn undo-btn"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={!canUndo}
        >
          UNDO
        </button>
        <button
          className="action-btn resolve-btn"
          onClick={() => dispatch({ type: 'RESOLVE_TURN' })}
          disabled={!canResolve}
        >
          RESOLVE TURN
        </button>
      </div>

      <div className="battle-log">
        {log.map((entry, i) => (
          <div
            key={i}
            className={`log-entry ${entry.startsWith('---') ? 'log-turn-header' : ''}`}
          >
            {entry}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

    </div>
  );
}