import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "https", hostname: "cdn.xivy.in" },
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
