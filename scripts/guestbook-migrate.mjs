import "dotenv/config";
import { createClient } from "@libsql/client";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const client = createClient({
  url: requireEnv("TURSO_DATABASE_URL"),
  authToken: requireEnv("TURSO_AUTH_TOKEN"),
});

const statements = [
  `CREATE TABLE IF NOT EXISTS guestbook_messages (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		message TEXT NOT NULL,
		website TEXT,
		email_enc TEXT,
		created_at INTEGER NOT NULL,
		ip_hash TEXT NOT NULL,
		user_agent TEXT
	);`,
  "CREATE INDEX IF NOT EXISTS guestbook_created_at ON guestbook_messages(created_at DESC);",
  "CREATE INDEX IF NOT EXISTS guestbook_ip_created_at ON guestbook_messages(ip_hash, created_at DESC);",
];

for (const sql of statements) {
  await client.execute(sql);
}

console.log("Guestbook migration complete.");
