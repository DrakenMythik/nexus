import type { BlockType } from './types';

/** True for main work blocks; warmup and cooldown are display-only. */
export function isLoggableBlock(blockType: BlockType): boolean {
  return blockType === 'Main';
}
