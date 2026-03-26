export interface Cat {
  id: string;
  url: string;
  width: number;
  height: number;
  rarity: 'common' | 'rare' | 'legendary';
  collectedAt: number;
  isFavorite?: boolean;
}

export interface GameState {
  collection: Cat[];
  unlockedSounds: string[];
  milestones: string[];
  chaosMode: boolean;
}
