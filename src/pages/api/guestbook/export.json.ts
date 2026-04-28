import type { APIRoute } from "astro";
import { getGuestbookDb } from "../../../lib/guestbook/db";
import { decryptEmail } from "../../../lib/guestbook/emailCrypto";

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

function requireEnv(name: string): string {
	const v = import.meta.env[name] ?? process.env[name];
	if (!v) throw new Error(`Missing env var: ${name}`);
	return v;
}

export const GET: APIRoute = async ({ url }) => {
	const token = url.searchParams.get("token") ?? "";
	if (token !== requireEnv("GUESTBOOK_EXPORT_TOKEN")) {
		return json({ ok: false, error: "Unauthorized" }, { status: 401 });
	}

	const db = getGuestbookDb();
	const res = await db.execute({
		sql: "SELECT id, name, message, website, email_enc, created_at FROM guestbook_messages ORDER BY created_at DESC",
		args: [],
	});

	const messages = res.rows.map((r) => {
		const emailEnc = r.email_enc ? String(r.email_enc) : "";
		let email: string | undefined;
		if (emailEnc) {
			try {
				email = decryptEmail(emailEnc);
			} catch {
				email = undefined;
			}
		}
		return {
			id: String(r.id),
			name: String(r.name),
			message: String(r.message),
			website: r.website ? String(r.website) : undefined,
			email,
			createdAt: Number(r.created_at),
		};
	});

	return json({ version: 1, exportedAt: new Date().toISOString(), messages });
};
