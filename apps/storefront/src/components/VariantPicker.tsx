"use client"

import type { ProductVariant } from "@/lib/types"
import { useState } from "react"
import { formatINR } from "@/lib/format"
import { Button } from "./ui/Button"

/**
 * Device/option selector for the PDP. Add-to-cart is inert until the Medusa
 * cart is wired up in Phase 4 (P1-6) — the selection state it holds is what
 * that work will submit.
 */
export function VariantPicker({
  variants,
  optionTitle = "Device",
}: {
  variants: ProductVariant[]
  optionTitle?: string
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? null)
  const selected = variants.find((variant) => variant.id === selectedId)
  const price = selected?.calculated_price?.calculated_amount
  const stock = selected?.inventory_quantity ?? 0
  const available = stock > 0

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
        disabled={!available}
        title="Cart is wired up in the next phase"
      >
        Add to cart
      </Button>
    </div>
  )
}
