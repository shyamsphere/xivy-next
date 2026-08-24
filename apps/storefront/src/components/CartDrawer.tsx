"use client"

import * as Dialog from "@radix-ui/react-dialog"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { removeLine, setLineQuantity } from "@/app/actions/cart"
import { formatINR } from "@/lib/format"
import { CART_OPEN, notifyCartUpdated, useCart } from "@/lib/use-cart"

export function CartDrawer() {
  const [open, setOpen] = useState(false)
  const { cart, loading } = useCart()
  const [pending, startTransition] = useTransition()

  // Adding an item anywhere on the site slides the drawer open.
  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener(CART_OPEN, show)
    return () => window.removeEventListener(CART_OPEN, show)
  }, [])

  const count = cart?.count ?? 0

  const changeQty = (lineId: string, quantity: number) =>
    startTransition(async () => {
      await setLineQuantity(lineId, quantity)
      notifyCartUpdated()
    })

  const remove = (lineId: string) =>
    startTransition(async () => {
      await removeLine(lineId)
      notifyCartUpdated()
    })

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="relative inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
        aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      >
        <CartIcon />
        <span className="hidden sm:inline">Cart</span>
        {count > 0 && (
          <span className="absolute -top-0.5 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-medium text-white">
            {count}
          </span>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-[2px] data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />
        <Dialog.Content className="fixed top-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-line bg-surface shadow-lift data-[state=closed]:animate-drawer-out data-[state=open]:animate-drawer-in">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <Dialog.Title className="text-base font-medium">
              Your cart{count > 0 ? ` (${count})` : ""}
            </Dialog.Title>
            <Dialog.Close
              className="rounded-full p-2 text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
              aria-label="Close cart"
            >
              <CloseIcon />
            </Dialog.Close>
          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-ink-subtle">
              Loading…
            </div>
          ) : !cart || cart.items.length === 0 ? (
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
          ) : (
            <>
              <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                      {item.thumbnail && (
                        <Image
                          src={item.thumbnail}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-xs text-ink-subtle">
                          {item.subtitle}
                        </p>
                      )}
                      <p className="mt-1 text-sm">
                        {formatINR(item.unit_price)}
                      </p>

                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-line-strong">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              changeQty(item.id, item.quantity - 1)
                            }
                            className="grid size-8 place-items-center text-ink-muted hover:text-ink disabled:opacity-50"
                            aria-label={`Decrease quantity of ${item.title}`}
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              changeQty(item.id, item.quantity + 1)
                            }
                            className="grid size-8 place-items-center text-ink-muted hover:text-ink disabled:opacity-50"
                            aria-label={`Increase quantity of ${item.title}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => remove(item.id)}
                          className="text-xs text-ink-subtle underline-offset-4 hover:text-sale hover:underline disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-line px-6 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-ink-muted">Subtotal</span>
                  <span className="text-base font-semibold">
                    {formatINR(cart.item_subtotal)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-subtle">
                  Delivery calculated at checkout · free over ₹999
                </p>
                <Dialog.Close asChild>
                  <Link
                    href="/checkout"
                    className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-ink text-sm font-medium text-white transition-colors hover:bg-ink-muted"
                  >
                    Checkout
                  </Link>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Link
                    href="/cart"
                    className="mt-2 flex h-10 w-full items-center justify-center text-sm text-ink-muted hover:text-ink"
                  >
                    View cart
                  </Link>
                </Dialog.Close>
              </div>
            </>
          )}
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
