import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DEVICE_CATALOG_MODULE } from "../../../../modules/device-catalog"
import type DeviceCatalogModuleService from "../../../../modules/device-catalog/service"
import { toHandle } from "../../../../modules/device-catalog/utils"
import type { AdminCreateDeviceBrandType } from "../validators"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )
  const q = typeof req.query.q === "string" ? req.query.q : undefined

  const [brands, count] = await deviceCatalog.listAndCountDeviceBrands(
    q ? { name: { $ilike: `%${q}%` } } : {},
    { order: { rank: "ASC", name: "ASC" } }
  )

  res.json({ brands, count })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateDeviceBrandType>,
  res: MedusaResponse
) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )

  const brand = await deviceCatalog.createDeviceBrands({
    ...req.validatedBody,
    handle: req.validatedBody.handle || toHandle(req.validatedBody.name),
  })

  res.status(201).json({ brand })
}
