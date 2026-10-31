-- Phase 1 of the agent-tools upgrade: richer client profiles.
-- Applied to project rmwxyqpxonozhnfzoplt on 2026-10-31.
--
-- clients gains profile fields, loyalty becomes a list (one entry per program),
-- dob becomes a real date, and wishlist items get their own table so offers can
-- be matched against them later.
--
-- The old loyalty_number column is kept for now so the live site keeps working
-- until the new code is deployed. Drop it in a later migration.

-- ── clients: new profile fields ─────────────────────────────────────────────
alter table public.clients
  add column if not exists preferred_name          text,
  add column if not exists citizenship             text,
  add column if not exists passport_expiry         date,
  add column if not exists anniversary             date,
  add column if not exists emergency_contact_name  text,
  add column if not exists emergency_contact_phone text,
  add column if not exists loyalty     jsonb  not null default '[]'::jsonb,
  add column if not exists preferences jsonb  not null default '{}'::jsonb,
  add column if not exists tags        text[] not null default '{}',
  add column if not exists updated_at  timestamptz not null default now();

alter table public.clients
  add constraint clients_loyalty_is_array    check (jsonb_typeof(loyalty) = 'array'),
  add constraint clients_preferences_is_obj  check (jsonb_typeof(preferences) = 'object');

-- dob was free text (MM/DD/YYYY). Convert to a real date; anything unparseable
-- becomes null (all existing rows were clean MM/DD/YYYY when this ran).
alter table public.clients
  alter column dob type date using (
    case
      when dob ~ '^\d{1,2}/\d{1,2}/\d{4}$' then to_date(dob, 'MM/DD/YYYY')
      when dob ~ '^\d{4}-\d{2}-\d{2}$'     then dob::date
      else null
    end
  );

-- Carry the single loyalty number into the new list. The old form labelled it
-- "Loyalty / Crown & Anchor #", so that's the program it was used for.
update public.clients
set loyalty = jsonb_build_array(jsonb_build_object(
      'program', 'Royal Caribbean Crown & Anchor',
      'number',  loyalty_number))
where loyalty_number is not null
  and loyalty_number <> ''
  and loyalty = '[]'::jsonb;

-- Passport-expiry checks on the dashboard will filter on this.
create index if not exists clients_passport_expiry_idx
  on public.clients (agent_id, passport_expiry)
  where passport_expiry is not null;

-- ── client_wishes: what each client wants to do some day ─────────────────────
create table if not exists public.client_wishes (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null references public.agents(id)  on delete cascade,
  client_id   uuid not null references public.clients(id) on delete cascade,
  destination text not null,
  trip_type   text,          -- ocean cruise, river cruise, tour, resort, ...
  timeframe   text,          -- free text: "summer 2027", "after retirement"
  budget      text,
  notes       text,
  status      text not null default 'open'
              check (status in ('open', 'booked', 'dropped')),
  created_at  timestamptz not null default now()
);

grant select, insert, update, delete on public.client_wishes to authenticated, service_role;
-- This project's default privileges still hand new tables to anon (with TRUNCATE etc.),
-- so strip anything beyond the grant above. Applied as a follow-up migration
-- (client_wishes_tighten_grants) on the live project.
revoke all on public.client_wishes from anon;
revoke truncate, references, trigger on public.client_wishes from authenticated, service_role;

create index if not exists client_wishes_client_id_idx on public.client_wishes (client_id);
create index if not exists client_wishes_agent_open_idx
  on public.client_wishes (agent_id) where status = 'open';

alter table public.client_wishes enable row level security;

-- Same ownership rule as clients, plus: the client must also be yours.
create policy client_wishes_owner_all on public.client_wishes
  for all to authenticated
  using (agent_id = (select public.current_agent_id()))
  with check (
    agent_id = (select public.current_agent_id())
    and exists (
      select 1 from public.clients c
      where c.id = client_id and c.agent_id = (select public.current_agent_id())
    )
  );
