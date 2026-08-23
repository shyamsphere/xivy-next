import { medusa } from "./medusa"

export type DeviceBrand = {
  id: string
  name: string
  handle: string
  logo_url: string | null
  rank: number
}

export type DeviceModel = {
  id: string
  name: string
  handle: string
  display_name: string | null
  release_year: number | null
}

export type CompatibleProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
}

/**
 * Xivy's custom device-catalog endpoints. The catalog changes rarely, so
 * these are cached for an hour rather than fetched per request.
 */
const REVALIDATE = { next: { revalidate: 3600 } }

export async function listBrands(): Promise<DeviceBrand[]> {
  // Degrades to an empty picker rather than failing the page: this is called
  // from the root layout, which is prerendered at build time (when no
  // backend is reachable in CI) and rendered on every request in production.
  try {
    const res = await medusa.client.fetch<{ brands: DeviceBrand[] }>(
      "/store/devices/brands",
      { next: REVALIDATE.next }
    )
    return res.brands ?? []
  } catch {
    return []
  }
}

export async function listModels(
  brandHandle: string
): Promise<{ brand: DeviceBrand; models: DeviceModel[] } | null> {
  try {
    return await medusa.client.fetch(
      `/store/devices/brands/${brandHandle}/models`,
      { next: REVALIDATE.next }
    )
  } catch {
    return null
  }
}

export async function getCompatibleProducts(modelHandle: string): Promise<{
  device_model: DeviceModel & { brand?: { name: string; handle: string } }
  products: CompatibleProduct[]
  count: number
} | null> {
  try {
    return await medusa.client.fetch(
      `/store/devices/models/${modelHandle}/products`,
      { next: REVALIDATE.next }
    )
  } catch {
    return null
  }
}

export type ProductDeviceModel = DeviceModel & {
  brand?: { name: string; handle: string } | null
}

/** Devices a product fits — the "compatible with" strip on the PDP. */
export async function getProductDevices(
  productId: string
): Promise<ProductDeviceModel[]> {
  try {
    const res = await medusa.client.fetch<{
      device_models: ProductDeviceModel[]
    }>(`/store/devices/products/${productId}`, { next: REVALIDATE.next })
    return res.device_models ?? []
  } catch {
    return []
  }
}

/** Every brand with its models — powers the picker in one round trip. */
export async function listBrandsWithModels(): Promise<
  { brand: DeviceBrand; models: DeviceModel[] }[]
> {
  const brands = await listBrands()
  const results = await Promise.all(
    brands.map(async (brand) => {
      const res = await listModels(brand.handle)
      return { brand, models: res?.models ?? [] }
    })
  )
  return results.filter((entry) => entry.models.length > 0)
}

export const deviceLabel = (model: DeviceModel, brandName?: string): string =>
  model.display_name ?? [brandName, model.name].filter(Boolean).join(" ")
