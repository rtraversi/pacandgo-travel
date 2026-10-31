-- Inquiries where the visitor chose "any agent" go by email to the house inbox
-- (pacandgopatty@gmail.com, see lib/agentEmails.ts). From 2026-10-31 they are also
-- attached to the house agent so they appear in her portal, not only the admin view.
-- agent_slug stays 'any' so they still read as general inquiries.
-- One-off backfill of rows created before that change (applied 2026-10-31):
update public.inquiries
set agent_id = (select id from public.agents where slug = 'patty')
where agent_slug = 'any' and agent_id is null;
