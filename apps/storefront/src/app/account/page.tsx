import type { Metadata } from "next"
import { getCustomer } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  const customer = await getCustomer()

  return (
    <div className="rounded-card border border-line p-6">
      <h2 className="text-base font-medium">Profile</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <Row label="Name" value={customer?.first_name} />
        <Row label="Email" value={customer?.email} />
        <Row label="Mobile" value={customer?.phone} />
      </dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-ink-subtle">{label}</dt>
      <dd>{value || <span className="text-ink-subtle">Not set</span>}</dd>
    </div>
  )
}
