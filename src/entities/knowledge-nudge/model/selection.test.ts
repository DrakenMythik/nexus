import { describe, expect, it } from 'vitest';

import { selectTodaysNudge } from './selection';
import type { KnowledgeNudge, UserNudgeHistory } from './types';

const nudge = (id: string, category: KnowledgeNudge['category']): KnowledgeNudge => ({
  id,
  category,
  title: id,
  content: 'Learn something useful.',
  source_citation: null,
});

describe('selectTodaysNudge', () => {
  it('chooses unseen nudges before repeating', () => {
    const selected = selectTodaysNudge(
      [nudge('seen', 'Sleep'), nudge('new', 'Recovery')],
      [{ id: 'history-1', user_id: 'user-1', nudge_id: 'seen', seen_at: null }],
    );

    expect(selected?.id).toBe('new');
  });

  it('prefers requested categories from the available pool', () => {
    const selected = selectTodaysNudge(
      [nudge('sleep', 'Sleep'), nudge('protein', 'Nutrition')],
      [],
      ['Nutrition'],
    );

    expect(selected?.id).toBe('protein');
  });

  it('recycles after all nudges are seen', () => {
    const nudges = [nudge('sleep', 'Sleep')];
    const history: UserNudgeHistory[] = [
      { id: 'history-1', user_id: 'user-1', nudge_id: 'sleep', seen_at: null },
    ];

    expect(selectTodaysNudge(nudges, history)?.id).toBe('sleep');
  });
});
