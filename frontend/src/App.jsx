import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Clock3,
  SmilePlus,
  MessageSquareMore,
  PlugZap,
} from "lucide-react";

const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL?.trim() || "";

const starterMessages = [
  {
    id: 1,
    role: "assistant",
    text: webhookUrl
      ? "Hi! I’m your AI support assistant. This chat is connected to the configured n8n webhook."
      : "Hi! I’m your AI support assistant. No webhook is configured yet, so this demo is using local fallback logic.",
    meta: null,
  },
];

const sampleLogs = [
  { id: "REQ-1001", category: "billing", sentiment: "negative", status: "escalated", responseTime: "14s", source: "demo" },
  { id: "REQ-1002", category: "account", sentiment: "neutral", status: "resolved", responseTime: "5s", source: "demo" },
  { id: "REQ-1003", category: "technical", sentiment: "negative", status: "escalated", responseTime: "18s", source: "demo" },
  { id: "REQ-1004", category: "general", sentiment: "positive", status: "resolved", responseTime: "4s", source: "demo" },
  { id: "REQ-1005", category: "billing", sentiment: "neutral", status: "resolved", responseTime: "7s", source: "demo" },
];

function classifyLocally(query) {
  const q = query.toLowerCase();
  let category = "general";
  let urgency = "low";
  let sentiment = "neutral";
  let matchedFaq = false;
  let answer = "Thanks for reaching out. Our support team will look into this.";
  let status = "resolved_by_faq";

  if (["bill", "charged", "refund", "invoice", "payment", "subscription"].some((keyword) => q.includes(keyword))) {
    category = "billing";
  } else if (["password", "login", "account", "email", "profile"].some((keyword) => q.includes(keyword))) {
    category = "account";
  } else if (["crash", "error", "bug", "not loading", "slow", "upload", "down"].some((keyword) => q.includes(keyword))) {
    category = "technical";
  }

  if (["urgent", "immediately", "asap", "charged twice", "frustrated", "angry", "terrible", "unacceptable"].some((keyword) => q.includes(keyword))) {
    urgency = "high";
  } else if (["issue", "problem", "help"].some((keyword) => q.includes(keyword))) {
    urgency = "medium";
  }

  if (["frustrated", "angry", "terrible", "bad", "worst", "unacceptable", "upset"].some((keyword) => q.includes(keyword))) {
    sentiment = "negative";
  } else if (["thanks", "great", "awesome", "love"].some((keyword) => q.includes(keyword))) {
    sentiment = "positive";
  }

  if (q.includes("reset") && q.includes("password")) {
    matchedFaq = true;
    answer = 'Click on "Forgot Password" on the login page and follow the instructions sent to your email.';
  } else if (q.includes("student discount")) {
    matchedFaq = true;
    answer = "Yes, we offer student discounts after successful verification.";
  } else if (q.includes("charged twice")) {
    matchedFaq = false;
    answer = "I’m sorry about that. This needs review from a human billing agent.";
  } else if (q.includes("cancel") && q.includes("subscription")) {
    matchedFaq = true;
    answer = "Go to Subscription Settings and click Cancel Subscription.";
  } else if (q.includes("app") && (q.includes("crash") || q.includes("crashing"))) {
    matchedFaq = false;
    answer = "I’m sorry the app is crashing. I’m escalating this to a human support agent.";
  }

  if (!matchedFaq || urgency === "high" || sentiment === "negative") {
    status = "escalated_to_human";
  }

  return {
    request_id: `REQ-${Date.now()}`,
    category,
    urgency,
    sentiment,
    matched_faq: matchedFaq,
    escalated: status === "escalated_to_human",
    status,
    ticket_id: status === "escalated_to_human" ? `TICK-${Date.now()}` : "",
    message:
      status === "escalated_to_human"
        ? `${answer}\n\nYour request has been escalated to a human support agent. Ticket ID: TICK-${Date.now()}.`
        : answer,
    source: "fallback",
  };
}

function Card({ children, className = "" }) {
  return <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm ${className}`}>{children}</div>;
}

function CardHeader({ children }) {
  return <div className="p-5 pb-3">{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}

function Badge({ children, variant = "default" }) {
  const styles =
    variant === "destructive"
      ? "bg-red-100 text-red-700 border-red-200"
      : variant === "secondary"
        ? "bg-slate-100 text-slate-700 border-slate-200"
        : "bg-slate-900 text-white border-slate-900";

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${styles}`}>{children}</span>;
}

