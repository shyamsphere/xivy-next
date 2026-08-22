import Image from "next/image"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { formatINR } from "@/lib/format"

export function ProductCard({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const price = product.variants?.[0]?.calculated_price?.calculated_amount
  const mrp = product.metadata?.mrp as number | undefined

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] bg-neutral-50">
        {product.thumbnail && (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-neutral-900">
          {product.title}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          {typeof price === "number" && (
            <span className="text-base font-semibold">{formatINR(price)}</span>
          )}
          {mrp && (
            <span className="text-sm text-neutral-400 line-through">
              {formatINR(mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
