import type { MetadataRoute } from "next"
import { listProducts, listCategories } from "@/lib/medusa"
import { listBrandsWithModels } from "@/lib/devices"
import { BASE_URL } from "@/lib/seo"

// Regenerated hourly; product changes also push a revalidation (see
// /api/revalidate).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    {
      url: `${BASE_URL}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  // Every fetch is guarded: the sitemap is generated at build time too, and
  // a missing backend must not fail the build.
  try {
    const { products } = await listProducts({ limit: 200 })
    for (const product of products) {
      entries.push({
        url: `${BASE_URL}/products/${product.handle}`,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }
  } catch {
    // no products in the sitemap this run
  }

  try {
    for (const category of await listCategories()) {
      entries.push({
        url: `${BASE_URL}/products?category=${category.handle}`,
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }
  } catch {
    // skip categories
  }

  // Device-filtered listings are real landing pages for "cover for X" queries.
  try {
    for (const { models } of await listBrandsWithModels()) {
      for (const model of models) {
        entries.push({
          url: `${BASE_URL}/products?device=${model.handle}`,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
    }
  } catch {
    // skip devices
  }

  return entries
}
