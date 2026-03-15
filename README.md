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
npm run deploy:api
```

## Worker

The Cloudflare Worker lives in `worker/` and keeps the `/v1/...` API contract stable for both the public site and the admin app.

Apply D1 migrations from this standalone project root:

```bash
npx wrangler d1 migrations apply pf-database --local --config worker/wrangler.toml
npx wrangler d1 migrations apply pf-database --remote --config worker/wrangler.toml
```
