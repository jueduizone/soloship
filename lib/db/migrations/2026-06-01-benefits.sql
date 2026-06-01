-- SoloShip benefits / perks center.
-- Run this in Supabase SQL Editor for existing databases.

do $$ begin
  create type benefit_type as enum ('token_code', 'merch', 'link', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type benefit_status as enum ('active', 'paused', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type benefit_claim_status as enum ('claimed', 'pending_fulfillment', 'fulfilled', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.benefits (
  id                    uuid primary key default gen_random_uuid(),
  event_id              uuid not null references public.events(id) on delete cascade,
  title                 text not null,
  provider              text,
  type                  benefit_type not null default 'link',
  status                benefit_status not null default 'active',
  description           text,
  claim_instructions    text,
  redeem_url            text,
  total_stock           integer,
  per_user_limit        integer not null default 1,
  starts_at             timestamptz,
  ends_at               timestamptz,
  order_index           integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists benefits_event_status_idx
  on public.benefits (event_id, status, order_index);

create table if not exists public.benefit_codes (
  id                    uuid primary key default gen_random_uuid(),
  benefit_id            uuid not null references public.benefits(id) on delete cascade,
  code                  text not null,
  assigned_to_user_id   uuid references auth.users(id) on delete set null,
  assigned_claim_id     uuid,
  assigned_at           timestamptz,
  created_at            timestamptz not null default now(),
  unique (benefit_id, code)
);

create index if not exists benefit_codes_benefit_assigned_idx
  on public.benefit_codes (benefit_id, assigned_at);

create table if not exists public.benefit_claims (
  id                    uuid primary key default gen_random_uuid(),
  benefit_id            uuid not null references public.benefits(id) on delete cascade,
  user_id               uuid not null references auth.users(id) on delete cascade,
  registration_id       uuid not null references public.registrations(id) on delete cascade,
  user_email            text not null,
  user_name             text,
  status                benefit_claim_status not null default 'claimed',
  claim_payload         jsonb not null default '{}'::jsonb,
  fulfilled_at          timestamptz,
  tracking_info         text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists benefit_claims_benefit_idx
  on public.benefit_claims (benefit_id, created_at desc);
create index if not exists benefit_claims_user_idx
  on public.benefit_claims (user_id, created_at desc);
create unique index if not exists benefit_claims_unique_active_idx
  on public.benefit_claims (benefit_id, user_id)
  where status <> 'cancelled';

do $$ begin
  alter table public.benefit_codes
    add constraint benefit_codes_assigned_claim_id_fkey
    foreign key (assigned_claim_id) references public.benefit_claims(id) on delete set null;
exception when duplicate_object then null; end $$;

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
    select unnest(array['benefits','benefit_claims'])
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.tg_set_updated_at()',
      t
    );
  end loop;
end $$;

alter table public.benefits       enable row level security;
alter table public.benefit_codes  enable row level security;
alter table public.benefit_claims enable row level security;

drop policy if exists benefits_paid_read on public.benefits;
create policy benefits_paid_read on public.benefits
  for select using (
    public.is_admin()
    or (
      status = 'active'
      and exists (
        select 1 from public.registrations r
        where r.user_id = auth.uid()
          and r.event_id = benefits.event_id
          and r.status = 'paid'
      )
    )
  );

drop policy if exists benefits_admin_write on public.benefits;
create policy benefits_admin_write on public.benefits
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists benefit_codes_admin_all on public.benefit_codes;
create policy benefit_codes_admin_all on public.benefit_codes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists benefit_claims_own_read on public.benefit_claims;
create policy benefit_claims_own_read on public.benefit_claims
  for select using (public.is_admin() or auth.uid() = user_id);

drop policy if exists benefit_claims_admin_write on public.benefit_claims;
create policy benefit_claims_admin_write on public.benefit_claims
  for all using (public.is_admin()) with check (public.is_admin());
