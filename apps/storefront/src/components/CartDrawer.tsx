"use client"

import * as Dialog from "@radix-ui/react-dialog"
import Link from "next/link"
import { useState } from "react"

/**
 * Cart drawer shell. Radix Dialog gives focus trapping, Escape handling and
 * scroll locking for free. Line items and totals arrive in Phase 4 when the
 * Medusa cart is wired up (P1-6).
 */
export function CartDrawer({ itemCount = 0 }: { itemCount?: number }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="relative inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
        aria-label={`Cart, ${itemCount} items`}
      >
        <CartIcon />
        <span className="hidden sm:inline">Cart</span>
        {itemCount > 0 && (
          <span className="absolute -top-0.5 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-medium text-white">
            {itemCount}
          </span>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed top-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-line bg-surface shadow-lift">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <Dialog.Title className="text-base font-medium">
              Your cart
            </Dialog.Title>
            <Dialog.Close
              className="rounded-full p-2 text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
              aria-label="Close cart"
            >
              <CloseIcon />
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <CartIcon className="size-8 text-ink-subtle" />
            <p className="text-sm text-ink-muted">Your cart is empty.</p>
            <Dialog.Close asChild>
              <Link
                href="/products"
                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Browse covers
              </Link>
            </Dialog.Close>
          </div>

          <div className="border-t border-line px-6 py-4 text-xs text-ink-subtle">
            Free delivery over ₹999 · Cash on delivery available
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CartIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.4a.75.75 0 0 1 .73.57L5 7m0 0 1.6 7.2a1.5 1.5 0 0 0 1.47 1.17h8.1a1.5 1.5 0 0 0 1.46-1.14L19.5 7H5Z"
      />
      <circle cx="9" cy="19.5" r="1.25" />
      <circle cx="16.5" cy="19.5" r="1.25" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
