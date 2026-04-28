export type ItemCategory = 'tm' | 'held' | 'consumable';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  moveId?: string; // for TMs — which move this teaches
}