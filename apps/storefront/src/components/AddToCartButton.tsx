"use client"

import { useTransition } from "react"
import { addToCart } from "@/app/actions/cart"
import { cartAdded } from "@/lib/use-cart"

/**
 * Compact add-to-cart used on product cards. Cards link to the product, so
 * this stops the click bubbling into that navigation.
 */
export function AddToCartButton({
  variantId,
  label = "Add",
  disabled = false,
  className = "",
}: {
  variantId: string | null
  label?: string
  disabled?: boolean
  className?: string
}) {
  const [pending, startTransition] = useTransition()

  const add = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!variantId) return
    startTransition(async () => {
      await addToCart(variantId, 1)
      cartAdded()
    })
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={disabled || pending || !variantId}
      aria-label={disabled ? "Out of stock" : `${label} to cart`}
      className={`h-9 rounded-full bg-ink px-4 text-xs font-medium text-white transition-colors hover:bg-ink-muted disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {pending ? "Adding…" : disabled ? "Sold out" : label}
    </button>
  )
}
