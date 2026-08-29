import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    /**
     * Product images are served by the commerce backend from /static (and
     * later from the CDN), so every host the backend can run on has to be
     * allowed here — next/image blocks anything unlisted, which would break
     * every product image the moment the backend stops being localhost.
     */
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "https", hostname: "cdn.xivy.in" },
      // Railway-hosted backend (any project/environment subdomain)
      { protocol: "https", hostname: "*.up.railway.app" },
      // Whatever MEDUSA_BACKEND_URL points at, so a custom domain just works
      ...(process.env.MEDUSA_BACKEND_URL?.startsWith("https://")
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.MEDUSA_BACKEND_URL).hostname,
            },
          ]
        : []),
    ],
  },

  /**
   * The previous xivy.in used /products/[slug], /products, /cart, /checkout,
   * /account, /login and /signup — all of which this app serves at the same
   * paths, so no redirects are needed to preserve those. These cover common
   * inbound variants and paths the old navigation implied.
   */
  async redirects() {
    return [
      { source: "/shop", destination: "/products", permanent: true },
      { source: "/product/:slug", destination: "/products/:slug", permanent: true },
      { source: "/collections/:slug", destination: "/products", permanent: true },
      { source: "/category/:slug", destination: "/products?category=:slug", permanent: true },
      { source: "/my-orders", destination: "/account/orders", permanent: true },
      { source: "/register", destination: "/signup", permanent: true },
      { source: "/sign-up", destination: "/signup", permanent: true },
      { source: "/sign-in", destination: "/login", permanent: true },
    ]
  },
}

export default nextConfig
