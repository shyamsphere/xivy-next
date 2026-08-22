import Medusa from "@medusajs/js-sdk"

/**
 * Server-side Medusa client. The publishable key stays on the server —
 * all storefront data flows through Server Components / server actions.
 */
export const medusa = new Medusa({
  baseUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: process.env.MEDUSA_PUBLISHABLE_KEY,
})

let cachedRegionId: string | null = null

/** The single India region seeded in the backend. */
export async function getRegionId(): Promise<string> {
  if (cachedRegionId) return cachedRegionId
  const { regions } = await medusa.store.region.list()
  const india =
    regions.find((region) => region.currency_code === "inr") ?? regions[0]
  cachedRegionId = india.id
  return cachedRegionId
}

export async function listProducts(query: Record<string, unknown> = {}) {
  const region_id = await getRegionId()
  return medusa.store.product.list({
    region_id,
    fields:
      "id,title,handle,thumbnail,metadata,*variants.calculated_price,+variants.title,+variants.options.*",
    ...query,
  })
}

export async function getProductByHandle(handle: string) {
  const { products } = await listProducts({ handle })
  return products[0] ?? null
}
