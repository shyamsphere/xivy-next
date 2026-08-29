import Image from "next/image"
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
        <Link href="/" aria-label="XIVY home" className="shrink-0">
          {/* Trimmed to the mark's bounds with the background keyed out, so
              it sits flush against the header rather than in a grey box. */}
          <Image
            src="/logo.png"
            alt="XIVY"
            width={254}
            height={84}
            priority
            className="h-6 w-auto sm:h-7"
          />
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
          <Link
            href="/account"
            aria-label="Account"
            title="Account"
            className="hidden size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink sm:inline-flex"
          >
            <AccountIcon />
          </Link>
          <CartDrawer />
        </div>
      </div>

      {/* Device picker gets its own row on small screens rather than hiding */}
      <div className="flex items-center gap-2 border-t border-line px-4 py-2 md:hidden">
        <DevicePicker groups={groups} />
        <Link
          href="/account"
          aria-label="Account"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <AccountIcon />
        </Link>
      </div>
    </header>
  )
}

function AccountIcon() {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="8.5" r="3.75" />
      <path
        strokeLinecap="round"
        d="M4.5 20.25a7.5 7.5 0 0 1 15 0"
      />
    </svg>
  )
}
