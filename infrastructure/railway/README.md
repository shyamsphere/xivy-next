# Railway deployment — commerce backend

The storefront goes on Vercel; this is the Medusa app, Postgres and Redis.

## Services

| Service | Source | Notes |
|---|---|---|
| `commerce` | this repo, Dockerfile `infrastructure/docker/commerce.Dockerfile` | public domain; `MEDUSA_WORKER_MODE=server` |
| `commerce-worker` | same repo and Dockerfile | `MEDUSA_WORKER_MODE=worker`, `DISABLE_MEDUSA_ADMIN=true`, **no** public domain |
| Postgres | Railway plugin | enable backups |
| Redis | Railway plugin | — |

**Leave the service root directory at the repository root.** This is a pnpm
workspace and the Dockerfile copies the root lockfile; pointing Railway at
`apps/commerce` breaks the build.

The worker service is optional at first — a single service in the default
`shared` mode runs jobs and subscribers too. Split it out when background work
starts competing with request handling.

## Build and start

The image builds the app and runs it from the build output
(`apps/commerce/.medusa/server`), because `medusa start` resolves the admin
dashboard relative to its working directory. `static/` and `data/` are copied
in explicitly — they are not part of the build output, and without `static/`
every product image 404s.

Set the **pre-deploy command** so migrations never race a restarting
container:

```
npx medusa db:migrate
```

## Environment variables

Required:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `JWT_SECRET`, `COOKIE_SECRET` | `openssl rand -hex 32` each, different values |
| `MEDUSA_BACKEND_URL` | this service's public URL |
| `MEDUSA_WORKER_MODE` | `server`, or `worker` on the worker service |
| `STORE_CORS` | the Vercel/storefront origin |
| `ADMIN_CORS` | this service's public URL |
| `AUTH_CORS` | both of the above, comma-separated |

Optional, each no-ops when unset:

| Variable | Purpose |
|---|---|
| `STOREFRONT_URL`, `REVALIDATE_SECRET` | lets product edits purge the storefront cache; the secret must match Vercel's |
| `S3_FILE_URL`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | move uploads off the container's disk to R2 — see "images" below |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google sign-in |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | payments |
| `RESEND_API_KEY`, `RESEND_FROM` | order emails |
| `SHIPROCKET_*` | shipping |

## First deploy

1. New project → deploy from `shyamsphere/xivy-next` → add Postgres and Redis.
2. Add the `commerce` service with the Dockerfile above; set the env vars and
   the pre-deploy migrate command; deploy.
3. Confirm `https://<service>/health` returns 200 and `/app` loads.
4. Seed, from the service shell. **Inside the image the scripts are compiled,
   so they end in `.js`** — `.ts` only works in local development:

   ```bash
   npx medusa user -e admin@xivy.in -p '<password>'
   npx medusa exec ./src/scripts/seed-devices.js
   npx medusa exec ./src/scripts/seed.js
   ```

5. The seed prints the publishable key. Put it in Vercel as
   `MEDUSA_PUBLISHABLE_KEY` — it is generated per database, so the local one
   will not work against this instance.

## Images

Product images are served from the container's `static/` directory, which is
part of the image and therefore read-only and lost on redeploy. That is fine
for the seeded catalogue, but anything uploaded through Admin disappears on
the next deploy. Configure the S3/R2 variables before staff start uploading.
