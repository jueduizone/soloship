-- =====================================================================
-- SoloShip Vol.1 MVP — Schema
--
-- 在 Supabase SQL Editor 里按顺序跑这份 SQL。
-- 幂等：用 `create ... if not exists` + `do $$` 守卫重复创建。
-- 设计参考：docs/plans/2026-04-18-soloship-mvp-design.md §8 数据模块
--
-- 核心表：
--   events                  —— cohort 基本信息
--   registrations           —— 报名（application）
--   admission_decisions     —— 审核/录取决策流水
--   payment_confirmations   —— 人工支付确认记录
--   fellow_profiles         —— 同学录（录取后才生成）
--   resources               —— 资料库
--
-- 权限模型（MVP）：
--   - 大部分写入走 service_role（API routes），绕 RLS
--   - 用户侧读，用 RLS policy 限制到「我自己的报名」
--   - events / fellow_profiles(public) / resources(public) 允许匿名读
--   - admin 判定：auth.users.raw_user_meta_data->>'is_admin' = 'true'
-- =====================================================================

-- ------------------------------------------------------------------
-- extensions
-- ------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- enums
-- ------------------------------------------------------------------
do $$ begin
  create type registration_status as enum (
    'submitted',        -- 刚提交，待审核
    'reviewing',        -- 审核中
    'admitted',         -- 已录取，等付款
    'waitlisted',       -- 候补
    'rejected',         -- 未录取
    'payment_pending',  -- 已通知付款，未确认到账
    'paid',             -- 已确认付款，正式入营
    'withdrawn'         -- 用户主动退出
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type admission_decision_kind as enum ('admit', 'waitlist', 'reject');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_confirmation_status as enum ('pending', 'confirmed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('draft', 'recruiting', 'reviewing', 'running', 'finished');
exception when duplicate_object then null; end $$;

do $$ begin
  create type profile_visibility as enum ('public', 'cohort_only', 'private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type resource_stage as enum ('pre_camp', 'week_1', 'week_2', 'demo_day', 'post_camp');
exception when duplicate_object then null; end $$;

do $$ begin
  create type resource_visibility as enum ('public', 'admitted_only');
exception when duplicate_object then null; end $$;


-- ------------------------------------------------------------------
-- events —— cohort 基本信息，第一期只有一行
-- ------------------------------------------------------------------
create table if not exists public.events (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,         -- e.g. 'vol-1'
  name            text not null,
  subtitle        text,
  hero_text       text,
  start_date      date,
  end_date        date,
  demo_day_date   date,
  price_cents     integer not null default 39900,  -- ¥399
  currency        text not null default 'CNY',
  capacity        integer,
  status          event_status not null default 'draft',
  faq             jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists events_status_idx on public.events(status);


-- ------------------------------------------------------------------
-- registrations —— 报名记录
-- ------------------------------------------------------------------
create table if not exists public.registrations (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references public.events(id) on delete restrict,
  user_id             uuid references auth.users(id) on delete set null,

  -- 申请人信息
  name                text not null,
  email               text not null,
  city                text,
  bio                 text,
  build_direction     text,       -- 方向：工具 / 内容 / 社交 / B2B …
  project_idea        text,       -- 手里在做/想做的项目
  links               jsonb not null default '[]'::jsonb, -- [{label,url}]
  extra               jsonb not null default '{}'::jsonb, -- 其他字段预留

  -- 状态 & 运营
  status              registration_status not null default 'submitted',
  reviewer_note       text,
  tags                text[] not null default '{}',

  submitted_at        timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (event_id, email)
);

create index if not exists registrations_event_status_idx
  on public.registrations (event_id, status);
create index if not exists registrations_user_idx
  on public.registrations (user_id);
create index if not exists registrations_submitted_at_idx
  on public.registrations (submitted_at desc);


-- ------------------------------------------------------------------
-- admission_decisions —— 审核决策流水（每次审核一条，便于审计）
-- ------------------------------------------------------------------
create table if not exists public.admission_decisions (
  id                uuid primary key default gen_random_uuid(),
  registration_id   uuid not null references public.registrations(id) on delete cascade,
  reviewer_id       uuid references auth.users(id) on delete set null,
  decision          admission_decision_kind not null,
  note              text,
  decided_at        timestamptz not null default now()
);

create index if not exists admission_decisions_reg_idx
  on public.admission_decisions (registration_id, decided_at desc);


-- ------------------------------------------------------------------
-- payment_confirmations —— 人工支付确认
-- 没接第三方支付；运营看到打款截图/流水后手动登记一条 confirmed
-- ------------------------------------------------------------------
create table if not exists public.payment_confirmations (
  id                uuid primary key default gen_random_uuid(),
  registration_id   uuid not null references public.registrations(id) on delete cascade,
  amount_cents      integer not null,
  currency          text not null default 'CNY',
  channel           text,           -- 'wechat' | 'alipay' | 'bank' | 其他
  external_ref      text,           -- 用户提供的流水号/备注
  screenshot_url    text,           -- 打款截图（可选）
  status            payment_confirmation_status not null default 'pending',
  confirmed_by      uuid references auth.users(id) on delete set null,
  confirmed_at      timestamptz,
  note              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists payment_confirmations_reg_idx
  on public.payment_confirmations (registration_id, created_at desc);
create index if not exists payment_confirmations_status_idx
  on public.payment_confirmations (status);


-- ------------------------------------------------------------------
-- fellow_profiles —— 同学录
-- ------------------------------------------------------------------
create table if not exists public.fellow_profiles (
  id                uuid primary key default gen_random_uuid(),
  registration_id   uuid not null unique references public.registrations(id) on delete cascade,
  event_id          uuid not null references public.events(id) on delete restrict,

  display_name      text not null,
  avatar_url        text,
  one_liner         text,
  city              text,
  tags              text[] not null default '{}',
  project_name      text,
  project_intro     text,
  links             jsonb not null default '[]'::jsonb,

  visibility        profile_visibility not null default 'cohort_only',
  published         boolean not null default false,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists fellow_profiles_event_idx
  on public.fellow_profiles (event_id, published);


-- ------------------------------------------------------------------
-- resources —— 资料库
-- ------------------------------------------------------------------
create table if not exists public.resources (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid not null references public.events(id) on delete cascade,
  title             text not null,
  summary           text,
  url               text,
  type              text,           -- 'doc' | 'video' | 'link' | 'pdf'
  stage             resource_stage not null default 'pre_camp',
  visibility        resource_visibility not null default 'admitted_only',
  order_index       integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists resources_event_stage_idx
  on public.resources (event_id, stage, order_index);


-- ------------------------------------------------------------------
-- updated_at 自动维护
-- ------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'events','registrations','payment_confirmations','fellow_profiles','resources'
    ])
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.tg_set_updated_at()',
      t
    );
  end loop;
end $$;


-- ------------------------------------------------------------------
-- is_admin() helper —— 看当前 JWT 里的 user_metadata.is_admin
-- ------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
    false
  );
$$;


-- ------------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------------
alter table public.events                 enable row level security;
alter table public.registrations          enable row level security;
alter table public.admission_decisions    enable row level security;
alter table public.payment_confirmations  enable row level security;
alter table public.fellow_profiles        enable row level security;
alter table public.resources              enable row level security;

-- events: 任何人可读非 draft 的活动
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events
  for select using (status <> 'draft' or public.is_admin());

drop policy if exists events_admin_write on public.events;
create policy events_admin_write on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- registrations: 用户只能读自己的；admin 读全部；写入主要走 service_role
drop policy if exists registrations_own_read on public.registrations;
create policy registrations_own_read on public.registrations
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists registrations_own_insert on public.registrations;
create policy registrations_own_insert on public.registrations
  for insert with check (auth.uid() = user_id);

drop policy if exists registrations_own_update on public.registrations;
create policy registrations_own_update on public.registrations
  for update using (
    (auth.uid() = user_id and status in ('submitted','reviewing'))
    or public.is_admin()
  );

-- admission_decisions: 只有 admin 读写
drop policy if exists admission_decisions_admin_all on public.admission_decisions;
create policy admission_decisions_admin_all on public.admission_decisions
  for all using (public.is_admin()) with check (public.is_admin());

-- payment_confirmations: 用户读自己的；admin 读写
drop policy if exists payment_confirmations_own_read on public.payment_confirmations;
create policy payment_confirmations_own_read on public.payment_confirmations
  for select using (
    public.is_admin() or exists (
      select 1 from public.registrations r
      where r.id = payment_confirmations.registration_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists payment_confirmations_admin_write on public.payment_confirmations;
create policy payment_confirmations_admin_write on public.payment_confirmations
  for all using (public.is_admin()) with check (public.is_admin());

-- fellow_profiles: 已 published + visibility=public 任何人读；
-- cohort_only：已付款用户可读；admin 全部
drop policy if exists fellow_profiles_public_read on public.fellow_profiles;
create policy fellow_profiles_public_read on public.fellow_profiles
  for select using (
    public.is_admin()
    or (published and visibility = 'public')
    or (
      published and visibility = 'cohort_only' and exists (
        select 1 from public.registrations r
        where r.user_id = auth.uid() and r.status = 'paid'
      )
    )
    or exists (
      select 1 from public.registrations r
      where r.id = fellow_profiles.registration_id and r.user_id = auth.uid()
    )
  );

drop policy if exists fellow_profiles_own_update on public.fellow_profiles;
create policy fellow_profiles_own_update on public.fellow_profiles
  for update using (
    public.is_admin() or exists (
      select 1 from public.registrations r
      where r.id = fellow_profiles.registration_id and r.user_id = auth.uid()
    )
  );

drop policy if exists fellow_profiles_admin_write on public.fellow_profiles;
create policy fellow_profiles_admin_write on public.fellow_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- resources: visibility=public 任意读，admitted_only 需要 paid
drop policy if exists resources_read on public.resources;
create policy resources_read on public.resources
  for select using (
    public.is_admin()
    or visibility = 'public'
    or (visibility = 'admitted_only' and exists (
      select 1 from public.registrations r
      where r.user_id = auth.uid() and r.status = 'paid'
    ))
  );

drop policy if exists resources_admin_write on public.resources;
create policy resources_admin_write on public.resources
  for all using (public.is_admin()) with check (public.is_admin());


-- ------------------------------------------------------------------
-- seed —— 插入 Vol.1 默认活动（幂等：按 slug 冲突跳过）
-- ------------------------------------------------------------------
insert into public.events (slug, name, subtitle, price_cents, status)
values (
  'vol-1',
  'SoloShip Vol.1',
  '全球化 AI OPC 共学营',
  39900,
  'recruiting'
)
on conflict (slug) do nothing;
