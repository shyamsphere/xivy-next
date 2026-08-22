import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DEVICE_CATALOG_MODULE } from "../../../../../modules/device-catalog"
import type DeviceCatalogModuleService from "../../../../../modules/device-catalog/service"
import type { AdminUpdateDeviceBrandType } from "../../validators"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )
  const brand = await deviceCatalog.retrieveDeviceBrand(req.params.id, {
    relations: ["models"],
  })
  res.json({ brand })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateDeviceBrandType>,
  res: MedusaResponse
) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )
  const brand = await deviceCatalog.updateDeviceBrands({
    id: req.params.id,
    ...req.validatedBody,
  })
  res.json({ brand })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )
  await deviceCatalog.deleteDeviceBrands(req.params.id)
  res.json({ id: req.params.id, object: "device_brand", deleted: true })
}
