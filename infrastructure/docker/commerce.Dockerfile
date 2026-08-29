# Commerce backend (Medusa v2) image.
#
# Build from the REPO ROOT, not apps/commerce — this is a pnpm workspace and
# the lockfile lives at the root:
#   docker build -f infrastructure/docker/commerce.Dockerfile .
# On Railway, leave the service root at the repo root and point it here.

FROM node:20-alpine AS base
# sharp and other native deps need glibc compatibility on alpine
RUN apk add --no-cache libc6-compat
RUN corepack enable
WORKDIR /app

# ── Dependencies ─────────────────────────────────────────────────────────
# Copied separately so a source-only change doesn't reinstall everything.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/commerce/package.json apps/commerce/
COPY apps/storefront/package.json apps/storefront/
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile --filter @xivy/commerce...

# ── Build ────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/commerce/node_modules ./apps/commerce/node_modules
COPY . .
# Produces apps/commerce/.medusa/server — a self-contained app with its own
# package.json and the compiled admin at public/admin.
RUN pnpm --filter @xivy/commerce exec medusa build

# ── Runtime ──────────────────────────────────────────────────────────────
# Only the built server ships, not the workspace. `medusa start` resolves the
# admin relative to its working directory, so the app must run from inside
# the build output — running it from the source directory fails with
# "Could not find index.html in the admin build directory".
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/apps/commerce/.medusa/server ./
# Product images are served from /static and are not part of the build output.
COPY --from=build /app/apps/commerce/static ./static
COPY --from=build /app/apps/commerce/data ./data

RUN npm install --omit=dev --no-audit --no-fund

EXPOSE 9000

# Migrations run as a Railway pre-deploy command, not here, so a restarting
# container never races another instance's migration.
CMD ["npm", "run", "start"]
