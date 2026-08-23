import type { Product } from "./types"
import { productPrice, inStock } from "./medusa"

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

/** Product + Offer structured data for rich results on the PDP. */
export function productJsonLd(product: Product) {
  const price = productPrice(product)

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: (product.images ?? [])
      .map((image) => image.url)
      .filter(Boolean)
      .slice(0, 5),
    sku: product.variants?.[0]?.sku ?? undefined,
    brand: { "@type": "Brand", name: "XIVY" },
    url: `${BASE_URL}/products/${product.handle}`,
    ...(price !== null && {
      offers: {
        "@type": "Offer",
        price,
        priceCurrency: "INR",
        availability: inStock(product)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: `${BASE_URL}/products/${product.handle}`,
      },
    }),
  }
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${BASE_URL}${crumb.path}`,
    })),
  }
}
