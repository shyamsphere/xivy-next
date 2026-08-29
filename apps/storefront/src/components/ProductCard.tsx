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
import { CardAddToCart } from "./CardAddToCart"
import { CardImages } from "./CardImages"

/**
 * Product card.
 *
 * `addVariantId` is the variant this card may add directly. Callers only pass
 * it when the fit is unambiguous — a single-variant product, or a
 * device-filtered listing where the shopper's phone is already known.
 * Otherwise the card sends them to the product page to choose, because every
 * variant here is a different phone fit and guessing would ship the wrong
 * case.
 */
export function ProductCard({
  product,
  priority = false,
  addVariantId,
}: {
  product: Product
  priority?: boolean
  addVariantId?: string | null
}) {
  const price = productPrice(product)
  const mrp = productMrp(product)
  const images = product.images ?? []
  const available = inStock(product)
  const variants = product.variants ?? []

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-lift">
      <Link
        href={`/products/${product.handle}`}
        className="block focus-visible:outline-offset-[-2px]"
      >
        <div className="relative">
          <CardImages
            images={images.length ? images : product.thumbnail ? [{ url: product.thumbnail }] : []}
            alt={product.title}
            priority={priority}
          />

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

        <div className="px-4 pt-4">
          <h3 className="truncate text-sm font-medium text-ink">
            {product.title}
          </h3>
        </div>
      </Link>

      <div className="mt-1.5 flex items-center justify-between gap-2 px-4 pb-4">
        <div className="flex items-baseline gap-2">
          {price !== null && (
            <span className="text-base font-semibold">{formatINR(price)}</span>
          )}
          {mrp !== null && mrp > (price ?? 0) && (
            <span className="text-sm text-ink-subtle line-through">
              {formatINR(mrp)}
            </span>
          )}
        </div>

        <CardAddToCart
          productHandle={product.handle}
          variants={variants}
          serverVariantId={addVariantId}
        />
      </div>
    </div>
  )
}
