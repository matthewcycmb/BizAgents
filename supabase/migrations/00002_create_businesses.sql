create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  url text not null,
  scrape_status text not null default 'pending' check (scrape_status in ('pending', 'scraping', 'completed', 'failed')),
  pages_scraped integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for owner lookup
create index idx_businesses_owner_id on public.businesses(owner_id);
