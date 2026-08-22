# Xivy

General e-commerce platform for XIVY (xivy.in) — mobile covers first, any physical product next.

**Monorepo:**

| Path | What | Runs on |
|---|---|---|
| `apps/commerce` | Medusa v2 backend (products, carts, orders, inventory, admin) + Xivy custom modules | Railway |
| `apps/storefront` | Next.js 15 App Router storefront | Vercel |
| `packages/types` | Shared TS types | — |
| `infrastructure/` | docker-compose (local Postgres+Redis), Railway deploy docs | — |

Architecture and roadmap live in `artifacts/implementation-plan.md`, which is kept
locally and not tracked in git.

## Local development

Prereqs: Node 20+, pnpm 9 (`corepack enable`), Docker.

```bash
pnpm install
pnpm infra:up                                  # Postgres :5433, Redis :6380

cd apps/commerce
cp .env.template .env
npx medusa db:migrate
npx medusa user -e admin@xivy.in -p <password> # admin login
npm run seed:devices                           # device catalog (brands/models)
npm run seed                                   # region, shipping, products, links
#   → note the "Publishable API key token" the seed prints

cd ../storefront
cp .env.template .env.local                    # paste the publishable key

cd ../..
pnpm dev                                       # storefront :3000, backend :9000
```

- Storefront: http://localhost:3000
- Medusa Admin: http://localhost:9000/app (sidebar has **Device Catalog**; product pages have a **Device Compatibility** widget)

## Custom pieces (never fork Medusa core)

- `apps/commerce/src/modules/device-catalog` — DeviceBrand/DeviceModel module
- `apps/commerce/src/links/device-model-product.ts` — compatibility link (module link, no cross-module FKs)
- `apps/commerce/src/api/store/devices/*` — phone-picker APIs
- `apps/commerce/src/api/admin/device-catalog/*` — admin CRUD + product assignment
- Coming per roadmap: `modules/razorpay` (payment provider), `modules/shiprocket` (fulfillment provider)

## Tests

```bash
cd apps/commerce && pnpm run test:integration:modules   # needs docker infra up
```

## Deployment

See `infrastructure/railway/README.md`. Version rule: keep every `@medusajs/*` package pinned to the same exact version.
