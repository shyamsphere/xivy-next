"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { addToCart } from "@/app/actions/cart"
import { readDeviceCookie, variantMatchesDevice } from "@/lib/device-cookie"
import { cartAdded } from "@/lib/use-cart"
import type { ProductVariant } from "@/lib/types"

/**
 * Card action: adds straight to the cart when the phone is unambiguous,
 * otherwise sends the shopper to the product page to pick.
 *
 * The remembered phone is read from the cookie here in the browser rather
 * than on the server, because a cookies() read during render would make
 * every listing page dynamic. That means the first paint shows "Choose
 * phone" and this swaps to "Add" once mounted — deliberate, and the reason
 * the resolution happens in an effect rather than during render.
 */
export function CardAddToCart({
  productHandle,
  variants,
  serverVariantId,
}: {
  productHandle: string
  variants: ProductVariant[]
  /** Resolved server-side when the listing is already filtered by device. */
  serverVariantId?: string | null
}) {
  const [device, setDevice] = useState<{
    handle: string
    label: string | null
  } | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setDevice(readDeviceCookie())
  }, [])

  // Prefer the stored model name (an exact match on the option value), then
  // fall back to matching the handle. The fallback matters for cookies
  // written before the name was stored, which would otherwise leave the card
  // stuck on "Choose phone" until the shopper picked their phone again.
  const fromCookie = device
    ? variants.find(
        (variant) =>
          (device.label && variant.title?.trim() === device.label) ||
          variantMatchesDevice(variant.title, device.handle)
      )
    : undefined

  const resolved =
    variants.find((variant) => variant.id === serverVariantId) ??
    fromCookie ??
    (variants.length === 1 ? variants[0] : undefined)

  if (!resolved) {
    return (
      <Link
        href={`/products/${productHandle}`}
        className="h-9 shrink-0 rounded-full border border-line-strong px-3.5 text-xs leading-9 font-medium text-ink-muted transition-colors hover:border-ink hover:text-ink"
      >
        Choose phone
      </Link>
    )
  }

  const soldOut = (resolved.inventory_quantity ?? 0) <= 0

  return (
    <button
      type="button"
      disabled={soldOut || pending}
      aria-label={soldOut ? "Out of stock" : `Add ${resolved.title} to cart`}
      onClick={(event) => {
        event.preventDefault()
        startTransition(async () => {
          await addToCart(resolved.id, 1)
          cartAdded()
        })
      }}
      className="h-9 shrink-0 rounded-full bg-ink px-4 text-xs font-medium text-white transition-colors hover:bg-ink-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "Adding…" : soldOut ? "Sold out" : "Add"}
    </button>
  )
}
