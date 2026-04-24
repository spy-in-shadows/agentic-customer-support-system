# Vector RAG Upgrade

This document starts the full vector-database RAG version of the project. It does not replace the current working workflow yet. Instead, it adds the data model, ingestion script, and deployment plan for semantic retrieval.

## Goal

Upgrade the current lightweight retrieval layer into a true embedding-based retrieval system:

1. embed support knowledge documents
2. store them in a vector database
3. retrieve semantically similar documents for each user query
4. pass only retrieved context to the grounded responder

## Recommended Stack

- Embeddings provider: OpenAI embeddings API
- Vector database: Supabase with pgvector
- Orchestration: n8n
- Grounded generation: Groq chat completion model

## Files Added

- [supabase_schema.sql](/Users/krishnaverma/Desktop/agentic-customer-support-system/vector_rag/supabase_schema.sql)
- [faq_documents.jsonl](/Users/krishnaverma/Desktop/agentic-customer-support-system/vector_rag/faq_documents.jsonl)
- [ingest_vector_kb.mjs](/Users/krishnaverma/Desktop/agentic-customer-support-system/scripts/ingest_vector_kb.mjs)

The current repo keeps the vector bootstrap files synced with [faq.csv](/Users/krishnaverma/Desktop/agentic-customer-support-system/data/faq.csv), which now contains 210 FAQ entries across account, billing, technical, and general support categories.

## Step 1: Create the Vector Table

Run the SQL in your Supabase SQL editor:

- [supabase_schema.sql](/Users/krishnaverma/Desktop/agentic-customer-support-system/vector_rag/supabase_schema.sql)

This creates:
- `support_knowledge`
- `match_support_knowledge(...)`
- an IVF flat vector index

## Step 2: Configure Ingestion Environment Variables

Set these before running the ingestion script:

```bash
export OPENAI_API_KEY="your_openai_key"
export OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

## Step 3: Ingest FAQ Data

Run:

```bash
node scripts/ingest_vector_kb.mjs
```

This script:
- reads [faq.csv](/Users/krishnaverma/Desktop/agentic-customer-support-system/data/faq.csv)
- converts each row into a support document
- generates embeddings
- upserts documents into Supabase

## Step 4: Update the n8n Workflow

After ingestion, replace the current lightweight retrieval node with this vector flow:

1. Embed the customer query
2. Call Supabase RPC `match_support_knowledge`
3. Format retrieved documents into context
4. Send retrieved context into the grounded Groq responder

## Suggested n8n Node Sequence

```text
Webhook
  -> Normalize Input
  -> Intake Classifier Agent
  -> Sentiment Analyzer Agent
  -> Wait For Both Agents
  -> Merge Agent Results
  -> Query Embedding Generator
  -> Supabase Vector Search
  -> Build Retrieval Context
  -> Grounded FAQ Responder
  -> Merge RAG Result
  -> Escalation Logic
  -> Should Escalate?
```

## Why This Is Better Than Keyword FAQ Matching

- matches semantically similar questions
- scales to larger support knowledge bases
- supports paraphrased or natural customer wording
- keeps answers grounded in retrieved documents

## Presentation Positioning

You can describe the current repo state like this:

- working demo path: lightweight RAG with in-workflow retrieval
- advanced upgrade path: full vector-database RAG with embeddings and pgvector

That is accurate and technically honest.
