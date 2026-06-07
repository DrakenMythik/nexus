-- Add cooldown block type for post-workout stretch sections.
-- warmup and cooldown blocks are display-only in guided UI (not set-logged).

alter type public.program_block_type add value if not exists 'cooldown';

comment on type public.program_block_type is
  'Day section type: warmup/cooldown are display-only; workout/superset/interval_circuit are loggable.';
