export type MapNodeType = 'fight' | 'elite' | 'boss' | 'shop' | 'event' | 'rest';

export interface MapNode {
  id: string;
  type: MapNodeType;
  position: { x: number; y: number }; // for rendering on the map
  connectedTo: string[];               // ids of nodes this connects to (paths forward)
  completed: boolean;
}

export interface GameMap {
  nodes: MapNode[];
  currentNodeId: string | null;
  bossNodeId: string;
}