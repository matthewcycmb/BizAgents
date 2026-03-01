create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  email text not null,
  phone text,
  service_type text,
  budget text,
  timeline text,
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for business lookup
create index idx_leads_business_id on public.leads(business_id);

-- Unique constraint for deduplication
create unique index idx_leads_email_business on public.leads(email, business_id);
