# API Specification

This document defines the recommended webhook contract for support intake and the normalized response shape used inside the agentic pipeline.

## 1. Incoming Webhook

### Endpoint

```text
POST /webhook/agentic-customer-support
```

### Content Type

```text
application/json
```

### Request Body

```json
{
  "customer_id": "cust_001",
  "channel": "website_chat",
  "query": "I was charged twice for my subscription and I need help immediately.",
  "timestamp": "2026-04-15T10:30:00Z"
}
```

### Required Fields

- `customer_id`: unique customer reference
- `channel`: source of the message such as `website_chat`, `email`, or `whatsapp`
- `query`: raw customer message

### Optional Fields

- `timestamp`: event time from upstream system
- `conversation_id`: thread identifier
- `customer_email`: if available
- `metadata`: custom upstream fields

## 2. Normalized Internal Payload

After intake validation, the orchestration layer can enrich the message into a shared payload:

```json
{
  "request_id": "REQ-1001",
  "customer_id": "cust_001",
  "channel": "website_chat",
  "customer_query": "I was charged twice for my subscription and I need help immediately.",
  "classifier": {
    "category": "billing",
    "urgency": "high",
    "summary": "Duplicate billing charge with urgent assistance request."
  },
  "sentiment": {
    "sentiment": "negative",
    "risk_flag": true,
    "reason": "Customer expresses urgency and frustration about billing."
  },
  "faq": {
    "matched": false,
    "faq_id": "",
    "answer": ""
  },
  "decision": {
    "final_action": "escalate",
    "rationale": "High urgency billing dispute without safe FAQ resolution."
  }
}
```

## 3. Successful FAQ Response

```json
{
  "status": "resolved_by_faq",
  "request_id": "REQ-1002",
  "category": "account",
  "urgency": "low",
  "sentiment": "neutral",
  "matched_faq": true,
  "faq_id": "FAQ-001",
  "escalated": false,
  "ticket_id": "",
  "message": "Click on \"Forgot Password\" on the login page and follow the reset instructions sent to your email."
}
```

## 4. Escalation Response

```json
{
  "status": "escalated_to_human",
  "request_id": "REQ-1003",
  "category": "billing",
  "urgency": "high",
  "sentiment": "negative",
  "matched_faq": false,
  "faq_id": "",
  "escalated": true,
  "ticket_id": "TICK-784512",
  "message": "Your request has been escalated to a human support agent. Ticket ID: TICK-784512. Our team will review it shortly."
}
```

## 5. Suggested Status Codes

- `200`: request accepted and resolved
- `400`: invalid request payload
- `500`: workflow or downstream agent failure

## 6. Logging Schema

Each processed interaction should capture:

```json
{
  "request_id": "REQ-1001",
  "customer_id": "cust_001",
  "channel": "website_chat",
  "category": "billing",
  "urgency": "high",
  "sentiment": "negative",
  "status": "escalated",
  "response_time_seconds": 12,
  "matched_faq": false,
  "ticket_id": "TICK-784512"
}
```

## 7. Security Recommendations

- authenticate webhook calls where possible
- avoid logging unnecessary sensitive customer data
- redact payment, account, or personally identifiable information in long-term storage
- restrict dashboard access to authorized users only
