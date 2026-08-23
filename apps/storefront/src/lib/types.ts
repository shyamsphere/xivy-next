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

export type Address = {
  id?: string
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

export type LineItem = {
  id: string
  title: string
  subtitle?: string | null
  thumbnail?: string | null
  quantity: number
  unit_price: number
  total?: number
  variant_id?: string | null
  product_handle?: string | null
  variant?: { id: string; title?: string | null; sku?: string | null } | null
  product?: { handle?: string | null; title?: string | null } | null
}

export type ShippingMethod = {
  id: string
  name?: string | null
  amount: number
}

export type Cart = {
  id: string
  email?: string | null
  currency_code?: string
  subtotal?: number
  item_subtotal?: number
  item_total?: number
  shipping_total?: number
  tax_total?: number
  total?: number
  items?: LineItem[] | null
  shipping_address?: Address | null
  billing_address?: Address | null
  shipping_methods?: ShippingMethod[] | null
  payment_collection?: { id: string } | null
}

export type Order = {
  id: string
  display_id?: number
  email?: string | null
  status?: string
  currency_code?: string
  subtotal?: number
  shipping_total?: number
  tax_total?: number
  total?: number
  created_at?: string
  items?: LineItem[] | null
  shipping_address?: Address | null
  payment_status?: string
  fulfillment_status?: string
}

export type Customer = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  addresses?: Address[] | null
}
