-- Run this in your Supabase SQL editor to fix signup

-- 1. Update trigger to pull username from signup metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- 2. Add missing INSERT policy so users can write their own profile
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
