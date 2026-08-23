"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import type { DeviceBrand, DeviceModel } from "@/lib/devices"
import { setSelectedDevice, clearSelectedDevice } from "@/lib/selected-device"
import { readDeviceCookie } from "@/lib/device-cookie"

export type DeviceGroup = { brand: DeviceBrand; models: DeviceModel[] }

/**
 * "Find covers for your phone" — brand then model. Purely a discovery aid:
 * the choice is remembered in a cookie and filters listings, but never
 * constrains the underlying catalog.
 */
export function DevicePicker({
  groups,
  trigger = "button",
}: {
  groups: DeviceGroup[]
  trigger?: "button" | "cta"
}) {
  const [open, setOpen] = useState(false)
  const [brandHandle, setBrandHandle] = useState<string | null>(
    groups.length === 1 ? groups[0].brand.handle : null
  )
  const [selectedHandle, setSelectedHandle] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  // Read in the browser, so no server render depends on cookies().
  useEffect(() => setSelectedHandle(readDeviceCookie()), [])

  const selectedLabel = (() => {
    if (!selectedHandle) return null
    for (const { brand, models } of groups) {
      const match = models.find((model) => model.handle === selectedHandle)
      if (match) return match.display_name ?? `${brand.name} ${match.name}`
    }
    return null
  })()

  const activeGroup = groups.find((g) => g.brand.handle === brandHandle)

  const choose = (model: DeviceModel) => {
    startTransition(async () => {
      await setSelectedDevice(model.handle)
      setSelectedHandle(model.handle)
      setOpen(false)
      router.push(`/products?device=${model.handle}`)
    })
  }

  const clear = () => {
    startTransition(async () => {
      await clearSelectedDevice()
      setSelectedHandle(null)
      setOpen(false)
      router.push("/products")
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={
          trigger === "cta"
            ? "inline-flex h-13 items-center gap-2 rounded-full bg-ink px-8 text-base font-medium text-white transition-colors hover:bg-ink-muted"
            : "inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm text-ink transition-colors hover:bg-surface-sunken"
        }
      >
        <PhoneIcon />
        {selectedLabel ? (
          <span className="max-w-40 truncate">{selectedLabel}</span>
        ) : (
          <span>Find your phone</span>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-card border border-line bg-surface shadow-lift">
          <div className="flex items-start justify-between border-b border-line px-6 py-4">
            <div>
              <Dialog.Title className="text-base font-medium">
                Find covers for your phone
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-ink-muted">
                Pick your model and we&apos;ll show only what fits.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="rounded-full p-2 text-ink-subtle hover:bg-surface-sunken hover:text-ink"
              aria-label="Close"
            >
              <CloseIcon />
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <fieldset className="p-4">
              <legend className="px-2 pb-2 text-xs font-medium tracking-wide text-ink-subtle uppercase">
                Brand
              </legend>
              <div className="flex flex-col">
                {groups.map(({ brand }) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => setBrandHandle(brand.handle)}
                    aria-pressed={brandHandle === brand.handle}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      brandHandle === brand.handle
                        ? "bg-surface-sunken font-medium text-ink"
                        : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
                    }`}
                  >
                    {brand.name}
                    <ChevronIcon />
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="p-4">
              <legend className="px-2 pb-2 text-xs font-medium tracking-wide text-ink-subtle uppercase">
                Model
              </legend>
              {!activeGroup ? (
                <p className="px-3 py-2.5 text-sm text-ink-subtle">
                  Choose a brand first.
                </p>
              ) : (
                <div className="flex flex-col">
                  {activeGroup.models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      disabled={pending}
                      onClick={() => choose(model)}
                      className="rounded-lg px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:opacity-50"
                    >
                      {model.display_name ?? model.name}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
          </div>

          {selectedLabel && (
            <div className="flex items-center justify-between border-t border-line px-6 py-3 text-sm">
              <span className="text-ink-muted">
                Currently showing:{" "}
                <span className="text-ink">{selectedLabel}</span>
              </span>
              <button
                type="button"
                onClick={clear}
                disabled={pending}
                className="font-medium text-accent underline-offset-4 hover:underline disabled:opacity-50"
              >
                Show all
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PhoneIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path strokeLinecap="round" d="M10.5 5.5h3" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      className="size-4 opacity-40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
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
