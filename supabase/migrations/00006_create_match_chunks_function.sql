-- Similarity search function for RAG retrieval
-- Uses security definer so public chat can query without auth
create or replace function public.match_chunks(
  query_embedding vector(1536),
  match_business_id uuid,
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  content text,
  url text,
  similarity float
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select
    chunks.id,
    chunks.content,
    chunks.url,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from public.chunks
  where chunks.business_id = match_business_id
    and 1 - (chunks.embedding <=> query_embedding) > match_threshold
  order by chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
