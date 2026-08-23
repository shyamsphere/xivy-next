import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/JsonLd"
import { ProductGallery } from "@/components/ProductGallery"
import { VariantPicker } from "@/components/VariantPicker"
import { getProductDevices } from "@/lib/devices"
import { formatINR } from "@/lib/format"
import {
  getProductByHandle,
  listProducts,
  productMrp,
  productPrice,
  discountPercent,
} from "@/lib/medusa"
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo"

// ISR rather than force-dynamic. A force-dynamic page streams its shell
// before notFound() runs, which commits a 200 status and turns missing
// products into soft 404s; a buffered ISR render can still set 404.
export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

/**
 * Prerenders the known products. Unknown slugs still render on demand
 * (dynamicParams defaults to true) so newly added products appear without a
 * rebuild. Degrades to an empty list when no backend is reachable, which is
 * the case during CI builds.
 */
export async function generateStaticParams() {
  try {
    const { products } = await listProducts({ limit: 100 })
    return products.map((product) => ({ slug: product.handle }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductByHandle(slug)
  if (!product) return { title: "Product not found" }

  const price = productPrice(product)
  const description =
    product.description ??
    `Buy the ${product.title} from XIVY. Free delivery over ₹999 across India.`

  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      type: "website",
      title: product.title,
      description,
      images: product.thumbnail ? [{ url: product.thumbnail }] : [],
    },
    other: price !== null ? { "product:price:amount": String(price) } : {},
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductByHandle(slug)
  if (!product) notFound()

  const devices = await getProductDevices(product.id)
  const price = productPrice(product)
  const mrp = productMrp(product)
  const variants = product.variants ?? []
  const images = (product.images ?? []).map((image) => ({
    id: image.id,
    url: image.url,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/products" },
          { name: product.title, path: `/products/${product.handle}` },
        ])}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-subtle">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span aria-hidden> / </span>
        <Link href="/products" className="hover:text-ink">
          Shop
        </Link>
        <span aria-hidden> / </span>
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={images} alt={product.title} />

        <div>
          <h1 className="text-display text-3xl font-semibold sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-3 flex items-baseline gap-3">
            {price !== null && (
              <span className="text-xl font-medium">{formatINR(price)}</span>
            )}
            {mrp !== null && price !== null && mrp > price && (
              <>
                <span className="text-ink-subtle line-through">
                  {formatINR(mrp)}
                </span>
                <span className="rounded-full bg-sale/10 px-2 py-0.5 text-xs font-medium text-sale">
                  Save {discountPercent(price, mrp)}%
                </span>
              </>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-ink-muted">
            {product.description}
          </p>

          {variants.length > 0 && <VariantPicker variants={variants} />}

          {devices.length > 0 && (
            <div className="mt-10 border-t border-line pt-6">
              <h2 className="text-sm font-medium">Fits these phones</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {devices.map((device) => (
                  <Link
                    key={device.id}
                    href={`/products?device=${device.handle}`}
                    className="rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    {device.display_name ??
                      [device.brand?.name, device.name]
                        .filter(Boolean)
                        .join(" ")}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <dl className="mt-8 space-y-2 border-t border-line pt-6 text-sm">
            <div className="flex gap-2">
              <dt className="text-ink-subtle">Delivery</dt>
              <dd>Free over ₹999, otherwise ₹49 · 3–7 days</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-subtle">Payment</dt>
              <dd>Cash on delivery available</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
