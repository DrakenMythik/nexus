-- Allow deactivating enrollments when the referenced program is no longer published.
-- INSERT still requires is_published = true; UPDATE WITH CHECK only requires publish
-- when the row remains active (is_active = true).

drop policy if exists "user_program_enrollments_update_own"
  on public.user_program_enrollments;

create policy "user_program_enrollments_update_own"
  on public.user_program_enrollments
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      not is_active
      or exists (
        select 1
        from public.programs p
        where p.id = program_id
          and p.is_published = true
      )
    )
  );
