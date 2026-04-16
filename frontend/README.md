# Frontend Setup

This frontend supports two execution paths:

- live mode: sends customer queries to an n8n webhook
- fallback mode: uses local demo logic if no webhook is configured or if the webhook fails

## Configure the Webhook

Create a local env file:

```bash
cp .env.example .env
```

Set the webhook URL:

```bash
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/agentic-customer-support
```

## Run

```bash
npm install
npm run dev
```

## Notes

- The support console labels each response as `n8n`, `fallback`, or `demo`.
- Styling is provided directly through `src/index.css`, so the UI does not depend on a working Tailwind build pipeline.
