# Xivy

General e-commerce platform for XIVY (xivy.in) — mobile covers first, any physical
product next.

| Path | What | Runs on |
|---|---|---|
| `apps/commerce` | Medusa v2 backend (products, carts, orders, inventory, admin) + Xivy custom modules | Railway |
| `apps/storefront` | Next.js 15 App Router storefront | Vercel |
| `packages/types` | Shared TS types | — |
| `infrastructure/` | docker-compose (local Postgres + Redis), Railway deploy docs | — |

Architecture and roadmap live in `artifacts/implementation-plan.md`, kept locally
and not tracked in git.

## Prerequisites

Node 20+, pnpm 9 (`corepack enable`), Docker running.

## First-time setup

```bash
pnpm install
pnpm infra:up                                   # Postgres :5433, Redis :6380

cd apps/commerce
cp .env.template .env
pnpm exec medusa db:migrate
pnpm exec medusa user -e admin@xivy.in -p <password>   # your admin login
pnpm seed:devices                               # device brands + models
pnpm seed                                       # region, shipping, products, links
#   → copy the "Publishable API key token" it prints

cd ../storefront
cp .env.template .env.local                     # paste the publishable key
```

## Daily use

```bash
pnpm infra:up      # once per boot; data survives on a named volume
pnpm dev           # both apps via Turbo
```

- Storefront — http://localhost:3000
- Medusa Admin — http://localhost:9000/app
  (sidebar has **Device Catalog**; product pages have a **Device Compatibility** widget)

Run one app alone with `pnpm dev` inside `apps/commerce` or `apps/storefront`.
`pnpm infra:down` stops the containers.

## Tests

```bash
pnpm typecheck && pnpm lint                            # whole workspace

cd apps/commerce   && pnpm test:unit                   # utils
cd apps/commerce   && pnpm test:integration:modules    # device-catalog vs real Postgres
cd apps/storefront && pnpm test:e2e                    # Playwright, needs both servers up
```

The E2E suite drives the real backend — browse, cart, COD checkout, accounts — so
`pnpm infra:up` and `pnpm dev` must be running first. `pnpm test:e2e:ui` opens the
Playwright UI.

## What's built

Catalog, device compatibility and the phone picker; cart and drawer; guest and
account COD checkout; customer accounts with order history; SEO (sitemap, robots,
structured data, OG image); cache revalidation from the backend.

**Not built yet** — all blocked on credentials: Razorpay payments, order emails
(Resend), Google sign-in. Checkout is cash-on-delivery only, and customers
currently receive no email after ordering.

## Custom pieces (never fork Medusa core)

- `apps/commerce/src/modules/device-catalog` — DeviceBrand/DeviceModel module
- `apps/commerce/src/links/device-model-product.ts` — compatibility link
  (module link; no cross-module foreign keys)
- `apps/commerce/src/api/store/devices/*` — phone-picker and compatibility APIs
- `apps/commerce/src/api/admin/device-catalog/*` — admin CRUD + product assignment
- `apps/commerce/src/subscribers/revalidate-storefront.ts` — purges storefront
  caches when a product changes
- `apps/storefront/src/lib/{cart,auth,devices}.ts` — Store API access layer
- Coming per roadmap: `modules/razorpay`, `modules/shiprocket`

## Conventions

- **Pin every `@medusajs/*` package to the same exact version.** Mismatched
  admin-sdk/framework versions break the admin build.
- **Don't remove the React type pins** in either app's `tsconfig.json`. The two
  apps run different React majors (Medusa's admin needs 18, the storefront is on
  19), and pnpm's flat fallback store hands whichever copy an install happened to
  place there to the other app, which breaks JSX typing.
- Server components must not call `cookies()` in the root layout or in listing
  pages — it opts every route out of caching. Per-visitor state (the remembered
  phone) is read in the browser instead.
- Prices are GST-inclusive: display `item_total`, not `item_subtotal`.

## Gotchas

- Don't run `next build` in `apps/storefront` while `pnpm dev` is running — it
  wipes `.next` under the dev server ("Next.js package not found"); restart dev.
- To stop the servers: `pkill -f "turbo run dev"`, or `pkill -f "cli.js develop"`
  for Medusa alone. `pkill -f "medusa develop"` matches nothing — the real command
  line is `cli.js develop`.
- Local Postgres is on **5433** and Redis on **6380**, not the defaults, to avoid
  clashing with a Homebrew Postgres.

## Deployment

See `infrastructure/railway/README.md`.
