import type { Metadata } from "next"
import { listProducts } from "@/lib/medusa"
import { ProductCard } from "@/components/ProductCard"

export const metadata: Metadata = {
  title: "Shop",
  description: "All XIVY mobile cases and accessories.",
}

// Rendered per-request until tag-based revalidation lands in Phase 3.
export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const { products, count } = await listProducts({ limit: 24 })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <p className="text-sm text-neutral-500">{count} products</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
