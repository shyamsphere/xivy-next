import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DEVICE_CATALOG_MODULE } from "../../../../modules/device-catalog"
import type DeviceCatalogModuleService from "../../../../modules/device-catalog/service"
import { toHandle } from "../../../../modules/device-catalog/utils"
import type { AdminCreateDeviceModelType } from "../validators"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )
  const q = typeof req.query.q === "string" ? req.query.q : undefined
  const brandId =
    typeof req.query.brand_id === "string" ? req.query.brand_id : undefined

  const filters: Record<string, unknown> = {}
  if (q) filters.name = { $ilike: `%${q}%` }
  if (brandId) filters.brand_id = brandId

  const [models, count] = await deviceCatalog.listAndCountDeviceModels(
    filters,
    {
      relations: ["brand"],
      order: { name: "ASC" },
    }
  )

  res.json({ models, count })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateDeviceModelType>,
  res: MedusaResponse
) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )
  const { brand_id, aliases, ...rest } = req.validatedBody

  const brand = await deviceCatalog.retrieveDeviceBrand(brand_id)

  const deviceModel = await deviceCatalog.createDeviceModels({
    ...rest,
    aliases: (aliases ?? null) as Record<string, unknown> | null,
    handle: rest.handle || toHandle(`${brand.name} ${rest.name}`),
    brand_id,
  })

  res.status(201).json({ device_model: deviceModel })
}
