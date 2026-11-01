-- Agent page hero: optional custom background image.
--
-- When hero_url is null the agent page uses the same beach background as the
-- home page. The agent's photo now shows as a circle next to their name
-- instead of being stretched across the hero.
--
-- Existing table, so the existing Data API grants on agent_profiles cover the
-- new column; no new grants needed.

alter table public.agent_profiles
  add column if not exists hero_url text;
