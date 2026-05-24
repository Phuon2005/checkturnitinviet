-- Create a function to copy role from profiles to auth.users
create or replace function public.handle_profile_role_update()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update auth.users
  set raw_app_meta_data = 
    coalesce(raw_app_meta_data, '{}'::jsonb) || 
    json_build_object('role', new.role)::jsonb
  where id = new.id;
  return new;
end;
$$;

-- Trigger whenever a role is updated or created
create trigger on_profile_role_update
  after insert or update of role on public.profiles
  for each row execute procedure public.handle_profile_role_update();
