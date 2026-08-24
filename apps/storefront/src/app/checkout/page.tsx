import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckoutLineQuantity } from "@/components/CheckoutLineQuantity"
import { CodPaymentForm, DeliveryForm } from "@/components/CheckoutForm"
import { getCart } from "@/lib/cart"
import { getCustomer } from "@/lib/auth"
import { formatINR } from "@/lib/format"

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function CheckoutPage() {
  const [cart, customer] = await Promise.all([getCart(), getCustomer()])

  if (!cart || (cart.items ?? []).length === 0) redirect("/cart")

  const hasDelivery =
    !!cart.shipping_address && (cart.shipping_methods ?? []).length > 0
  const items = cart.items ?? []
  const shipping = cart.shipping_total ?? 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-display text-3xl font-semibold sm:text-4xl">
        Checkout
      </h1>
      {!customer && (
        <p className="mt-2 text-sm text-ink-muted">
          Checking out as a guest.{" "}
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to save your details.
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <section>
            <h2 className="flex items-center gap-2 text-lg font-medium">
              <Step n={1} done={hasDelivery} /> Delivery details
            </h2>
            <div className="mt-4">
              {hasDelivery ? (
                <div className="rounded-card border border-line p-4 text-sm">
                  <p className="font-medium">
                    {cart.shipping_address?.first_name}
                  </p>
                  <p className="mt-1 text-ink-muted">
                    {cart.shipping_address?.address_1},{" "}
                    {cart.shipping_address?.city},{" "}
                    {cart.shipping_address?.province}{" "}
                    {cart.shipping_address?.postal_code}
                  </p>
                  <p className="text-ink-muted">
                    {cart.shipping_address?.phone} · {cart.email}
                  </p>
                  <p className="mt-3 text-xs text-ink-subtle">
                    Standard delivery ·{" "}
                    {shipping === 0 ? "Free" : formatINR(shipping)}
                  </p>
                </div>
              ) : (
                <DeliveryForm
                  defaultEmail={customer?.email ?? cart.email}
                  address={customer?.addresses?.[0] ?? cart.shipping_address}
                />
              )}
            </div>
          </section>

          <section aria-disabled={!hasDelivery}>
            <h2 className="flex items-center gap-2 text-lg font-medium">
              <Step n={2} done={false} /> Payment
            </h2>
            <div className="mt-4">
              {hasDelivery ? (
                <CodPaymentForm total={formatINR(cart.total ?? 0)} />
              ) : (
                <p className="text-sm text-ink-subtle">
                  Add your delivery details first.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-card border border-line p-6">
          <h2 className="text-base font-medium">Order summary</h2>
          <ul className="mt-4 space-y-4 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate">{item.title}</span>
                  <span className="text-ink-subtle">{item.variant?.title}</span>
                  <CheckoutLineQuantity
                    lineId={item.id}
                    quantity={item.quantity}
                    title={item.title}
                  />
                </span>
                <span className="shrink-0">
                  {formatINR(item.unit_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd>{formatINR(cart.item_total ?? cart.item_subtotal ?? 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Delivery</dt>
              <dd>{hasDelivery ? (shipping === 0 ? "Free" : formatINR(shipping)) : "—"}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatINR(cart.total ?? 0)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-ink-subtle">
            Inclusive of GST.
          </p>
        </aside>
      </div>
    </div>
  )
}

function Step({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={`grid size-6 place-items-center rounded-full text-xs font-medium ${
        done ? "bg-ink text-white" : "border border-line-strong text-ink-muted"
      }`}
      aria-hidden
    >
      {done ? "✓" : n}
    </span>
  )
}
