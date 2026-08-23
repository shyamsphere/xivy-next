import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ButtonLink } from "@/components/ui/Button"
import { getOrder } from "@/lib/auth"
import { formatINR } from "@/lib/format"

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  const items = order.items ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-ink text-white">
          ✓
        </div>
        <h1 className="text-display mt-5 text-3xl font-semibold">
          Order confirmed
        </h1>
        <p className="mt-2 text-ink-muted">
          Thanks{order.shipping_address?.first_name
            ? `, ${order.shipping_address.first_name}`
            : ""}
          . We&apos;ve got your order
          {order.display_id ? ` #${order.display_id}` : ""} and will email
          updates as it ships.
        </p>
      </div>

      <div className="mt-10 rounded-card border border-line p-6">
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.title}</span>
                <span className="text-ink-subtle">
                  {item.variant?.title} × {item.quantity}
                </span>
              </span>
              <span>{formatINR(item.unit_price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Delivery</dt>
            <dd>
              {(order.shipping_total ?? 0) === 0
                ? "Free"
                : formatINR(order.shipping_total ?? 0)}
            </dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatINR(order.total ?? 0)}</dd>
          </div>
        </dl>

        {order.shipping_address && (
          <div className="mt-6 border-t border-line pt-4 text-sm">
            <p className="text-ink-muted">Delivering to</p>
            <p className="mt-1">
              {order.shipping_address.address_1}, {order.shipping_address.city},{" "}
              {order.shipping_address.province}{" "}
              {order.shipping_address.postal_code}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/account/orders" variant="secondary">
          View my orders
        </ButtonLink>
        <ButtonLink href="/products">Keep shopping</ButtonLink>
      </div>
    </div>
  )
}