function StatCard({ title, value, icon: Icon, hint }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
            <p className="mt-2 text-xs text-slate-500">{hint}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-900"
        }`}
      >
        <div className="mb-2 flex items-center gap-2 text-xs opacity-80">
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          <span>{isUser ? "Customer" : "Support AI"}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>

        {message.meta && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{message.meta.category}</Badge>
            <Badge variant="secondary">{message.meta.urgency}</Badge>
            <Badge variant="secondary">{message.meta.sentiment}</Badge>
            <Badge variant={message.meta.escalated ? "destructive" : "default"}>
              {message.meta.escalated ? "Escalated" : "Resolved"}
            </Badge>
            {message.meta.source && <Badge variant="secondary">{message.meta.source}</Badge>}
          </div>
        )}
      </div>
    </div>
  );
}

async function sendToWebhook(payload) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook returned ${response.status}`);
  }

  return response.json();
}

function toLogEntry(result, elapsedMs) {
  return {
    id: result.request_id || `REQ-${Date.now()}`,
    category: result.category || "general",
    sentiment: result.sentiment || "neutral",
    status: result.escalated ? "escalated" : "resolved",
    responseTime: `${Math.max(1, Math.round(elapsedMs / 1000))}s`,
    source: result.source || (webhookUrl ? "n8n" : "fallback"),
  };
}

