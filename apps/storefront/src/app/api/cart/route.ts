import { NextResponse } from "next/server"
import { getCart } from "@/lib/cart"

/**
 * Read-only cart endpoint for the header drawer and badge.
 *
 * The drawer lives in the root layout; fetching the cart here rather than in
 * a Server Component keeps the layout free of cookies() and therefore keeps
 * every page cacheable.
 */
export async function GET() {
  const cart = await getCart()

  return NextResponse.json(
    {
      cart: cart
        ? {
            id: cart.id,
            total: cart.total ?? 0,
            // item_total is GST-inclusive; item_subtotal excludes tax
            item_subtotal: cart.item_total ?? cart.item_subtotal ?? 0,
            items: (cart.items ?? []).map((item) => ({
              id: item.id,
              title: item.title,
              subtitle: item.variant?.title ?? item.subtitle ?? null,
              thumbnail: item.thumbnail ?? null,
              quantity: item.quantity,
              unit_price: item.unit_price,
              handle: item.product?.handle ?? null,
            })),
            count: (cart.items ?? []).reduce(
              (sum, item) => sum + item.quantity,
              0
            ),
          }
        : null,
    },
    { headers: { "cache-control": "no-store" } }
  )
}
