import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DEVICE_CATALOG_MODULE } from "../../../../../modules/device-catalog"
import type DeviceCatalogModuleService from "../../../../../modules/device-catalog/service"
import type { AdminUpdateDeviceModelType } from "../../validators"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )
  const deviceModel = await deviceCatalog.retrieveDeviceModel(req.params.id, {
    relations: ["brand"],
  })
  res.json({ device_model: deviceModel })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateDeviceModelType>,
  res: MedusaResponse
) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )
  const { aliases, ...rest } = req.validatedBody
  const deviceModel = await deviceCatalog.updateDeviceModels({
    id: req.params.id,
    ...rest,
    ...(aliases !== undefined
      ? { aliases: aliases as unknown as Record<string, unknown> | null }
      : {}),
  })
  res.json({ device_model: deviceModel })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )
  await deviceCatalog.deleteDeviceModels(req.params.id)
  res.json({ id: req.params.id, object: "device_model", deleted: true })
}