export default function App() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [channel, setChannel] = useState("website_chat");
  const [customerId, setCustomerId] = useState("cust_001");
  const [logs, setLogs] = useState(sampleLogs);
  const [selectedTab, setSelectedTab] = useState("support");
  const [isSending, setIsSending] = useState(false);
  const [lastMode, setLastMode] = useState(webhookUrl ? "Webhook configured" : "Local fallback");

  const stats = useMemo(() => {
    const total = logs.length;
    const escalated = logs.filter((log) => log.status === "escalated").length;
    const resolved = total - escalated;
    const negative = logs.filter((log) => log.sentiment === "negative").length;
    return { total, escalated, resolved, negative };
  }, [logs]);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    const userMessage = {
      id: Date.now(),
      role: "user",
      text: userText,
      meta: null,
    };

    const payload = {
      customer_id: customerId || "anonymous",
      channel,
      query: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    const startedAt = Date.now();
    let result;

    try {
      if (!webhookUrl) {
        throw new Error("Webhook not configured");
      }

      const webhookResult = await sendToWebhook(payload);
      result = {
        ...webhookResult,
        escalated: Boolean(webhookResult.escalated),
        source: "n8n",
      };
      setLastMode("Live n8n webhook");
    } catch (error) {
      result = classifyLocally(userText);
      setLastMode(webhookUrl ? "Fallback after webhook error" : "Local fallback");
      console.warn("Support workflow fallback triggered:", error);
    } finally {
      setIsSending(false);
    }

    const assistantMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: result.message,
      meta: {
        category: result.category || "general",
        urgency: result.urgency || "medium",
        sentiment: result.sentiment || "neutral",
        escalated: Boolean(result.escalated),
        source: result.source,
      },
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setLogs((prev) => [toLogEntry(result, Date.now() - startedAt), ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-slate-500">AI Workflow Project</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Agentic Customer Support System</h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Multi-agent support workflow with intake classification, FAQ response, sentiment analysis, escalation handling, and analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>n8n orchestration</Badge>
            <Badge variant="secondary">Human-in-the-loop</Badge>
            <Badge variant="secondary">{lastMode}</Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Queries" value={stats.total} icon={MessageSquareMore} hint="Logged support interactions" />
          <StatCard title="FAQ Resolved" value={stats.resolved} icon={CheckCircle2} hint="Auto-resolved by workflow" />
          <StatCard title="Escalations" value={stats.escalated} icon={AlertTriangle} hint="Sent to human support" />
          <StatCard title="Negative Sentiment" value={stats.negative} icon={SmilePlus} hint="Flagged frustrated customers" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTab("support")}
            className={`rounded-2xl px-4 py-2 text-sm font-medium ${selectedTab === "support" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700"}`}
          >
            Support Console
          </button>
          <button
            onClick={() => setSelectedTab("analytics")}
            className={`rounded-2xl px-4 py-2 text-sm font-medium ${selectedTab === "analytics" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700"}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setSelectedTab("architecture")}
            className={`rounded-2xl px-4 py-2 text-sm font-medium ${selectedTab === "architecture" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700"}`}
          >
            Architecture
          </button>
        </div>

        {selectedTab === "support" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <h2 className="text-xl font-semibold">Customer Support Chat</h2>
                <p className="text-sm text-slate-500">
                  Queries are sent to your configured n8n webhook when `VITE_N8N_WEBHOOK_URL` is present. If not, the demo falls back to local logic so the UI stays usable.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer ID</label>
                    <input
                      value={customerId}
                      onChange={(event) => setCustomerId(event.target.value)}
                      placeholder="cust_001"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Channel</label>
                    <select
                      value={channel}
                      onChange={(event) => setChannel(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      <option value="website_chat">Website Chat</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Connection</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <PlugZap className="h-4 w-4" />
                        {webhookUrl ? "Webhook configured" : "Using local fallback"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-[420px] space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-100 p-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>

                <div className="space-y-3">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type a support query like: How do I reset my password?"
                    className="min-h-[110px] w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={sendMessage} className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800">
                      <Send className="mr-2 h-4 w-4" />
                      {isSending ? "Sending..." : "Send Query"}
                    </button>
                    <button onClick={() => setInput("How do I reset my password?")} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50">
                      Password Reset
                    </button>
                    <button onClick={() => setInput("Do you offer student discounts?")} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50">
                      Student Discount
                    </button>
                    <button onClick={() => setInput("Your app keeps crashing and I am very upset.")} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50">
                      App Crash
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Webhook Payload</h2>
                  <p className="text-sm text-slate-500">This is the request shape sent from the UI to n8n.</p>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{`{
  "customer_id": "${customerId}",
  "channel": "${channel}",
  "query": "${input || "How do I reset my password?"}"
}`}</pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Agent Roles</h2>
                  <p className="text-sm text-slate-500">Specialized agents used in the workflow.</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <div className="rounded-2xl border p-3"><span className="font-medium">Intake Classifier:</span> categorizes query and urgency.</div>
                  <div className="rounded-2xl border p-3"><span className="font-medium">Sentiment Analyzer:</span> detects customer mood.</div>
                  <div className="rounded-2xl border p-3"><span className="font-medium">FAQ Responder:</span> answers known support questions.</div>
                  <div className="rounded-2xl border p-3"><span className="font-medium">Escalation Handler:</span> routes sensitive cases to humans.</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === "analytics" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <h2 className="text-xl font-semibold">Recent Support Logs</h2>
                <p className="text-sm text-slate-500">Requests handled by the live webhook or local fallback path.</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-slate-500">
                        <th className="py-3 pr-4">Request ID</th>
                        <th className="py-3 pr-4">Category</th>
                        <th className="py-3 pr-4">Sentiment</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4">Source</th>
                        <th className="py-3 pr-4">Response Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">{log.id}</td>
                          <td className="py-3 pr-4 capitalize">{log.category}</td>
                          <td className="py-3 pr-4 capitalize">{log.sentiment}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={log.status === "escalated" ? "destructive" : "default"}>{log.status}</Badge>
                          </td>
                          <td className="py-3 pr-4">{log.source}</td>
                          <td className="py-3 pr-4">{log.responseTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Category Split</h2>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {["billing", "account", "technical", "general"].map((category) => {
                    const count = logs.filter((log) => log.category === category).length;
                    const width = `${Math.max(8, (count / Math.max(logs.length, 1)) * 100)}%`;

                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="capitalize">{category}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-slate-900" style={{ width }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Operational Highlights</h2>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-700">
                  <div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4" /><span>Response timing is measured from the UI request lifecycle so you can immediately see webhook latency.</span></div>
                  <div className="flex items-start gap-3"><BarChart3 className="mt-0.5 h-4 w-4" /><span>Escalation frequency rises for negative sentiment, missing FAQ matches, and high urgency cases.</span></div>
                  <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-4 w-4" /><span>Each request is labeled with `n8n` or `fallback` so demo traffic is easy to distinguish from live workflow traffic.</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === "architecture" && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Workflow Architecture</h2>
              <p className="text-sm text-slate-500">The UI now targets the exported n8n orchestration workflow via a configurable webhook URL.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                {[
                  "Webhook Input",
                  "Classifier + Sentiment",
                  "FAQ Match",
                  "Escalation Decision",
                  "Respond + Log",
                ].map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 text-xs text-slate-500">Step {index + 1}</div>
                    <div className="font-medium text-slate-900">{step}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border bg-slate-100 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  The frontend posts each support query to n8n through a webhook. n8n normalizes the payload, runs classification and sentiment analysis, checks the FAQ matcher, decides whether to escalate, then returns the customer response while logging the interaction separately.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
