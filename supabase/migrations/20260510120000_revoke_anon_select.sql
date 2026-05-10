-- Revoke unauthenticated read access. Prior migration grants table DML to authenticated;
-- new tables in public may still inherit default privileges for role anon until revoked.
-- Clients must send a JWT so PostgREST runs as authenticated when using the anon API key.

revoke select on table public.profiles from anon;
revoke select on table public.workout_sessions from anon;
revoke select on table public.health_metrics from anon;
