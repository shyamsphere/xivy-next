"use client"

import type { ProductVariant } from "@/lib/types"
import { useEffect, useState, useTransition } from "react"
import { addToCart } from "@/app/actions/cart"
import { formatINR } from "@/lib/format"
import { cartAdded } from "@/lib/use-cart"
import { readDeviceCookie, variantMatchesDevice } from "@/lib/device-cookie"
import { Button } from "./ui/Button"

/** Device/option selector plus add-to-cart for the PDP. */
export function VariantPicker({
  variants,
  optionTitle = "Device",
}: {
  variants: ProductVariant[]
  optionTitle?: string
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? null)

  // Preselect the remembered phone. Without this the picker defaulted to the
  // first variant, so a shopper who had chosen an iPhone could land on a page
  // pre-set to a Galaxy and add the wrong fit. Read after mount so the page
  // itself stays cacheable.
  useEffect(() => {
    const device = readDeviceCookie()
    if (!device) return
    const match = variants.find(
      (variant) =>
        (device.label && variant.title?.trim() === device.label) ||
        variantMatchesDevice(variant.title, device.handle)
    )
    if (match) setSelectedId(match.id)
  }, [variants])
  const [added, setAdded] = useState(false)
  const [pending, startTransition] = useTransition()
  const selected = variants.find((variant) => variant.id === selectedId)
  const price = selected?.calculated_price?.calculated_amount
  const stock = selected?.inventory_quantity ?? 0
  const available = stock > 0

  const add = () => {
    if (!selectedId) return
    startTransition(async () => {
      await addToCart(selectedId, 1)
      cartAdded() // refresh the badge and slide the drawer open
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    })
  }

  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium">{optionTitle}</h2>
        {selected?.sku && (
          <span className="text-xs text-ink-subtle">SKU {selected.sku}</span>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={optionTitle}
        className="mt-3 flex flex-wrap gap-2"
      >
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId
          const soldOut = (variant.inventory_quantity ?? 0) <= 0
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedId(variant.id)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                isSelected
                  ? "border-ink bg-ink text-white"
                  : "border-line-strong text-ink-muted hover:border-ink hover:text-ink"
              } ${soldOut ? "line-through opacity-50" : ""}`}
            >
              {variant.title}
            </button>
          )
        })}
      </div>

      {typeof price === "number" && (
        <p className="mt-6 text-2xl font-semibold">{formatINR(price)}</p>
      )}

      <p className="mt-2 text-sm">
        {available ? (
          <span className="text-ink-muted">
            In stock{stock <= 10 ? ` — only ${stock} left` : ""}
          </span>
        ) : (
          <span className="text-sale">Out of stock for this model</span>
        )}
      </p>

      <Button
        size="lg"
        className="mt-6 w-full sm:w-auto"
        disabled={!available || pending}
        onClick={add}
      >
        {pending ? "Adding…" : added ? "Added to cart ✓" : "Add to cart"}
      </Button>
      <span aria-live="polite" className="sr-only">
        {added ? "Added to cart" : ""}
      </span>
    </div>
  )
}
