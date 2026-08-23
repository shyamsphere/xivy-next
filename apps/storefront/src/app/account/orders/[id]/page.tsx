import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getOrder } from "@/lib/auth"
import { formatINR } from "@/lib/format"

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  const items = order.items ?? []

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="text-sm text-ink-muted hover:text-ink"
      >
        ← All orders
      </Link>

      <div className="rounded-card border border-line p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-medium">
            Order {order.display_id ? `#${order.display_id}` : order.id}
          </h2>
          <div className="flex gap-2 text-xs">
            {order.payment_status && (
              <span className="rounded-full bg-surface-sunken px-2.5 py-1">
                Payment: {order.payment_status.replace(/_/g, " ")}
              </span>
            )}
            {order.fulfillment_status && (
              <span className="rounded-full bg-surface-sunken px-2.5 py-1">
                {order.fulfillment_status.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        <ul className="mt-5 divide-y divide-line">
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
            <p className="text-ink-subtle">Delivery address</p>
            <p className="mt-1">{order.shipping_address.first_name}</p>
            <p className="text-ink-muted">
              {order.shipping_address.address_1}, {order.shipping_address.city},{" "}
              {order.shipping_address.province}{" "}
              {order.shipping_address.postal_code}
            </p>
            <p className="text-ink-muted">{order.shipping_address.phone}</p>
          </div>
        )}
      </div>
    </div>
  )
}
