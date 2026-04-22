-- ══════════════════════════════════════════════════════
-- Rootio — Supabase Schema v1
-- Execute no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════

-- Extensão para UUIDs
create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────
-- Criado automaticamente quando o usuário se cadastra
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text,
  avatar      text default '🌱',
  plan        text default 'free' check (plan in ('free', 'pro')),
  theme       text default 'light',
  sound_on    boolean default true,
  shop_owned  text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── HABITS ────────────────────────────────────────────
create table if not exists public.habits (
  id          bigint primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  done        boolean default false,
  pts         int default 20,
  icon        text default 'PiStarBold',
  priority    text default 'media',
  freq        text default 'diario',
  days        int[] default '{0,1,2,3,4,5,6}',
  subtasks    jsonb default '[]',
  notes       text default '',
  est_mins    int,
  deadline    text,
  tags        text[] default '{}',
  hidden      boolean default false,
  created_at  text,
  updated_at  timestamptz default now()
);

-- ── HABIT HISTORY ─────────────────────────────────────
create table if not exists public.habit_history (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        text not null,
  done        int default 0,
  total       int default 0,
  habits      jsonb default '{}',
  unique (user_id, date)
);

-- ── TRANSACTIONS (Finanças) ────────────────────────────
create table if not exists public.transactions (
  id          bigint primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  type        text not null check (type in ('income', 'expense')),
  amount      numeric(12,2) not null,
  description text,
  category    text,
  date        text not null,
  created_at  timestamptz default now()
);

-- ── FINANCIAL GOALS ───────────────────────────────────
create table if not exists public.financial_goals (
  id          bigint primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  target      numeric(12,2) default 0,
  saved       numeric(12,2) default 0,
  deadline    text,
  icon        text,
  aportes     jsonb default '[]',
  created_at  timestamptz default now()
);

-- ── EMERGENCY FUND ────────────────────────────────────
create table if not exists public.emergency_fund (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  target      numeric(12,2) default 0,
  current     numeric(12,2) default 0,
  updated_at  timestamptz default now()
);

-- ── CAREER — READINGS ─────────────────────────────────
create table if not exists public.career_readings (
  id          bigint primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  author      text,
  type        text,
  status      text default 'quero',
  rating      int default 0,
  notes       text default '',
  link        text,
  created_at  text
);

-- ── CAREER — GOALS ────────────────────────────────────
create table if not exists public.career_goals (
  id          bigint primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  area        text,
  milestones  jsonb default '[]',
  created_at  text
);

-- ── CAREER — PROJECTS ─────────────────────────────────
create table if not exists public.career_projects (
  id          bigint primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  status      text default 'planejando',
  tasks       jsonb default '[]',
  tags        text[] default '{}',
  notes       text default '',
  created_at  text
);

-- ── LIFE PROJECTS ─────────────────────────────────────
create table if not exists public.life_projects (
  id           bigint primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  title        text not null,
  description  text,
  category     text,
  priority     text default 'media',
  status       text default 'planejando',
  milestones   jsonb default '[]',
  activity_log jsonb default '[]',
  notes        text default '',
  deadline     text,
  created_at   text
);

-- ── JOURNAL ───────────────────────────────────────────
create table if not exists public.journal (
  id          bigint primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  text        text not null,
  mood        text,
  tags        text[] default '{}',
  date        text,
  prompt      text,
  created_at  timestamptz default now()
);

-- ── FINANCE CONFIG ────────────────────────────────────
create table if not exists public.finance_config (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null unique,
  income           numeric(12,2) default 0,
  cats_income      text[] default '{}',
  cats_expense     text[] default '{}',
  month_goal       numeric(12,2),
  month_goal_label text,
  updated_at       timestamptz default now()
);

-- ══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — cada usuário vê só os seus dados
-- ══════════════════════════════════════════════════════

alter table public.profiles        enable row level security;
alter table public.habits          enable row level security;
alter table public.habit_history   enable row level security;
alter table public.transactions    enable row level security;
alter table public.financial_goals enable row level security;
alter table public.emergency_fund  enable row level security;
alter table public.career_readings enable row level security;
alter table public.career_goals    enable row level security;
alter table public.career_projects enable row level security;
alter table public.life_projects   enable row level security;
alter table public.journal         enable row level security;
alter table public.finance_config  enable row level security;

  -- Políticas: usuário só acessa/modifica os próprios registros
  -- Nota: profiles é tratado separadamente pois usa 'id' em vez de 'user_id'
do $$
declare
  tbl text;
  tables text[] := array[
    'habits','habit_history','transactions',
    'financial_goals','emergency_fund','career_readings',
    'career_goals','career_projects','life_projects',
    'journal','finance_config'
  ];
begin
  foreach tbl in array tables loop
    -- SELECT
    execute format('create policy "user_select_%I" on public.%I
      for select using (auth.uid() = user_id)', tbl, tbl);
    -- INSERT
    execute format('create policy "user_insert_%I" on public.%I
      for insert with check (auth.uid() = user_id)', tbl, tbl);
    -- UPDATE
    execute format('create policy "user_update_%I" on public.%I
      for update using (auth.uid() = user_id)', tbl, tbl);
    -- DELETE
    execute format('create policy "user_delete_%I" on public.%I
      for delete using (auth.uid() = user_id)', tbl, tbl);
  end loop;
end $$;

-- Profiles: a política usa id em vez de user_id
drop policy if exists "user_select_profiles" on public.profiles;
drop policy if exists "user_insert_profiles" on public.profiles;
drop policy if exists "user_update_profiles" on public.profiles;
drop policy if exists "user_delete_profiles" on public.profiles;

create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- ── Trigger: cria profile automaticamente no cadastro ──
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ══════════════════════════════════════════════════════
-- INDEXES — performance em queries frequentes
-- ══════════════════════════════════════════════════════
create index if not exists idx_habits_user          on public.habits(user_id);
create index if not exists idx_habit_history_user   on public.habit_history(user_id, date);
create index if not exists idx_transactions_user    on public.transactions(user_id, date);
create index if not exists idx_life_projects_user   on public.life_projects(user_id);
create index if not exists idx_journal_user         on public.journal(user_id, date);
