# Agentic Customer Support System

Agentic Customer Support System is a multi-agent support workflow that automates first-line customer service across website chat, email, or webhook-based channels. It uses specialized AI agents for intake classification, sentiment analysis, FAQ resolution, and escalation, while keeping a human-in-the-loop for sensitive or unresolved cases.

This repository includes:
- workflow exports for `n8n` and `Flowise`
- a React demo frontend for live walkthroughs
- project architecture, API, prompt, and testing documentation
- sample FAQ and support query datasets
- a lightweight dashboard starter for analytics demos

## Problem Statement

Support teams spend significant time answering repetitive questions while also managing urgent, emotional, or technically complex issues that need human judgment. This project reduces manual load by routing each customer message through a multi-agent pipeline that can:
- classify the query topic and urgency
- detect customer sentiment
- answer common questions from a knowledge base
- escalate high-risk or unresolved cases to a human agent
- log each interaction for monitoring and analytics

## Core Features

- Intake classifier agent for topic and urgency detection
- FAQ responder agent powered by a knowledge base
- Sentiment analyzer agent for mood detection and risk flagging
- Escalation handler agent for human handoff
- Orchestration layer coordinating all agent decisions
- Webhook-based integration for incoming support messages
- Conversation logging for traceability
- Analytics dashboard for response and escalation metrics
- Customizable prompt templates for each agent role
- Full workflow architecture documentation

## Example Workflow

1. A customer sends a support request through a webhook from a chat widget, email connector, or messaging channel.
2. The intake classifier agent categorizes the message by topic and urgency.
3. The sentiment analyzer agent scores the tone as positive, neutral, or negative.
4. The orchestrator checks whether the message can be safely resolved from the FAQ knowledge base.
5. If a confident FAQ match exists, the FAQ responder sends an automated reply.
6. If the issue is complex, high urgency, or strongly negative, the escalation handler creates a ticket and prepares a summary for a human support agent.
7. The system logs the interaction and updates dashboard metrics such as response time, resolution rate, and escalation frequency.

## Agent Roles

### Intake Classifier Agent
- Detects support topic such as billing, technical, account, or general inquiry
- Assigns urgency level such as low, medium, or high
- Provides structured metadata for downstream routing

### Sentiment Analyzer Agent
- Evaluates emotional tone of the message
- Flags frustrated or high-risk conversations
- Increases escalation priority for negative interactions

### FAQ Responder Agent
- Searches the knowledge base for common issues
- Generates direct, concise, policy-safe responses
- Resolves repetitive support queries without human intervention

### Escalation Handler Agent
- Takes over unresolved, sensitive, or high-risk cases
- Creates a human handoff summary with customer context
- Routes the issue to the right support queue or team

### Orchestration Layer
- Coordinates handoffs between specialized agents
- Applies business rules for auto-resolution vs escalation
- Ensures every interaction is logged consistently

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
│   └── test-cases.md
├── flows/
│   ├── flowise-chatflow-export.json
│   └── n8n-workflow-export.json
└── frontend/
    └── src/App.jsx
```

## Tech Stack

- `n8n` / `Flowise` for orchestration and agent chaining
- Prompt engineering for role-specific agent behavior
- Sentiment analysis APIs or LLM-based sentiment classification
- Webhook handling for support query intake
- React + Vite frontend for demo and presentation
- Streamlit-ready Python dashboard starter for analytics

## Milestones

### Milestone 1: Architecture and Agent Design
- Define agent roles and responsibilities
- Design multi-agent orchestration flow
- Set up `n8n` / `Flowise` environment
- Create FAQ knowledge base
- Draft prompt templates
- Document system architecture

### Milestone 2: Core Agents
- Build intake classifier agent
- Implement FAQ responder with KB lookup
- Set up webhook integration
- Connect classifier to FAQ flow in `n8n` / `Flowise`

### Milestone 3: Sentiment and Escalation
- Add sentiment analyzer agent
- Build escalation handler with human handoff
- Connect all agents into full orchestration pipeline
- Add interaction logging and baseline analytics

### Milestone 4: Dashboard, Testing, and Demo
- Build analytics dashboard
- Run end-to-end tests with diverse queries
- Refine prompt templates for consistency
- Finalize architecture documentation and demo walkthrough

## Local Setup

### Frontend Demo

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The Vite app provides:
- a support console connected to n8n when `VITE_N8N_WEBHOOK_URL` is configured
- a webhook payload preview
- a local fallback path when the webhook is unavailable
- sample analytics cards and logs
- a simplified architecture walkthrough for demos

### Dashboard Starter

```bash
python -m venv .venv
source .venv/bin/activate
pip install streamlit pandas
streamlit run dashboard/app.py
```

### Workflow Assets

Import these files into your tools:
- `flows/n8n-workflow-export.json`
- `flows/flowise-chatflow-export.json`

For the exported n8n workflow:
- set `GROQ_API_KEY` in your n8n environment before enabling the classifier and sentiment nodes
- replace the placeholder Google Sheet id before enabling conversation logging

## Documentation

- [Architecture](./docs/architecture.md)
- [Prompt Templates](./docs/prompts.md)
- [API Specification](./docs/api-spec.md)
- [Test Cases](./docs/test-cases.md)

## Analytics Tracked

The dashboard and logs are designed to track:
- average response time
- FAQ auto-resolution rate
- escalation frequency
- sentiment distribution
- category-wise support volume
- unresolved vs resolved ratio

## Limitations and Ethical Considerations

- Automated responses must be clearly represented as AI-generated when appropriate.
- Sensitive, emotional, or ambiguous issues should be escalated rather than over-automated.
- Customer data should be stored securely and handled under privacy-compliant practices.
- Classification and sentiment models may introduce bias and require periodic review.
- Human oversight is required to validate escalations and final outcomes.

## Submission Checklist

- GitHub repository link
- Deployment link for frontend or dashboard
- Workflow exports included
- Architecture and prompt documentation included
- Demo-ready sample data included

## Project Status

- Status: Good to go
- Reviewed by: Ankur

## Team

- Krishna Verma
- Sambuddha Banerjee
- Aniruddha Dwivedi
- Atharv Bind

## Deployment

Add your final links here before submission:
- GitHub: `https://github.com/spy-in-shadows/agentic-customer-support-system`
- Frontend deployment: `https://<your-demo-url>`
- Dashboard deployment: `https://<your-dashboard-url>`

## License

This repository is intended for academic, demo, and portfolio use.
