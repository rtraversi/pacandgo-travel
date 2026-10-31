-- Deals and trips can be any kind of trip, not just cruises.
-- The line / ship / ports columns keep their names; for non-cruise rows they
-- hold the supplier, the product name and the places visited (see lib/tripTypes.ts).
-- Existing rows become 'cruise'.

alter table public.deals
  add column if not exists trip_type text not null default 'cruise'
  check (trip_type in ('cruise', 'tour', 'theme_park', 'resort', 'other'));

alter table public.trips
  add column if not exists trip_type text not null default 'cruise'
  check (trip_type in ('cruise', 'tour', 'theme_park', 'resort', 'other'));
