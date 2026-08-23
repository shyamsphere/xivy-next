import type { Metadata } from "next"
import { getCustomer } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Addresses",
  robots: { index: false, follow: false },
}

export default async function AddressesPage() {
  const customer = await getCustomer()
  const addresses = customer?.addresses ?? []

  if (addresses.length === 0) {
    return (
      <div className="rounded-card border border-line p-10 text-center">
        <p className="font-medium">No saved addresses</p>
        <p className="mt-1 text-sm text-ink-muted">
          The address you use at checkout will be saved to your account.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {addresses.map((address) => (
        <li
          key={address.id}
          className="rounded-card border border-line p-5 text-sm"
        >
          <p className="font-medium">
            {[address.first_name, address.last_name].filter(Boolean).join(" ")}
          </p>
          <p className="mt-1 text-ink-muted">
            {address.address_1}, {address.city}, {address.province}{" "}
            {address.postal_code}
          </p>
          {address.phone && (
            <p className="text-ink-muted">{address.phone}</p>
          )}
        </li>
      ))}
    </ul>
  )
}
