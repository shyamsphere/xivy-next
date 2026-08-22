import { readFileSync } from "fs"
import { join } from "path"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DEVICE_CATALOG_MODULE } from "../modules/device-catalog"
import type DeviceCatalogModuleService from "../modules/device-catalog/service"
import { toHandle } from "../modules/device-catalog/utils"

type DeviceSeed = {
  brands: {
    name: string
    rank?: number
    models: { name: string; release_year?: number; aliases?: string[] }[]
  }[]
}

/**
 * Idempotent device-catalog seed: makes the catalog match data/devices.json.
 * Upserts everything listed there, then removes anything that isn't — so
 * trimming the JSON actually shrinks the catalog. Models that still have
 * products linked to them are never deleted; they're reported instead.
 *
 * Run with: npx medusa exec ./src/scripts/seed-devices.ts
 */
export default async function seedDevices({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const deviceCatalog: DeviceCatalogModuleService = container.resolve(
    DEVICE_CATALOG_MODULE
  )

  const raw = readFileSync(join(process.cwd(), "data", "devices.json"), "utf8")
  const seed: DeviceSeed = JSON.parse(raw)

  let brandsCreated = 0
  let modelsCreated = 0
  let modelsUpdated = 0
  const wantedBrandHandles = new Set<string>()
  const wantedModelHandles = new Set<string>()

  for (const brandSeed of seed.brands) {
    const brandHandle = toHandle(brandSeed.name)
    wantedBrandHandles.add(brandHandle)

    let [brand] = await deviceCatalog.listDeviceBrands({ handle: brandHandle })
    if (!brand) {
      brand = await deviceCatalog.createDeviceBrands({
        name: brandSeed.name,
        handle: brandHandle,
        rank: brandSeed.rank ?? 0,
      })
      brandsCreated++
    }

    for (const modelSeed of brandSeed.models) {
      // brand prefix keeps handles unique across brands (e.g. two "13"s)
      const modelHandle = toHandle(
        modelSeed.name.toLowerCase().startsWith(brandSeed.name.toLowerCase())
          ? modelSeed.name
          : `${brandSeed.name} ${modelSeed.name}`
      )
      wantedModelHandles.add(modelHandle)

      const [existing] = await deviceCatalog.listDeviceModels({
        handle: modelHandle,
      })

      if (existing) {
        // Correct drift in place so the handle — and any product
        // compatibility links pointing at it — survive.
        if (
          existing.name !== modelSeed.name ||
          existing.release_year !== (modelSeed.release_year ?? null)
        ) {
          await deviceCatalog.updateDeviceModels({
            id: existing.id,
            name: modelSeed.name,
            release_year: modelSeed.release_year ?? null,
          })
          modelsUpdated++
        }
        continue
      }

      await deviceCatalog.createDeviceModels({
        name: modelSeed.name,
        handle: modelHandle,
        release_year: modelSeed.release_year ?? null,
        aliases: (modelSeed.aliases ?? null) as Record<string, unknown> | null,
        brand_id: brand.id,
      })
      modelsCreated++
    }
  }

  // ── Prune anything no longer listed in devices.json ──────────────────
  const staleModels = (await deviceCatalog.listDeviceModels({})).filter(
    (model) => !wantedModelHandles.has(model.handle)
  )

  let modelsDeleted = 0
  const keptForLinks: string[] = []

  for (const model of staleModels) {
    const { data } = await query.graph({
      entity: "device_model",
      fields: ["id", "products.id"],
      filters: { id: model.id },
    })
    const linkedProducts = (data?.[0]?.products ?? []).filter(Boolean)

    // Never orphan a compatibility link — report it and let a human decide.
    if (linkedProducts.length) {
      keptForLinks.push(`${model.handle} (${linkedProducts.length} products)`)
      continue
    }

    await deviceCatalog.deleteDeviceModels(model.id)
    modelsDeleted++
  }

  // Brands go only once they have no models left.
  let brandsDeleted = 0
  for (const brand of await deviceCatalog.listDeviceBrands({})) {
    if (wantedBrandHandles.has(brand.handle)) continue
    const remaining = await deviceCatalog.listDeviceModels({
      brand_id: brand.id,
    })
    if (remaining.length) continue
    await deviceCatalog.deleteDeviceBrands(brand.id)
    brandsDeleted++
  }

  logger.info(
    `Device catalog synced with devices.json: +${brandsCreated} brands, +${modelsCreated} models, ~${modelsUpdated} models updated, -${brandsDeleted} brands, -${modelsDeleted} models.`
  )
  if (keptForLinks.length) {
    logger.warn(
      `Kept ${keptForLinks.length} model(s) absent from devices.json because products are still linked: ${keptForLinks.join(", ")}`
    )
  }
}
