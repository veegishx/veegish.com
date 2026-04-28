const MAX_NAME = 60;
const MAX_MESSAGE = 1000;
const MAX_URL = 200;
const MAX_EMAIL = 200;

export type GuestbookInput = {
	name: string;
	message: string;
	website?: string;
	email?: string;
};

function clampTrim(s: string, max: number): string {
	return s.trim().slice(0, max);
}

export function normalizeWebsite(raw: string): string {
	let s = clampTrim(raw, MAX_URL);
	if (!s) return "";

	// Allow bare domains by defaulting to https.
	if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
	let url: URL;
	try {
		url = new URL(s);
	} catch {
		throw new Error("Invalid website URL");
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error("Website URL must be http/https");
	}
	return url.toString();
}

export function normalizeEmail(raw: string): string {
	const s = clampTrim(raw, MAX_EMAIL);
	if (!s) return "";
	// Basic sanity check, not full RFC compliance.
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
		throw new Error("Invalid email address");
	}
	return s;
}

export function normalizeGuestbookInput(input: GuestbookInput): GuestbookInput {
	const name = clampTrim(input.name ?? "", MAX_NAME);
	const message = clampTrim(input.message ?? "", MAX_MESSAGE);
	if (!name) throw new Error("Name is required");
	if (!message) throw new Error("Message is required");

	const website = input.website ? normalizeWebsite(input.website) : "";
	const email = input.email ? normalizeEmail(input.email) : "";

	return {
		name,
		message,
		website: website || undefined,
		email: email || undefined,
	};
}
