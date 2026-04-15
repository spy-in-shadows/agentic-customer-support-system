# Test Cases

Use these scenarios for milestone demos, end-to-end validation, and prompt tuning.

## Expected Behaviors

### 1. Password Reset

- Input: `How do I reset my password?`
- Expected category: `account`
- Expected sentiment: `neutral`
- Expected outcome: FAQ auto-resolution

### 2. Student Discount

- Input: `Do you offer student discounts?`
- Expected category: `general`
- Expected sentiment: `neutral`
- Expected outcome: FAQ auto-resolution

### 3. Duplicate Charge Complaint

- Input: `I was charged twice for my subscription and I am very frustrated.`
- Expected category: `billing`
- Expected urgency: `high`
- Expected sentiment: `negative`
- Expected outcome: escalation to human

### 4. App Crash

- Input: `Your app keeps crashing when I upload a file.`
- Expected category: `technical`
- Expected sentiment: `negative` or `neutral`
- Expected outcome: escalation to human

### 5. Cancellation Request

- Input: `How can I cancel my subscription?`
- Expected category: `billing`
- Expected sentiment: `neutral`
- Expected outcome: FAQ auto-resolution

### 6. Angry Account Access Issue

- Input: `This is unacceptable. I still cannot log in to my account.`
- Expected category: `account`
- Expected urgency: `medium` or `high`
- Expected sentiment: `negative`
- Expected outcome: escalation to human

## Validation Checklist

- Classifier returns valid structured output
- Sentiment analyzer flags emotionally risky cases
- FAQ responder does not hallucinate unsupported answers
- Escalation handler produces a concise human-readable summary
- Webhook payload is accepted and normalized correctly
- Logs are written for every request
- Dashboard metrics update with new interactions

## Demo Flow Recommendation

For the final presentation, run at least one case from each of these groups:
- easy FAQ resolution
- negative sentiment escalation
- technical issue escalation
- billing issue escalation

This makes the agent handoff logic visible to reviewers.
