import crypto from "node:crypto";

function requireEnv(name: string): string {
	const v = import.meta.env[name] ?? process.env[name];
	if (!v) throw new Error(`Missing env var: ${name}`);
	return v;
}

function getKey(): Buffer {
	const raw = requireEnv("GUESTBOOK_EMAIL_KEY");
	const key = Buffer.from(raw, "base64");
	if (key.length !== 32) {
		throw new Error(
			"GUESTBOOK_EMAIL_KEY must be 32 bytes (base64-encoded)"
		);
	}
	return key;
}

export function encryptEmail(email: string): string {
	const key = getKey();
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
	const ciphertext = Buffer.concat([
		cipher.update(email, "utf8"),
		cipher.final(),
	]);
	const tag = cipher.getAuthTag();

	return [
		"v1",
		iv.toString("base64"),
		ciphertext.toString("base64"),
		tag.toString("base64"),
	].join(":");
}

export function decryptEmail(payload: string): string {
	const [v, ivB64, ctB64, tagB64] = payload.split(":");
	if (v !== "v1" || !ivB64 || !ctB64 || !tagB64) {
		throw new Error("Invalid encrypted email payload");
	}

	const key = getKey();
	const iv = Buffer.from(ivB64, "base64");
	const ciphertext = Buffer.from(ctB64, "base64");
	const tag = Buffer.from(tagB64, "base64");

	const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
	decipher.setAuthTag(tag);
	const plaintext = Buffer.concat([
		decipher.update(ciphertext),
		decipher.final(),
	]);
	return plaintext.toString("utf8");
}
