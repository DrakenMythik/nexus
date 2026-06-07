/** Block types that produce set_logs in guided workout flow. */
export type ProgramBlockType =
  | 'warmup'
  | 'workout'
  | 'superset'
  | 'interval_circuit'
  | 'cooldown';

const LOGGABLE_BLOCK_TYPES: ReadonlySet<ProgramBlockType> = new Set([
  'workout',
  'superset',
  'interval_circuit',
]);

/** True for main work blocks; warmup and cooldown are display-only (KTD4). */
export function isLoggableBlock(blockType: ProgramBlockType): boolean {
  return LOGGABLE_BLOCK_TYPES.has(blockType);
}
