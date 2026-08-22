/** DTOs returned by the commerce app's custom device-catalog store API. */

export type StoreDeviceBrand = {
  id: string
  name: string
  handle: string
  logo_url: string | null
  rank: number
}

export type StoreDeviceModel = {
  id: string
  name: string
  handle: string
  display_name: string | null
  release_year: number | null
}

export type StoreCompatibleProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
}
