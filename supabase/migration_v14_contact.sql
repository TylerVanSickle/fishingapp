create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  category text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Only admins can read/update, anyone can insert
alter table contact_submissions enable row level security;

create policy "Admins can read contact submissions"
  on contact_submissions for select
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update contact submissions"
  on contact_submissions for update
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Anyone can submit contact form"
  on contact_submissions for insert
  with check (true);
