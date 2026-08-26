-- Website inquiries captured from the intake form and the per-agent contact forms.
-- Every submission is recorded here BEFORE the email is attempted, so a lead is
-- never lost when mail delivery fails (which is exactly how the Kristen Brown
-- reports went unnoticed under the old client-side EmailJS setup).

create table if not exists public.inquiries (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),

  agent_id       uuid references public.agents(id) on delete set null,
  agent_slug     text not null,
  recipient_email text not null,

  name           text not null,
  email          text not null,
  phone          text,
  travelers      text,
  destination    text,
  travel_date    text,
  budget         text,
  message        text,

  source         text not null default 'intake',   -- 'intake' | 'agent_page'
  email_status   text not null default 'pending',  -- 'pending' | 'sent' | 'failed'
  email_error    text,
  provider_id    text
);

create index if not exists inquiries_agent_id_created_at_idx
  on public.inquiries (agent_id, created_at desc);

create index if not exists inquiries_email_status_idx
  on public.inquiries (email_status) where email_status <> 'sent';

alter table public.inquiries enable row level security;

-- No anon/authenticated INSERT policy on purpose: writes only ever happen through
-- the server action using the service-role key, which bypasses RLS. That keeps the
-- table from becoming a public write target.

drop policy if exists "Agents read their own inquiries" on public.inquiries;
create policy "Agents read their own inquiries"
  on public.inquiries for select
  to authenticated
  using (agent_id in (select id from public.agents where user_id = auth.uid()));

drop policy if exists "Admin reads all inquiries" on public.inquiries;
create policy "Admin reads all inquiries"
  on public.inquiries for select
  to authenticated
  using (auth.uid() = '552d2159-35e8-440f-b1f5-cd649ff16885');
