import { getCompatibleProducts, type ProductDeviceModel } from "@/lib/devices"
import { listProducts } from "@/lib/medusa"
import type { Product } from "@/lib/types"
import { ProductCard } from "./ProductCard"

/**
 * Other covers worth showing on a product page.
 *
 * Prefers products that fit the same phones — the most useful relation in
 * this catalog — and tops up from the wider catalogue when compatibility
 * doesn't yield enough. Renders nothing rather than an empty shell.
 */
export async function RelatedProducts({
  product,
  devices,
  limit = 4,
}: {
  product: Product
  devices: ProductDeviceModel[]
  limit?: number
}) {
  const relatedIds = new Set<string>()

  for (const device of devices) {
    const compat = await getCompatibleProducts(device.handle)
    for (const candidate of compat?.products ?? []) {
      if (candidate.id !== product.id) relatedIds.add(candidate.id)
    }
    if (relatedIds.size >= limit) break
  }

  let related: Product[] = []

  if (relatedIds.size > 0) {
    try {
      const { products } = await listProducts({
        id: [...relatedIds].slice(0, limit),
        limit,
      })
      related = products
    } catch {
      related = []
    }
  }

  // Top up with anything else in the catalogue.
  if (related.length < limit) {
    try {
      const { products } = await listProducts({ limit: limit + 4 })
      for (const candidate of products) {
        if (related.length >= limit) break
        if (candidate.id === product.id) continue
        if (related.some((existing) => existing.id === candidate.id)) continue
        related.push(candidate)
      }
    } catch {
      // keep whatever compatibility gave us
    }
  }

  if (related.length === 0) return null

  const sharesPhone = relatedIds.size > 0

  return (
    <section className="mt-20 border-t border-line pt-12">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          {sharesPhone ? "Also fits your phone" : "You might also like"}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {sharesPhone
            ? "Other covers made for the same models."
            : "More from the XIVY range."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  )
}
