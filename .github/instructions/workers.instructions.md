---
description: "Use when editing, deploying, or debugging Cloudflare Workers in workers/upload/ or workers/oauth/. Covers upload Worker API, OAuth proxy flow, deployment, and secrets management."
applyTo: "workers/**"
---
# Cloudflare Workers

## Upload Worker (`workers/upload/`)

Simple R2 proxy protected by Cloudflare Access (one-time PIN auth):
- `POST /upload` — multipart file upload → stores in R2, returns `{ key, url }`
- `GET /list` — paginated list of R2 objects (supports `?cursor=` and `?prefix=`)
- `DELETE /delete/:key` — removes object from R2
- CORS configured for `artishchow.com` via `ALLOWED_ORIGIN` env var
- R2 bucket binding: `IMAGES_BUCKET` → `artishchow-images`

## OAuth Worker (`workers/oauth/`)

GitHub OAuth proxy for Decap CMS authentication:
- `GET /auth` — redirects to GitHub OAuth authorize URL
- `GET /callback` — exchanges code for token, delivers to Decap CMS via `postMessage`
- Secrets (set via `npx wrangler secret put`): `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `postMessage` target origin: `ALLOWED_ORIGIN` env var (production: `https://artishchow.com`)

## Deployment

Workers deploy independently from the Zola site — no git push needed:
```bash
cd workers/upload && npm install && npx wrangler deploy
cd workers/oauth && npm install && npx wrangler deploy
```

Custom domains are configured in CF dashboard: Workers & Pages → worker → Settings → Domains & Routes.

## First-time setup

```bash
cd workers/oauth
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

GitHub OAuth App callback URL must be `https://oauth.artishchow.com/callback`.
