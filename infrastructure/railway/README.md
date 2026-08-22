# Railway deployment (staging & production)

One Railway project per environment (`xivy-staging`, `xivy-production`), each with:

| Service | Source | Notes |
|---|---|---|
| `commerce` | `apps/commerce` (Dockerfile or Nixpacks, root dir `apps/commerce`) | `MEDUSA_WORKER_MODE=server`; pre-deploy command: `npx medusa db:migrate` |
| `commerce-worker` | same image | `MEDUSA_WORKER_MODE=worker`, `DISABLE_MEDUSA_ADMIN=true`; no public domain |
| PostgreSQL | Railway plugin | enable backups |
| Redis | Railway plugin | — |

The storefront deploys on **Vercel** (root dir `apps/storefront`), pointed at the Railway backend.

## Environment variables — commerce

| Variable | Value |
|---|---|
| `DATABASE_URL` | from Railway Postgres |
| `REDIS_URL` | from Railway Redis |
| `JWT_SECRET` / `COOKIE_SECRET` | `openssl rand -hex 32` each |
| `MEDUSA_BACKEND_URL` | public URL of the commerce service |
| `MEDUSA_WORKER_MODE` | `server` / `worker` per service |
| `STORE_CORS` | storefront origin(s), e.g. `https://xivy.in` |
| `ADMIN_CORS` / `AUTH_CORS` | backend public URL (+ storefront for AUTH) |
| `S3_FILE_URL` | `https://cdn.xivy.in` (R2 custom domain) |
| `S3_BUCKET` / `S3_REGION` / `S3_ENDPOINT` | R2 bucket, `auto`, account endpoint |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | R2 API token |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Phase 4 |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Phase 4 (test keys on staging) |
| `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` / `SHIPROCKET_PICKUP_LOCATION` / `SHIPROCKET_WEBHOOK_TOKEN` | Phase 5 |
| `RESEND_API_KEY` / `RESEND_FROM` | Phase 4 |
| `SENTRY_DSN` | Phase 7 |

## Environment variables — storefront (Vercel)

| Variable | Value |
|---|---|
| `MEDUSA_BACKEND_URL` | Railway commerce public URL |
| `MEDUSA_PUBLISHABLE_KEY` | from Medusa Admin → Settings → Publishable API Keys |
| `NEXT_PUBLIC_BASE_URL` | `https://xivy.in` |

## First deploy checklist

1. Create Railway project + Postgres + Redis; add the two commerce services.
2. Set env vars; deploy; confirm `/health` returns 200.
3. Shell into the service (or run locally against the remote DB):
   `npx medusa user -e <admin-email> -p <password>` then
   `npm run seed:devices && npm run seed`.
4. Copy the publishable key from Admin into Vercel env.
5. Create the Vercel project (root `apps/storefront`), deploy, smoke-test.
