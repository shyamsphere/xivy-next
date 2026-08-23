"use client"

import { useActionState } from "react"
import {
  placeCodOrder,
  saveDeliveryDetails,
  type ActionState,
} from "@/app/actions/cart"
import type { Address } from "@/lib/types"
import { Button } from "./ui/Button"

const field =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm outline-none focus:border-ink"

export function DeliveryForm({
  defaultEmail,
  address,
}: {
  defaultEmail?: string | null
  address?: Address | null
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveDeliveryDetails,
    undefined
  )

  return (
    <form action={action} className="space-y-4">
      <Field label="Email" name="email" defaultValue={defaultEmail ?? ""} type="email" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          name="first_name"
          defaultValue={address?.first_name ?? ""}
          required
        />
        <Field
          label="Mobile number"
          name="phone"
          defaultValue={address?.phone ?? ""}
          inputMode="numeric"
          placeholder="10 digits"
          required
        />
      </div>
      <Field
        label="Address"
        name="address_1"
        defaultValue={address?.address_1 ?? ""}
        placeholder="House / flat, street, area"
        required
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" name="city" defaultValue={address?.city ?? ""} required />
        <Field
          label="State"
          name="province"
          defaultValue={address?.province ?? ""}
          required
        />
        <Field
          label="PIN code"
          name="postal_code"
          defaultValue={address?.postal_code ?? ""}
          inputMode="numeric"
          placeholder="6 digits"
          required
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-sale">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Continue to payment"}
      </Button>
    </form>
  )
}

export function CodPaymentForm({ total }: { total: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    placeCodOrder,
    undefined
  )

  return (
    <form action={action} className="space-y-4">
      <div className="rounded-card border border-line p-4">
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name="method"
            id="cod"
            defaultChecked
            className="mt-1"
          />
          <label htmlFor="cod" className="text-sm">
            <span className="font-medium">Cash on delivery</span>
            <span className="mt-0.5 block text-ink-muted">
              Pay the courier when your order arrives.
            </span>
          </label>
        </div>
      </div>

      <p className="text-xs text-ink-subtle">
        Online payment via Razorpay is coming next — cash on delivery is
        available today.
      </p>

      {state?.error && (
        <p role="alert" className="text-sm text-sale">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Placing order…" : `Place order · ${total}`}
      </Button>
    </form>
  )
}

function Field({
  label,
  name,
  ...props
}: {
  label: string
  name: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs text-ink-muted">
        {label}
      </label>
      <input id={name} name={name} className={field} {...props} />
    </div>
  )
}
