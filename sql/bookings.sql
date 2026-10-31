-- Phase 2 of the agent-tools upgrade: client bookings, which feed the
-- "Needs attention" panel on the portal dashboard (payments due, departures,
-- passport and insurance checks).
--
-- Not to be confused with public.trips, which holds the group trips agents
-- advertise on their public page. A booking is a client's actual reservation.

create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  agent_id            uuid not null references public.agents(id)  on delete cascade,
  client_id           uuid          references public.clients(id) on delete set null,
  -- Other clients travelling on this booking (same pattern as quotes.additional_guest_ids).
  traveler_ids        uuid[] not null default '{}',
  quote_id            uuid          references public.quotes(id)  on delete set null,

  trip_type           text not null default 'cruise'
                      check (trip_type in ('cruise', 'tour', 'theme_park', 'resort', 'other')),
  supplier            text,   -- cruise line / tour company / resort brand
  product             text,   -- ship / tour name / property
  title               text,
  confirmation_number text,

  depart_date         date,
  return_date         date,

  status              text not null default 'booked'
                      check (status in ('hold', 'booked', 'paid_in_full', 'completed', 'cancelled')),
  total_price         numeric(10,2) check (total_price >= 0),
  amount_paid         numeric(10,2) not null default 0 check (amount_paid >= 0),
  deposit_due         date,   -- for courtesy holds: when the hold lapses without a deposit
  final_payment_due   date,

  insurance_status    text not null default 'unknown'
                      check (insurance_status in ('unknown', 'offered', 'purchased', 'declined')),

  commission_amount   numeric(10,2) check (commission_amount >= 0),
  commission_received boolean not null default false,

  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  check (return_date is null or depart_date is null or return_date >= depart_date)
);

grant select, insert, update, delete on public.bookings to authenticated, service_role;
-- This project's default privileges also hand new tables to anon; take that back.
revoke all on public.bookings from anon;
revoke truncate, references, trigger on public.bookings from authenticated, service_role;

create index if not exists bookings_agent_depart_idx on public.bookings (agent_id, depart_date);
create index if not exists bookings_client_id_idx    on public.bookings (client_id);
create index if not exists bookings_quote_id_idx     on public.bookings (quote_id);

alter table public.bookings enable row level security;

create policy bookings_owner_all on public.bookings
  for all to authenticated
  using (agent_id = (select public.current_agent_id()))
  with check (
    agent_id = (select public.current_agent_id())
    and (client_id is null or exists (
      select 1 from public.clients c
      where c.id = client_id and c.agent_id = (select public.current_agent_id())
    ))
  );
