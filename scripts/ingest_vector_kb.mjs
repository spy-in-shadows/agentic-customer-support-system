import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const {
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_MODEL = "text-embedding-3-small",
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  FAQ_CSV_PATH = path.resolve("data/faq.csv"),
} = process.env;

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing required environment variables. Set OPENAI_API_KEY, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

async function readFaqRows(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const [headerLine, ...rowLines] = lines;
  const headers = parseCsvLine(headerLine);

  return rowLines.map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce((accumulator, header, index) => {
      accumulator[header] = cells[index] ?? "";
      return accumulator;
    }, {});
  });
}

function buildDocument(row) {
  return {
    id: row.id,
    category: row.category,
    question: row.question,
    answer: row.answer,
    content: `Category: ${row.category}\nQuestion: ${row.question}\nAnswer: ${row.answer}`,
  };
}

async function embedText(input) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function upsertDocument(document) {
  const embedding = await embedText(document.content);

  const response = await fetch(`${SUPABASE_URL}/rest/v1/support_knowledge`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: document.id,
      category: document.category,
      question: document.question,
      answer: document.answer,
      content: document.content,
      embedding,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase upsert failed for ${document.id}: ${response.status} ${errorText}`);
  }
}

async function main() {
  const rows = await readFaqRows(FAQ_CSV_PATH);
  const documents = rows.map(buildDocument);

  for (const document of documents) {
    console.log(`Embedding and upserting ${document.id}...`);
    await upsertDocument(document);
  }

  console.log(`Done. Upserted ${documents.length} knowledge records into Supabase.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
