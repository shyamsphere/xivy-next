import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { formatINR } from "@/lib/format"
import {
  productPrice,
  productMrp,
  discountPercent,
  inStock,
} from "@/lib/medusa"

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product
  priority?: boolean
}) {
  const price = productPrice(product)
  const mrp = productMrp(product)
  const images = product.images ?? []
  const hoverImage = images[1]?.url
  const available = inStock(product)

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-surface-sunken">
        {product.thumbnail && (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-0"
          />
        )}
        {hoverImage && (
          <Image
            src={hoverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {price !== null && mrp !== null && mrp > price && (
          <span className="absolute top-3 left-3 rounded-full bg-sale px-2.5 py-1 text-[11px] font-medium text-white">
            {discountPercent(price, mrp)}% off
          </span>
        )}
        {!available && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-ink/85 py-1.5 text-center text-[11px] font-medium text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate text-sm font-medium text-ink">
          {product.title}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          {price !== null && (
            <span className="text-base font-semibold">{formatINR(price)}</span>
          )}
          {mrp !== null && mrp > (price ?? 0) && (
            <span className="text-sm text-ink-subtle line-through">
              {formatINR(mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
