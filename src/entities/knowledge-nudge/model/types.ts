import type { Database } from '@/shared/api';

export type KnowledgeNudge =
  Database['public']['Tables']['knowledge_nudges']['Row'];
export type UserNudgeHistory =
  Database['public']['Tables']['user_nudge_history']['Row'];
