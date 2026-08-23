import type { MetadataRoute } from "next"
import { BASE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing here is useful in an index, and several are per-visitor.
        disallow: [
          "/cart",
          "/checkout",
          "/account",
          "/order/",
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
