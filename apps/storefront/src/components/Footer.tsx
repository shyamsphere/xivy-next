import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-sunken">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-lg font-semibold tracking-tight">XIVY</p>
          <p className="mt-2 max-w-xs text-sm text-ink-muted">
            Premium cases and accessories in honest materials, at honest
            prices.
          </p>
        </div>

        <nav aria-label="Shop" className="text-sm">
          <p className="font-medium">Shop</p>
          <ul className="mt-3 space-y-2 text-ink-muted">
            <li>
              <Link href="/products" className="hover:text-ink">
                All products
              </Link>
            </li>
            <li>
              <Link href="/products?sort=newest" className="hover:text-ink">
                New arrivals
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="font-medium">Support</p>
          <ul className="mt-3 space-y-2 text-ink-muted">
            <li>
              <a href="mailto:support@xivy.in" className="hover:text-ink">
                support@xivy.in
              </a>
            </li>
            <li>Mumbai, Maharashtra, India</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line px-4 py-6 sm:px-6">
        <p className="mx-auto max-w-7xl text-xs text-ink-subtle">
          © {new Date().getFullYear()} ShyamSphere International. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}
