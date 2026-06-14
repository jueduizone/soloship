-- SoloShip hidden admin lottery tool.
-- Run this in Supabase SQL Editor for existing databases.

create table if not exists public.lottery_draws (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events(id) on delete cascade,
  title           text not null,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists lottery_draws_event_idx
  on public.lottery_draws (event_id, created_at desc);

create table if not exists public.lottery_participants (
  id              uuid primary key default gen_random_uuid(),
  draw_id         uuid not null references public.lottery_draws(id) on delete cascade,
  email           text not null,
  created_at      timestamptz not null default now(),
  unique (draw_id, email)
);

create index if not exists lottery_participants_draw_idx
  on public.lottery_participants (draw_id, email);

create table if not exists public.lottery_prizes (
  id              uuid primary key default gen_random_uuid(),
  draw_id         uuid not null references public.lottery_draws(id) on delete cascade,
  name            text not null,
  winner_count    integer not null check (winner_count > 0),
  order_index     integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists lottery_prizes_draw_idx
  on public.lottery_prizes (draw_id, order_index, created_at);

create table if not exists public.lottery_winners (
  id              uuid primary key default gen_random_uuid(),
  draw_id         uuid not null references public.lottery_draws(id) on delete cascade,
  prize_id        uuid not null references public.lottery_prizes(id) on delete cascade,
  email           text not null,
  position        integer not null,
  drawn_by        uuid references auth.users(id) on delete set null,
  drawn_at        timestamptz not null default now(),
  unique (draw_id, email),
  unique (prize_id, position)
);

create index if not exists lottery_winners_draw_idx
  on public.lottery_winners (draw_id, drawn_at desc);
create index if not exists lottery_winners_prize_idx
  on public.lottery_winners (prize_id, position);

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
    select unnest(array['lottery_draws','lottery_prizes'])
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.tg_set_updated_at()',
      t
    );
  end loop;
end $$;

alter table public.lottery_draws        enable row level security;
alter table public.lottery_participants enable row level security;
alter table public.lottery_prizes       enable row level security;
alter table public.lottery_winners      enable row level security;

drop policy if exists lottery_draws_admin_all on public.lottery_draws;
create policy lottery_draws_admin_all on public.lottery_draws
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists lottery_participants_admin_all on public.lottery_participants;
create policy lottery_participants_admin_all on public.lottery_participants
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists lottery_prizes_admin_all on public.lottery_prizes;
create policy lottery_prizes_admin_all on public.lottery_prizes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists lottery_winners_admin_all on public.lottery_winners;
create policy lottery_winners_admin_all on public.lottery_winners
  for all using (public.is_admin()) with check (public.is_admin());
