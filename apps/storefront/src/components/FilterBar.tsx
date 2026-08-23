import Link from "next/link"
import type { DeviceGroup } from "./DevicePicker"

export type ShopParams = {
  q?: string
  device?: string
  category?: string
  sort?: string
}

const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "newest", label: "Newest" },
]

const href = (params: ShopParams, patch: Partial<ShopParams>) => {
  const merged = { ...params, ...patch }
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(merged)) {
    if (value) search.set(key, value)
  }
  const qs = search.toString()
  return qs ? `/products?${qs}` : "/products"
}

/**
 * Filters are plain links driving URL params, so the whole listing stays a
 * Server Component and every filtered view is shareable and crawlable.
 */
export function FilterBar({
  params,
  groups,
  categories,
}: {
  params: ShopParams
  groups: DeviceGroup[]
  categories: { id: string; name: string; handle: string }[]
}) {
  const models = groups.flatMap(({ brand, models }) =>
    models.map((model) => ({ brand, model }))
  )
  const active = [params.q, params.device, params.category].filter(Boolean)

  return (
    <div className="space-y-4 border-b border-line pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Chip href={href(params, { device: undefined })} active={!params.device}>
          All phones
        </Chip>
        {models.map(({ brand, model }) => (
          <Chip
            key={model.id}
            href={href(params, { device: model.handle })}
            active={params.device === model.handle}
          >
            {model.display_name ?? `${brand.name} ${model.name}`}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.length > 1 && (
            <>
              <Chip
                href={href(params, { category: undefined })}
                active={!params.category}
              >
                All types
              </Chip>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  href={href(params, { category: category.handle })}
                  active={params.category === category.handle}
                >
                  {category.name}
                </Chip>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm">
          <span className="text-ink-subtle">Sort</span>
          {SORTS.map((sort) => (
            <Link
              key={sort.key}
              href={href(params, { sort: sort.key })}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                (params.sort ?? "featured") === sort.key
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
              }`}
            >
              {sort.label}
            </Link>
          ))}
        </div>
      </div>

      {active.length > 0 && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-ink-muted">
            {params.q && (
              <>
                Searching <span className="text-ink">“{params.q}”</span>
              </>
            )}
          </span>
          <Link
            href="/products"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Clear all
          </Link>
        </div>
      )}
    </div>
  )
}

function Chip({
  href,
  active,
  children,
}: {
  href: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line-strong text-ink-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </Link>
  )
}
