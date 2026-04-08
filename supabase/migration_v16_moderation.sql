-- User blocks
create table if not exists user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id)
);

alter table user_blocks enable row level security;

create policy "Users manage own blocks"
  on user_blocks using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

-- Admin moderation columns on profiles
alter table profiles add column if not exists is_banned boolean default false;
alter table profiles add column if not exists is_suspended boolean default false;
alter table profiles add column if not exists suspended_until timestamptz;
alter table profiles add column if not exists ban_reason text;
alter table profiles add column if not exists warn_count integer default 0;

-- Admin action log
create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id),
  target_user_id uuid not null references profiles(id),
  action text not null, -- 'ban', 'unban', 'suspend', 'unsuspend', 'warn', 'delete_content'
  reason text,
  details jsonb,
  created_at timestamptz default now()
);

alter table admin_actions enable row level security;

-- Only admins can read action log
create policy "Admins read action log"
  on admin_actions for select
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Admins can insert
create policy "Admins insert action log"
  on admin_actions for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
