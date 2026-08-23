/**
 * Storefront-facing shapes for what the Medusa Store API returns.
 *
 * Declared here rather than imported from `@medusajs/types` on purpose: that
 * package sits in the backend's dependency graph (React 18, hoisted for the
 * admin bundle), and pulling it into this app's compilation produces two
 * conflicting React type identities. The storefront only consumes HTTP JSON,
 * so structural types are the honest boundary.
 */

export type Money = {
  calculated_amount?: number | null
  original_amount?: number | null
}

export type ProductImage = {
  id?: string
  url: string
}

export type ProductVariant = {
  id: string
  title?: string | null
  sku?: string | null
  inventory_quantity?: number | null
  calculated_price?: Money | null
  options?: { id?: string; value?: string; option_id?: string }[] | null
}

export type ProductCategory = {
  id: string
  name: string
  handle: string
}

export type Product = {
  id: string
  title: string
  handle: string
  description?: string | null
  thumbnail?: string | null
  metadata?: Record<string, unknown> | null
  images?: ProductImage[] | null
  categories?: ProductCategory[] | null
  variants?: ProductVariant[] | null
}

export type ProductListResponse = {
  products: Product[]
  count: number
  offset: number
  limit: number
}
