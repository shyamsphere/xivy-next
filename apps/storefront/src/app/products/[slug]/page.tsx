import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getProductByHandle } from "@/lib/medusa"
import { formatINR } from "@/lib/format"

// Rendered per-request until tag-based revalidation lands in Phase 3.
export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductByHandle(slug)
  if (!product) return {}
  return {
    title: product.title,
    description: product.description ?? undefined,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: product.title,
      description: product.description ?? undefined,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductByHandle(slug)
  if (!product) notFound()

  const price = product.variants?.[0]?.calculated_price?.calculated_amount
  const mrp = product.metadata?.mrp as number | undefined

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-50">
          {product.thumbnail && (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {product.title}
          </h1>
          <div className="mt-3 flex items-baseline gap-3">
            {typeof price === "number" && (
              <span className="text-2xl font-semibold">
                {formatINR(price)}
              </span>
            )}
            {mrp && (
              <span className="text-lg text-neutral-400 line-through">
                {formatINR(mrp)}
              </span>
            )}
          </div>
          <p className="mt-6 leading-relaxed text-neutral-600">
            {product.description}
          </p>

          {!!product.variants?.length && (
            <div className="mt-8">
              <h2 className="text-sm font-medium text-neutral-900">
                Available for
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <span
                    key={variant.id}
                    className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm"
                  >
                    {variant.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 text-sm text-neutral-500">
            Free delivery over ₹999 · Ships across India
          </p>
        </div>
      </div>
    </div>
  )
}
