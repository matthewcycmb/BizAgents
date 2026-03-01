create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  content text not null,
  embedding vector(1536),
  url text not null,
  token_count integer not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- HNSW index for fast similarity search (works on empty tables unlike IVFFlat)
create index idx_chunks_embedding on public.chunks
  using hnsw (embedding vector_cosine_ops);

-- Index for business lookup
create index idx_chunks_business_id on public.chunks(business_id);
