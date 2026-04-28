## Development Notes

### Vite Cache Issue

If you encounter a `504 (Outdated Optimize Dep)` error or components fail to load in dev mode:

```bash
rm -rf node_modules/.vite && pnpm dev
```

This clears Vite's stale dependency cache. Can happen after:

- Installing/updating dependencies
- Switching branches with different deps
- Reinstalling node_modules

### Guestbook Setup

The guestbook feature requires environment variables. Set these in Vercel or your local `.env` file:

- `TURSO_DATABASE_URL` - Turso database URL (e.g., `libsql://<db>.turso.io`)
- `TURSO_AUTH_TOKEN` - Turso auth token
- `GUESTBOOK_SALT` - Random string for IP hashing (e.g., `openssl rand -hex 32`)
- `GUESTBOOK_EXPORT_TOKEN` - Token for exporting guestbook data (e.g., `openssl rand -hex 32`)
- `GUESTBOOK_EMAIL_KEY` - 32-byte key for email encryption (e.g., `openssl rand -base64 32`)

Run the migration script to create the database table:

```bash
pnpm guestbook:migrate
```

Export guestbook data (admin-only):

```
GET /api/guestbook/export.json?token=YOUR_EXPORT_TOKEN
```
