-- Fix handle_new_user: INSERT listed only (id) but supplied two values, breaking auth sign-up.
-- display_name is set later by the client via upsertProfile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;
