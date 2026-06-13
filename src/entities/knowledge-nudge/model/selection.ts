import type { KnowledgeNudge, UserNudgeHistory } from './types';

export function selectTodaysNudge(
  nudges: KnowledgeNudge[],
  history: UserNudgeHistory[],
  preferredCategories: string[] = [],
): KnowledgeNudge | null {
  if (nudges.length === 0) {
    return null;
  }

  const seen = new Set(history.map((entry) => entry.nudge_id).filter(Boolean));
  const unseen = nudges.filter((nudge) => !seen.has(nudge.id));
  const pool = unseen.length > 0 ? unseen : nudges;

  return (
    pool.find((nudge) => preferredCategories.includes(nudge.category)) ??
    pool[0] ??
    null
  );
}
