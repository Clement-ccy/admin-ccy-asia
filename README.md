# admin-ccy-asia

Standalone admin/control-plane for ccy.asia.

## App routes

- `/` — admin login/setup
- `/dashboard`
- `/analytics`
- `/comments`
- `/settings`

## Environment variables

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.ccy.asia
NEXT_PUBLIC_ADMIN_SETUP_TOKEN=***
```

## Commands

```bash
npm install
npm run lint
npm run build
npm run dev:api
npm run migrate:api:local
npm run migrate:api:remote
npm run deploy:api
```

## Worker

The Cloudflare Worker lives in `worker/` and keeps the `/v1/...` API contract stable for both the public site and the admin app.

`wrangler dev` does not auto-apply D1 migrations to the local Miniflare database. Use the scripted local dev flow so migrations are applied before the Worker starts:

```bash
npm run dev:api
```

Apply D1 migrations from this standalone project root:

```bash
npm run migrate:api:local
npm run migrate:api:remote
```
