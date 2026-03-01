-- Enable RLS on all tables
alter table public.businesses enable row level security;
alter table public.chunks enable row level security;
alter table public.leads enable row level security;

-- Businesses: owner can CRUD their own
create policy "Owner can select own businesses"
  on public.businesses for select
  using (auth.uid() = owner_id);

create policy "Owner can insert own businesses"
  on public.businesses for insert
  with check (auth.uid() = owner_id);

create policy "Owner can update own businesses"
  on public.businesses for update
  using (auth.uid() = owner_id);

create policy "Owner can delete own businesses"
  on public.businesses for delete
  using (auth.uid() = owner_id);

-- Chunks: owner can SELECT via business ownership; service_role handles INSERT
create policy "Owner can select chunks for own businesses"
  on public.chunks for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = chunks.business_id
        and businesses.owner_id = auth.uid()
    )
  );

-- Leads: owner can SELECT/UPDATE via business ownership; service_role handles INSERT
create policy "Owner can select leads for own businesses"
  on public.leads for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = leads.business_id
        and businesses.owner_id = auth.uid()
    )
  );

create policy "Owner can update leads for own businesses"
  on public.leads for update
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = leads.business_id
        and businesses.owner_id = auth.uid()
    )
  );
