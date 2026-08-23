import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ButtonLink } from "@/components/ui/Button"
import { getCart } from "@/lib/cart"
import { formatINR } from "@/lib/format"

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function CartPage() {
  const cart = await getCart()
  const items = cart?.items ?? []
  // item_total is GST-inclusive, which is what shoppers expect to see
  const subtotal = cart?.item_total ?? cart?.item_subtotal ?? 0

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-display text-3xl font-semibold">
          Your cart is empty
        </h1>
        <p className="mt-3 text-ink-muted">
          Find a cover built for your phone.
        </p>
        <ButtonLink href="/products" className="mt-8">
          Browse covers
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-display text-3xl font-semibold sm:text-4xl">Cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                {item.thumbnail && (
                  <Image
                    src={item.thumbnail}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {item.product?.handle ? (
                  <Link
                    href={`/products/${item.product.handle}`}
                    className="font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <p className="font-medium">{item.title}</p>
                )}
                {item.variant?.title && (
                  <p className="text-sm text-ink-subtle">
                    {item.variant.title}
                  </p>
                )}
                <p className="mt-1 text-sm text-ink-muted">
                  Qty {item.quantity} · {formatINR(item.unit_price)} each
                </p>
              </div>
              <p className="font-medium">
                {formatINR(item.unit_price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-card border border-line p-6">
          <h2 className="text-base font-medium">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Delivery</dt>
              <dd className="text-ink-muted">
                {subtotal >= 999 ? "Free" : "₹49 at checkout"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-line pt-4 text-xs text-ink-subtle">
            Prices include GST. Cash on delivery available.
          </p>
          <ButtonLink href="/checkout" size="lg" className="mt-4 w-full">
            Checkout
          </ButtonLink>
        </aside>
      </div>
    </div>
  )
}
