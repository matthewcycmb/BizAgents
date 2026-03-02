-- Change match_chunks from SECURITY DEFINER to SECURITY INVOKER.
-- Edge Functions call this via service_role which bypasses RLS anyway,
-- so this is functionally equivalent but removes the privilege escalation risk.
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
security invoker
set search_path = public, extensions
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
