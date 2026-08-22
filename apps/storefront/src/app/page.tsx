import Link from "next/link"
import { listProducts } from "@/lib/medusa"
import { ProductCard } from "@/components/ProductCard"

// Rendered per-request until tag-based revalidation lands in Phase 3.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const { products } = await listProducts({ limit: 8 })

  return (
    <>
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Premium protection for the phone you love.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-neutral-600">
            Cases and accessories in premium materials at honest prices —
            delivered across India. Free shipping over ₹999.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-neutral-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Shop covers
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
          <Link
            href="/products"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}
