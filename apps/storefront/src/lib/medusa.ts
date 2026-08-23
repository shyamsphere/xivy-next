import Medusa from "@medusajs/js-sdk"
import type {
  Product,
  ProductCategory,
  ProductListResponse,
} from "./types"

/**
 * Server-side Medusa client. The publishable key stays on the server —
 * all storefront data flows through Server Components / server actions.
 */
export const medusa = new Medusa({
  baseUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: process.env.MEDUSA_PUBLISHABLE_KEY,
})

const PRODUCT_FIELDS = [
  "id",
  "title",
  "handle",
  "description",
  "thumbnail",
  "metadata",
  "*images",
  "*categories",
  "*variants",
  "*variants.calculated_price",
  "*variants.options",
  "+variants.inventory_quantity",
].join(",")

let cachedRegionId: string | null = null

/** The single India region seeded in the backend. */
export async function getRegionId(): Promise<string> {
  if (cachedRegionId) return cachedRegionId
  const { regions } = await medusa.client.fetch<{
    regions: { id: string; currency_code: string }[]
  }>("/store/regions")
  const india =
    regions.find((region) => region.currency_code === "inr") ?? regions[0]
  cachedRegionId = india.id
  return cachedRegionId
}

export type ProductQuery = {
  q?: string
  handle?: string
  category_id?: string
  id?: string[]
  order?: string
  limit?: number
  offset?: number
}

export async function listProducts(
  query: ProductQuery = {}
): Promise<ProductListResponse> {
  const region_id = await getRegionId()
  const search = new URLSearchParams({
    region_id,
    fields: PRODUCT_FIELDS,
    limit: String(query.limit ?? 24),
  })

  if (query.q) search.set("q", query.q)
  if (query.handle) search.set("handle", query.handle)
  if (query.category_id) search.set("category_id", query.category_id)
  if (query.order) search.set("order", query.order)
  if (query.offset) search.set("offset", String(query.offset))
  for (const id of query.id ?? []) search.append("id", id)

  return medusa.client.fetch<ProductListResponse>(
    `/store/products?${search.toString()}`
  )
}

export async function getProductByHandle(
  handle: string
): Promise<Product | null> {
  const { products } = await listProducts({ handle, limit: 1 })
  return products[0] ?? null
}

export async function listCategories(): Promise<ProductCategory[]> {
  const res = await medusa.client.fetch<{
    product_categories: ProductCategory[]
  }>("/store/product-categories?fields=id,name,handle")
  return res.product_categories ?? []
}

/** Cheapest variant price on a product, for card/listing display. */
export function productPrice(product: Product): number | null {
  const amounts = (product.variants ?? [])
    .map((variant) => variant.calculated_price?.calculated_amount)
    .filter((amount): amount is number => typeof amount === "number")
  return amounts.length ? Math.min(...amounts) : null
}

/** Strike-through MRP stored on product metadata at seed time. */
export function productMrp(product: Product): number | null {
  const mrp = product.metadata?.mrp
  return typeof mrp === "number" ? mrp : null
}

export function discountPercent(price: number, mrp: number): number {
  return Math.round(((mrp - price) / mrp) * 100)
}

export function inStock(product: Product): boolean {
  return (product.variants ?? []).some(
    (variant) => (variant.inventory_quantity ?? 0) > 0
  )
}
