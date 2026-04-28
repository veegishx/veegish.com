import crypto from "node:crypto";
import type { Client } from "@libsql/client";

function requireEnv(name: string): string {
	const v = import.meta.env[name] ?? process.env[name];
	if (!v) throw new Error(`Missing env var: ${name}`);
	return v;
}

export function extractIp(request: Request): string {
	const xff = request.headers.get("x-forwarded-for");
	if (xff) return xff.split(",")[0]?.trim() || "";
	return request.headers.get("x-real-ip") ?? "";
}

export function ipHash(ip: string): string {
	const salt = requireEnv("GUESTBOOK_SALT");
	return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function assertNotRateLimited(opts: {
	db: Client;
	ipHash: string;
	nowMs: number;
	windowMs?: number;
	max?: number;
}): Promise<void> {
	const windowMs = opts.windowMs ?? 10 * 60 * 1000;
	const max = opts.max ?? 3;
	const cutoff = opts.nowMs - windowMs;

	const res = await opts.db.execute({
		sql: "SELECT COUNT(*) AS c FROM guestbook_messages WHERE ip_hash = ? AND created_at > ?",
		args: [opts.ipHash, cutoff],
	});
	const count = Number(res.rows[0]?.c ?? 0);
	if (count >= max) {
		throw new Error("RATE_LIMIT");
	}
}
