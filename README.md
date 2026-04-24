# Agentic Customer Support System

An AI-assisted customer support workflow that classifies incoming requests, analyzes sentiment, retrieves grounded support knowledge, and routes unresolved or high-risk issues to a human escalation path.

The system combines a React frontend, an `n8n` orchestration workflow, retrieval-augmented response generation, Google Sheets logging, and optional vector-RAG scaffolding for semantic search upgrades.

## Overview

This repository is designed around a practical support operations use case:

- accept customer queries from a webhook-powered interface
- classify topic and urgency
- analyze customer sentiment
- retrieve relevant support knowledge
- generate grounded FAQ-style responses when safe
- escalate unresolved or sensitive cases with structured context
- log interactions for reporting and analytics

The result is a modular support pipeline that is easier to audit, tune, and extend than a single general-purpose chatbot.

## Key Capabilities

- Multi-agent workflow for classification, sentiment analysis, retrieval, response generation, and escalation
- Webhook-based intake for website chat or other external systems
- Grounded response generation using retrieved support knowledge
- Human-in-the-loop escalation path with ticket generation
- Google Sheets conversation logging
- React demo UI connected to the live workflow
- CSV-backed FAQ knowledge base with 210 support entries
- Vector-RAG scaffold for future embeddings-based retrieval

## Architecture

```text
Customer Query
    |
    v
Webhook Intake
    |
    v
Intake Classifier ---------> Sentiment Analyzer
    |                            |
    +------------+---------------+
                 |
                 v
      Knowledge Retrieval
             |
             v
     Grounded FAQ Responder
             |
             v
      Orchestration Decision
        /                \
       /                  \
      v                    v
 FAQ Response       Escalation Handler
         |                    |
         +----------+---------+
                    |
                    v
         Logging + Analytics
```

Additional architecture details are documented in [docs/architecture.md](/Users/krishnaverma/Desktop/agentic-customer-support-system/docs/architecture.md).

## Workflow Summary

1. A customer submits a support query through the frontend or any webhook-compatible source.
2. The `Webhook` and `Normalize Input` nodes standardize the payload.
3. The intake classifier assigns a category and urgency.
4. The sentiment analyzer labels the interaction as positive, neutral, or negative.
5. The retrieval layer selects the most relevant support knowledge from the FAQ corpus.
6. The grounded responder generates a structured answer only from the retrieved context.
7. Escalation logic decides whether the query is safe to auto-resolve or should be routed to a human.
8. The workflow returns a customer-facing response and logs the interaction.

## Repository Structure

```text
.
├── dashboard/
│   └── app.py
├── data/
│   ├── faq.csv
│   └── sample_queries.json
├── docs/
│   ├── api-spec.md
│   ├── architecture.md
│   ├── prompts.md
│   ├── test-cases.md
│   └── vector-rag.md
├── flows/
│   ├── flowise-chatflow-export.json
│   └── n8n-workflow-export.json
├── frontend/
│   ├── src/
│   └── .env.example
├── scripts/
│   └── ingest_vector_kb.mjs
└── vector_rag/
    ├── faq_documents.jsonl
    └── supabase_schema.sql
```

## Stack

- `n8n` for orchestration
- Groq API for classification, sentiment analysis, and grounded response generation
- React + Vite for the support console
- Google Sheets for conversation logging
- CSV knowledge base for lightweight retrieval
- Supabase + embeddings scaffold for vector-RAG expansion

## Getting Started

### 1. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend reads `VITE_N8N_WEBHOOK_URL` and sends customer queries to the configured workflow endpoint.

### 2. n8n Workflow

Import:

- [flows/n8n-workflow-export.json](/Users/krishnaverma/Desktop/agentic-customer-support-system/flows/n8n-workflow-export.json)
- [flows/flowise-chatflow-export.json](/Users/krishnaverma/Desktop/agentic-customer-support-system/flows/flowise-chatflow-export.json)

For the n8n workflow:

- the retrieval corpus in `Retrieve Support Knowledge` is aligned with [data/faq.csv](/Users/krishnaverma/Desktop/agentic-customer-support-system/data/faq.csv)
- on n8n Cloud, create a variable named `GROQ_API_KEY` and reference it as `{{$vars.GROQ_API_KEY}}`
- on self-hosted n8n, provide `GROQ_API_KEY` through the runtime environment
- reconnect Google Sheets credentials before enabling logging

### 3. Dashboard

```bash
python -m venv .venv
source .venv/bin/activate
pip install streamlit pandas
streamlit run dashboard/app.py
```

## Deployment

### Active Backend

The current live webhook backend is:

```text
https://spy-in-shadows.app.n8n.cloud/webhook/agentic-customer-support
```

### Frontend Deployment

Deploy the `frontend/` directory to Netlify or Vercel and set:

```env
VITE_N8N_WEBHOOK_URL=https://spy-in-shadows.app.n8n.cloud/webhook/agentic-customer-support
```

### n8n Cloud Variables

In n8n Cloud, add:

- `GROQ_API_KEY`

Then reference it in HTTP nodes using:

```text
Bearer {{$vars.GROQ_API_KEY}}
```

## Data and Retrieval

The system currently uses a lightweight retrieval layer driven by the support corpus in [data/faq.csv](/Users/krishnaverma/Desktop/agentic-customer-support-system/data/faq.csv), which contains 210 curated FAQ entries across:

- account
- billing
- technical
- general

For a more advanced semantic retrieval setup, see [docs/vector-rag.md](/Users/krishnaverma/Desktop/agentic-customer-support-system/docs/vector-rag.md).

## Documentation

- [Architecture](/Users/krishnaverma/Desktop/agentic-customer-support-system/docs/architecture.md)
- [Prompt Templates](/Users/krishnaverma/Desktop/agentic-customer-support-system/docs/prompts.md)
- [API Specification](/Users/krishnaverma/Desktop/agentic-customer-support-system/docs/api-spec.md)
- [Test Cases](/Users/krishnaverma/Desktop/agentic-customer-support-system/docs/test-cases.md)
- [Vector RAG Upgrade](/Users/krishnaverma/Desktop/agentic-customer-support-system/docs/vector-rag.md)

## Operational Notes

- Auto-resolution should be limited to low-risk, well-grounded support questions.
- Escalation is the preferred path for billing disputes, emotionally charged interactions, fraud concerns, and low-confidence retrieval outcomes.
- Secrets should be stored in platform variables or credentials, not hardcoded in workflow nodes.
- Logging should be reviewed periodically to monitor failure modes, escalation rates, and coverage gaps in the support corpus.

## Team

- [Krishna Verma](https://github.com/spy-in-shadows)
- [Sambuddha Banerjee](https://github.com/SammyBanner45)
- [Aniruddha Dwivedi](https://github.com/Aniruddhadwivedi07)
- [Atharv Bind](https://github.com/atharvbind)

## Links

- Repository: [spy-in-shadows/agentic-customer-support-system](https://github.com/spy-in-shadows/agentic-customer-support-system)
- Backend webhook: [spy-in-shadows.app.n8n.cloud](https://spy-in-shadows.app.n8n.cloud/webhook/agentic-customer-support)

## License

This repository is intended for demo, portfolio, and reference use unless otherwise specified.
