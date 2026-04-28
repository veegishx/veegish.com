import type { APIRoute } from "astro";
import crypto from "node:crypto";
import { getGuestbookDb } from "../../lib/guestbook/db";
import { assertNotRateLimited, extractIp, ipHash } from "../../lib/guestbook/antiSpam";
import { encryptEmail } from "../../lib/guestbook/emailCrypto";
import { normalizeGuestbookInput } from "../../lib/guestbook/validate";

export const prerender = false;

function json(data: unknown, init?: ResponseInit): Response {
	return new Response(JSON.stringify(data), {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
	});
}

function toUtcDateString(ms: number): string {
	const d = new Date(ms);
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const day = String(d.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

export const GET: APIRoute = async ({ url }) => {
	const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit") ?? "50"), 100));
	const db = getGuestbookDb();

	const res = await db.execute({
		sql: "SELECT id, name, message, website, created_at FROM guestbook_messages ORDER BY created_at DESC LIMIT ?",
		args: [limit],
	});

	const messages = res.rows.map((r) => {
		const createdAt = Number(r.created_at);
		return {
			id: String(r.id),
			name: String(r.name),
			message: String(r.message),
			website: r.website ? String(r.website) : undefined,
			createdAt,
			createdAtDate: toUtcDateString(createdAt),
		};
	});

	return json({ messages });
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const ct = request.headers.get("content-type") ?? "";
		const isJson = ct.includes("application/json");

		let raw: Record<string, string> = {};
		if (isJson) {
			raw = (await request.json()) ?? {};
		} else {
			const form = await request.formData();
			for (const [k, v] of form.entries()) {
				if (typeof v === "string") raw[k] = v;
			}
		}

		// Honeypot. Use a field name that is unlikely to be autofilled.
		if ((raw.gb_fax ?? "").trim()) {
			if (!isJson) {
				return new Response(null, {
					status: 303,
					headers: { Location: "/guestbook?signed=1" },
				});
			}
			return json({ ok: true }, { status: 200 });
		}

		const input = normalizeGuestbookInput({
			name: raw.name ?? "",
			message: raw.message ?? "",
			website: raw.website ?? "",
			email: raw.email ?? "",
		});

		const db = getGuestbookDb();
		const nowMs = Date.now();
		const ip = extractIp(request) || "unknown";
		const hashed = ipHash(ip);

		await assertNotRateLimited({ db, ipHash: hashed, nowMs });

		const id = crypto.randomUUID();
		const emailEnc = input.email ? encryptEmail(input.email) : null;
		const ua = request.headers.get("user-agent");

		await db.execute({
			sql: "INSERT INTO guestbook_messages (id, name, message, website, email_enc, created_at, ip_hash, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			args: [
				id,
				input.name,
				input.message,
				input.website ?? null,
				emailEnc,
				nowMs,
				hashed,
				ua,
			],
		});

		// PRG redirect for HTML form submits.
		if (!isJson) {
			return new Response(null, {
				status: 303,
				headers: {
					Location: "/guestbook?signed=1",
				},
			});
		}

		return json({ ok: true, id }, { status: 201 });
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Bad request";
		const ct = request.headers.get("content-type") ?? "";
		const isJson = ct.includes("application/json");

		if (err instanceof Error && err.message === "RATE_LIMIT") {
			if (!isJson) {
				return new Response(null, {
					status: 303,
					headers: {
						Location: `/guestbook?error=${encodeURIComponent(
							"Too many submissions. Try again later."
						)}`,
					},
				});
			}
			return json(
				{ ok: false, error: "Too many submissions. Try again later." },
				{ status: 429 }
			);
		}

		if (!isJson) {
			return new Response(null, {
				status: 303,
				headers: {
					Location: `/guestbook?error=${encodeURIComponent(message)}`,
				},
			});
		}

		return json({ ok: false, error: message }, { status: 400 });
	}
};
