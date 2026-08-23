import type { Metadata } from "next"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { FilterBar, type ShopParams } from "@/components/FilterBar"
import { ProductCard } from "@/components/ProductCard"
import { listBrandsWithModels, getCompatibleProducts } from "@/lib/devices"
import { listCategories, listProducts, productPrice } from "@/lib/medusa"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ShopParams>
}): Promise<Metadata> {
  const { q, device } = await searchParams
  const title = q ? `Search: ${q}` : device ? "Covers for your phone" : "Shop"
  return {
    title,
    description:
      "Browse XIVY mobile cases — silicone, rugged, transparent and clear.",
    // Filtered permutations stay out of the index to avoid duplicate content.
    robots: q || device ? { index: false, follow: true } : undefined,
    alternates: { canonical: "/products" },
  }
}

const sortProducts = (
  products: Product[],
  sort?: string
): Product[] => {
  if (sort !== "price-asc" && sort !== "price-desc") return products
  return [...products].sort((a, b) => {
    const priceA = productPrice(a) ?? 0
    const priceB = productPrice(b) ?? 0
    return sort === "price-asc" ? priceA - priceB : priceB - priceA
  })
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ShopParams>
}) {
  const params = await searchParams
  const [groups, categories] = await Promise.all([
    listBrandsWithModels(),
    listCategories(),
  ])

  // Device filter resolves through the compatibility link, then the matching
  // ids go back through the standard product endpoint so pricing, inventory
  // and sales-channel rules are applied by Medusa rather than by us.
  let compatibleIds: string[] | null = null
  if (params.device) {
    const compat = await getCompatibleProducts(params.device)
    compatibleIds = compat?.products.map((product) => product.id) ?? []
  }

  const category = params.category
    ? categories.find((c) => c.handle === params.category)
    : undefined

  const { products } =
    compatibleIds && compatibleIds.length === 0
      ? { products: [] as Product[] }
      : await listProducts({
          q: params.q,
          ...(compatibleIds ? { id: compatibleIds } : {}),
          ...(category ? { category_id: category.id } : {}),
          ...(params.sort === "newest" ? { order: "-created_at" } : {}),
          limit: 48,
        })

  const sorted = sortProducts(products, params.sort)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-subtle">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span aria-hidden> / </span>
        <span className="text-ink">Shop</span>
      </nav>

      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-display text-3xl font-semibold sm:text-4xl">
          {params.q ? `“${params.q}”` : "All covers"}
        </h1>
        <p className="text-sm text-ink-muted">
          {sorted.length} {sorted.length === 1 ? "product" : "products"}
        </p>
      </div>

      <FilterBar params={params} groups={groups} categories={categories} />

      {sorted.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium">Nothing matches yet.</p>
          <p className="mt-2 text-sm text-ink-muted">
            {params.device
              ? "We don't have covers for that model yet — more are on the way."
              : "Try a different search or clear your filters."}
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {sorted.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
            />
          ))}
        </div>
      )}
    </div>
  )
}
