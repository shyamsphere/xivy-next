import Link from "next/link"
import { redirect } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { getCustomer } from "@/lib/auth"

export const dynamic = "force-dynamic"

const NAV = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
]

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await getCustomer()
  if (!customer) redirect("/login")

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-display text-3xl font-semibold">My account</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-[180px_1fr]">
        <nav aria-label="Account" className="text-sm">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>{children}</div>
      </div>
    </div>
  )
}
