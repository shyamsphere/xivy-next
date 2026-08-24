"use client"

import { useTransition } from "react"
import { removeLine, setLineQuantity } from "@/app/actions/cart"
import { notifyCartUpdated } from "@/lib/use-cart"

/**
 * Quantity control for the checkout order summary, so shoppers can adjust
 * without going back to the cart. Totals and the delivery threshold are
 * recomputed by Medusa on the resulting revalidation.
 */
export function CheckoutLineQuantity({
  lineId,
  quantity,
  title,
}: {
  lineId: string
  quantity: number
  title: string
}) {
  const [pending, startTransition] = useTransition()

  const change = (next: number) =>
    startTransition(async () => {
      await setLineQuantity(lineId, next)
      notifyCartUpdated()
    })

  const remove = () =>
    startTransition(async () => {
      await removeLine(lineId)
      notifyCartUpdated()
    })

  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="flex items-center rounded-full border border-line-strong">
        <button
          type="button"
          disabled={pending}
          onClick={() => change(quantity - 1)}
          aria-label={`Decrease quantity of ${title}`}
          className="grid size-7 place-items-center text-ink-muted hover:text-ink disabled:opacity-50"
        >
          −
        </button>
        <span className="w-6 text-center text-xs" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => change(quantity + 1)}
          aria-label={`Increase quantity of ${title}`}
          className="grid size-7 place-items-center text-ink-muted hover:text-ink disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className="text-[11px] text-ink-subtle underline-offset-4 hover:text-sale hover:underline disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  )
}
