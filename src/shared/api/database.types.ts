/**
 * Minimal Supabase database typings for the browser client (extend as tables grow).
 * Kept in sync with SQL migrations under supabase/migrations/.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
