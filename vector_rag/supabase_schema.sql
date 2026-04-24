create extension if not exists vector;

create table if not exists public.support_knowledge (
  id text primary key,
  category text not null,
  question text not null,
  answer text not null,
  content text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.match_support_knowledge (
  query_embedding vector(1536),
  match_count int default 3,
  category_filter text default null
)
returns table (
  id text,
  category text,
  question text,
  answer text,
  content text,
  similarity float
)
language sql
as $$
  select
    support_knowledge.id,
    support_knowledge.category,
    support_knowledge.question,
    support_knowledge.answer,
    support_knowledge.content,
    1 - (support_knowledge.embedding <=> query_embedding) as similarity
  from public.support_knowledge
  where category_filter is null or support_knowledge.category = category_filter
  order by support_knowledge.embedding <=> query_embedding
  limit match_count;
$$;

create index if not exists support_knowledge_embedding_idx
on public.support_knowledge
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
