import Image from "next/image"
import { ButtonLink } from "@/components/ui/Button"
import { DevicePicker } from "@/components/DevicePicker"
import { ProductCard } from "@/components/ProductCard"
import { TrustStrip } from "@/components/TrustStrip"
import { listBrandsWithModels } from "@/lib/devices"
import { listProducts } from "@/lib/medusa"

// Cached and revalidated rather than force-dynamic: nothing here depends on
// the request, so the page can be served from cache.
export const revalidate = 300

export default async function HomePage() {
  const groups = await listBrandsWithModels()

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-ink-subtle uppercase">
              Cases built for daily life
            </p>
            <h1 className="text-display mt-4 text-4xl font-semibold sm:text-5xl lg:text-6xl">
              Protection that
              <br />
              doesn&apos;t hide your phone.
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-muted">
              Slim, grippy and drop-tested cases in premium materials — priced
              honestly and delivered across India.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <DevicePicker groups={groups} trigger="cta" />
              <ButtonLink href="/products" variant="secondary" size="lg">
                Browse all
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-ink-subtle">
              Tell us your model and we&apos;ll only show what fits.
            </p>
          </div>

          <HeroImage />
        </div>
      </section>

      <TrustStrip />

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Best sellers
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Our most-loved covers this season.
            </p>
          </div>
          <ButtonLink href="/products" variant="ghost" size="sm">
            View all →
          </ButtonLink>
        </div>
        <FeaturedGrid />
      </section>

      {/* Editorial band */}
      <section className="border-t border-line bg-surface-sunken">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-display text-2xl font-semibold sm:text-3xl">
            We make the case we wanted to buy.
          </h2>
          <p className="mt-4 text-ink-muted">
            No inflated MRPs, no mystery plastics. Every XIVY case is specified
            for the phone it fits, tested against real drops, and priced at
            what it costs to make well.
          </p>
          <ButtonLink href="/products" className="mt-8" size="md">
            Shop the range
          </ButtonLink>
        </div>
      </section>
    </>
  )
}

/**
 * Products are fetched with a fallback because this page is prerendered at
 * build time, and CI builds run without a backend. In production the build
 * can reach the backend, so real data is baked in.
 */
async function safeProducts(limit: number) {
  try {
    const { products } = await listProducts({ limit })
    return products
  } catch {
    return []
  }
}

async function HeroImage() {
  const products = await safeProducts(1)
  const hero = products[0]
  if (!hero?.thumbnail) {
    return <div className="aspect-4/5 rounded-card bg-surface-sunken lg:aspect-square" />
  }
  return (
    <div className="relative aspect-4/5 overflow-hidden rounded-card bg-surface-sunken lg:aspect-square">
      <Image
        src={hero.thumbnail}
        alt={hero.title}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  )
}

async function FeaturedGrid() {
  const products = await safeProducts(4)

  if (products.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 2}
        />
      ))}
    </div>
  )
}
