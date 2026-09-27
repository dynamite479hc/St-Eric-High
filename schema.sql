-- ============================================================
-- St. Eric High School — Supabase Schema
-- Run this once in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES (admin/editor accounts, linked to Supabase Auth)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('super_admin','editor')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- NEWS
-- ------------------------------------------------------------
create table news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'School News',
  summary text,
  body text,
  image_path text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EVENTS
-- ------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Whole School',
  description text,
  event_date date not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ANNOUNCEMENTS
-- ------------------------------------------------------------
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  priority text not null default 'info' check (priority in ('info','notice','urgent')),
  status text not null default 'draft' check (status in ('draft','published')),
  announcement_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SPORTS: MATCH RESULTS (Scoreboard)
-- ------------------------------------------------------------
create table matches (
  id uuid primary key default gen_random_uuid(),
  sport text not null,
  match_type text not null default 'Inter-House' check (match_type in ('Inter-House','Inter-School')),
  team_a text not null,
  score_a int not null default 0,
  team_b text not null,
  score_b int not null default 0,
  match_date date not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ACHIEVEMENTS (academic + sports, shown on Student Life / Sports)
-- ------------------------------------------------------------
create table achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'General',
  achievement_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- MEDIA LIBRARY (backs both Gallery and reusable media elsewhere)
-- Actual files live in Supabase Storage bucket "media";
-- this table stores metadata + the storage path.
-- ------------------------------------------------------------
create table media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null,
  category text not null default 'Campus',
  in_gallery boolean not null default true,
  uploaded_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- STAFF DIRECTORY
-- ------------------------------------------------------------
create table staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text,
  department text not null default 'General',
  photo_path text,
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- LEADERSHIP (About page)
-- ------------------------------------------------------------
create table leadership (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  photo_path text,
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- HISTORY TIMELINE
-- ------------------------------------------------------------
create table history_timeline (
  id uuid primary key default gen_random_uuid(),
  year_label text not null,
  title text not null,
  body text,
  photo_path text,
  caption text,
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- CLUBS
-- ------------------------------------------------------------
create table clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  link_url text,
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- CONTACT MESSAGES (from the public Contact page form)
-- ------------------------------------------------------------
create table messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SITE SETTINGS (key/value store: contact info, social links,
-- important dates, branding — one row per setting)
-- ------------------------------------------------------------
create table site_settings (
  key text primary key,
  value jsonb not null
);

insert into site_settings (key, value) values
  ('contact_info', '{"address":"19 St. Eric Road, Tynwald, Harare","phone":"+263 4 779 129 / 0772 123 456","email":"info@stelichigh.org"}'),
  ('social_links', '{"instagram":"","facebook":"","youtube":"","x":""}'),
  ('branding', '{"school_name":"St. Eric High School","tagline":"Excellence in Education, Faith & Community"}');

-- ============================================================
-- ROW LEVEL SECURITY
-- Public (anonymous) visitors can only READ published content.
-- Only authenticated admin/editor accounts can write.
-- ============================================================

alter table news enable row level security;
alter table events enable row level security;
alter table announcements enable row level security;
alter table matches enable row level security;
alter table achievements enable row level security;
alter table media enable row level security;
alter table staff enable row level security;
alter table leadership enable row level security;
alter table history_timeline enable row level security;
alter table clubs enable row level security;
alter table messages enable row level security;
alter table site_settings enable row level security;
alter table profiles enable row level security;

-- Public read policies (only published/visible rows)
create policy "public read published news" on news for select using (status = 'published');
create policy "public read events" on events for select using (true);
create policy "public read published announcements" on announcements for select using (status = 'published');
create policy "public read matches" on matches for select using (true);
create policy "public read achievements" on achievements for select using (true);
create policy "public read gallery media" on media for select using (in_gallery = true);
create policy "public read staff" on staff for select using (true);
create policy "public read leadership" on leadership for select using (true);
create policy "public read history" on history_timeline for select using (true);
create policy "public read clubs" on clubs for select using (true);
create policy "public read settings" on site_settings for select using (true);

-- Public INSERT-only on messages (anyone can submit the contact form, nobody can read others' messages)
create policy "public insert messages" on messages for insert with check (true);

-- Authenticated admin/editor full access (all tables)
create policy "admin all news" on news for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all events" on events for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all announcements" on announcements for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all matches" on matches for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all achievements" on achievements for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all media" on media for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all staff" on staff for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all leadership" on leadership for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all history" on history_timeline for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all clubs" on clubs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all messages" on messages for select using (auth.role() = 'authenticated');
create policy "admin update messages" on messages for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin delete messages" on messages for delete using (auth.role() = 'authenticated');
create policy "admin all settings" on site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin read own profile" on profiles for select using (auth.uid() = id);
