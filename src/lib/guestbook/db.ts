import { createClient, type Client } from "@libsql/client";

let client: Client | undefined;

function requireEnv(name: string): string {
	const v = import.meta.env[name] ?? process.env[name];
	if (!v) throw new Error(`Missing env var: ${name}`);
	return v;
}

export function getGuestbookDb(): Client {
	client ??= createClient({
		url: requireEnv("TURSO_DATABASE_URL"),
		authToken: requireEnv("TURSO_AUTH_TOKEN"),
	});
	return client;
}
