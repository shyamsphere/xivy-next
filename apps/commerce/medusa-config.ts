import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const REDIS_URL = process.env.REDIS_URL

// Optional providers are only registered when their env vars are present so
// local dev works before every external account (R2, Google) is set up.
const s3Configured = !!process.env.S3_ACCESS_KEY_ID
const googleConfigured = !!process.env.GOOGLE_CLIENT_ID

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") || "shared",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    /**
     * backendUrl is deliberately not set. The dashboard is compiled at build
     * time, so any value here is frozen into the JS bundle — in a container
     * build that is whatever the environment held during `docker build`
     * (nothing), which shipped a dashboard calling http://localhost:9000 and
     * failing with "Failed to fetch" on login. Left unset, Medusa uses the
     * browser origin, which is correct because this same app serves /app.
     * Only set it if the dashboard is ever hosted on a separate domain, and
     * then pass it as a build argument, not a runtime variable.
     */
  },
  modules: [
    // ─── Xivy custom modules ────────────────────────────────────────────
    { resolve: "./src/modules/device-catalog" },

    // ─── Infrastructure (Redis-backed when REDIS_URL is set) ────────────
    ...(REDIS_URL
      ? [
          {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: { redisUrl: REDIS_URL },
          },
          {
            resolve: "@medusajs/medusa/workflow-engine-redis",
            options: { redis: { url: REDIS_URL } },
          },
          {
            resolve: "@medusajs/medusa/cache-redis",
            options: { redisUrl: REDIS_URL },
          },
          {
            resolve: "@medusajs/medusa/locking",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/locking-redis",
                  id: "locking-redis",
                  is_default: true,
                  options: { redisUrl: REDIS_URL },
                },
              ],
            },
          },
        ]
      : []),

    // ─── File storage: R2 (S3-compatible) in deployed envs ──────────────
    ...(s3Configured
      ? [
          {
            resolve: "@medusajs/medusa/file",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/file-s3",
                  id: "s3",
                  options: {
                    file_url: process.env.S3_FILE_URL,
                    bucket: process.env.S3_BUCKET,
                    region: process.env.S3_REGION || "auto",
                    endpoint: process.env.S3_ENDPOINT,
                    access_key_id: process.env.S3_ACCESS_KEY_ID,
                    secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                  },
                },
              ],
            },
          },
        ]
      : []),

    // ─── Customer auth providers ─────────────────────────────────────────
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          { resolve: "@medusajs/medusa/auth-emailpass", id: "emailpass" },
          ...(googleConfigured
            ? [
                {
                  resolve: "@medusajs/medusa/auth-google",
                  id: "google",
                  options: {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
                  },
                },
              ]
            : []),
        ],
      },
    },
  ],
})
