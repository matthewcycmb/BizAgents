-- Conversations table for chat history
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chat messages within conversations
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_conversations_owner on public.conversations(owner_id);
create index idx_conversations_business on public.conversations(business_id);
create index idx_chat_messages_conversation on public.chat_messages(conversation_id);

-- RLS
alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Owner can CRUD their own conversations
create policy "Owner can select own conversations"
  on public.conversations for select
  using (auth.uid() = owner_id);

create policy "Owner can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = owner_id);

create policy "Owner can update own conversations"
  on public.conversations for update
  using (auth.uid() = owner_id);

create policy "Owner can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = owner_id);

-- Owner can CRUD messages in their own conversations
create policy "Owner can select own chat messages"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = chat_messages.conversation_id
        and conversations.owner_id = auth.uid()
    )
  );

create policy "Owner can insert own chat messages"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = chat_messages.conversation_id
        and conversations.owner_id = auth.uid()
    )
  );

create policy "Owner can delete own chat messages"
  on public.chat_messages for delete
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = chat_messages.conversation_id
        and conversations.owner_id = auth.uid()
    )
  );
