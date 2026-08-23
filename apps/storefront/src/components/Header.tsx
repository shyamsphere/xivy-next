import Link from "next/link"
import { listBrandsWithModels } from "@/lib/devices"
import { CartDrawer } from "./CartDrawer"
import { DevicePicker } from "./DevicePicker"
import { SearchField } from "./SearchField"

/**
 * Server component, but deliberately free of cookies()/headers(): this sits
 * in the root layout, so reading request state here would opt every route on
 * the site out of caching. The device catalog it fetches is cached for an
 * hour; the visitor's own device selection is read client-side by the picker.
 */
export async function Header() {
  const groups = await listBrandsWithModels()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight"
          aria-label="XIVY home"
        >
          XIVY
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link
            href="/products"
            className="rounded-full px-3 py-2 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Shop
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchField className="hidden sm:block" />
          <div className="hidden md:block">
            <DevicePicker groups={groups} />
          </div>
          <CartDrawer />
        </div>
      </div>

      {/* Device picker gets its own row on small screens rather than hiding */}
      <div className="border-t border-line px-4 py-2 md:hidden">
        <DevicePicker groups={groups} />
      </div>
    </header>
  )
}
