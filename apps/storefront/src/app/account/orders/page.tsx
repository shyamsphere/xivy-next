import type { Metadata } from "next"
import Link from "next/link"
import { ButtonLink } from "@/components/ui/Button"
import { listOrders } from "@/lib/auth"
import { formatINR } from "@/lib/format"

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
}

export default async function OrdersPage() {
  const orders = await listOrders()

  if (orders.length === 0) {
    return (
      <div className="rounded-card border border-line p-10 text-center">
        <p className="font-medium">No orders yet</p>
        <p className="mt-1 text-sm text-ink-muted">
          When you place an order it&apos;ll show up here.
        </p>
        <ButtonLink href="/products" className="mt-6" size="sm">
          Browse covers
        </ButtonLink>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li
          key={order.id}
          className="rounded-card border border-line p-5 text-sm"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">
              Order {order.display_id ? `#${order.display_id}` : order.id}
            </p>
            <p className="text-ink-muted">
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null}
            </p>
          </div>
          <p className="mt-2 text-ink-muted">
            {(order.items ?? []).length}{" "}
            {(order.items ?? []).length === 1 ? "item" : "items"} ·{" "}
            {formatINR(order.total ?? 0)}
          </p>
          <Link
            href={`/account/orders/${order.id}`}
            className="mt-3 inline-block font-medium text-accent underline-offset-4 hover:underline"
          >
            View details
          </Link>
        </li>
      ))}
    </ul>
  )
}
