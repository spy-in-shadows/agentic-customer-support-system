# Architecture Overview

## Goal

The system automates first-contact customer support by combining multiple specialized AI agents under a shared orchestration layer. Each agent performs one focused responsibility so the workflow remains modular, explainable, and easier to tune.

## High-Level Flow

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
         Logging + Analytics Dashboard
```

## Components

### 1. Webhook Intake Layer

Receives support queries from external channels such as:
- website chat widget
- email parser
- CRM form submission
- WhatsApp or messaging integrations

Responsibilities:
- validate request payload
- attach metadata like channel and timestamp
- pass normalized input into the orchestration layer

### 2. Intake Classifier Agent

Purpose:
- determine the primary support category
- estimate urgency

Typical outputs:
- `category`: billing, technical, account, general
- `urgency`: low, medium, high
- `reason`: short explanation for downstream agents

This agent should be optimized for structured outputs rather than long-form text.

### 3. Sentiment Analyzer Agent

Purpose:
- identify whether the customer tone is positive, neutral, or negative
- detect signals of frustration, anger, confusion, or urgency

Typical outputs:
- `sentiment`: positive, neutral, negative
- `risk_flag`: true or false
- `confidence`: model confidence estimate

Negative sentiment does not always require escalation, but it should influence routing rules.

### 4. Retrieval Layer

Purpose:
- retrieve the most relevant support knowledge for the incoming query
- narrow the context before answer generation

In this project, retrieval is implemented as a lightweight in-workflow knowledge search over support documents. The top-scoring documents are passed into the grounded responder.

Typical outputs:
- `retrieval_context`
- `retrieval_top_score`
- `retrieval_has_candidate`

### 5. Grounded FAQ Responder Agent

Purpose:
- answer repetitive, low-risk queries only from retrieved support knowledge

FAQ resolution is appropriate when:
- the retriever finds relevant context
- the grounded responder confirms the context safely answers the query
- the issue is not sensitive or high urgency
- no policy exception is triggered

This agent returns:
- the response text
- the matched FAQ identifier
- confidence score
- rationale for grounded matching

### 6. Escalation Handler Agent

Purpose:
- route unresolved or risky cases to a human support queue

Escalation conditions may include:
- negative sentiment
- high urgency
- failed FAQ match
- repeated customer complaint
- refund, account lockout, or payment dispute

Outputs:
- human-readable ticket summary
- recommended queue or department
- escalation priority
- customer-facing holding response

### 7. Orchestration Layer

The orchestration layer in `n8n` or `Flowise` coordinates all agents and business rules.

Main responsibilities:
- trigger the right agents in sequence or parallel
- merge structured outputs
- decide whether to auto-resolve or escalate
- call external systems such as CRMs, spreadsheets, or ticketing tools
- log results for analytics

## Suggested Decision Logic

Auto-resolve when all conditions are true:
- retrieval returns relevant support context
- grounded FAQ confidence is above threshold
- urgency is not high
- sentiment is not strongly negative
- query does not involve protected or sensitive actions

Escalate when any of these conditions are true:
- no grounded FAQ answer
- sentiment is negative and confidence is high
- urgency is high
- request involves refunds, payment disputes, legal issues, or account compromise

## Data Flow

Input payload:
- customer identifier
- source channel
- raw query
- timestamp

Derived fields:
- topic category
- urgency
- sentiment
- retrieved context
- matched FAQ
- escalation decision
- final response
- ticket identifier

## Human-in-the-Loop Design

Human handoff is essential for:
- emotional or sensitive customer conversations
- unresolved technical failures
- billing or refund disputes
- low-confidence model outputs

The escalation summary should include:
- original customer message
- category and urgency
- sentiment assessment
- suggested next action
- any retrieval or FAQ attempt already made

## Logging and Analytics

Every interaction should be logged with:
- request id
- customer id
- channel
- category
- urgency
- sentiment
- final status
- response time
- escalation flag

These logs power the dashboard metrics described in the README.

## Mapping to Project Milestones

- Milestone 1: role design, prompt design, workflow diagram, FAQ base
- Milestone 2: intake classifier, FAQ responder, webhook input
- Milestone 3: sentiment analyzer, escalation logic, logging
- Milestone 4: dashboard, test coverage, demo and documentation
