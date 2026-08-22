import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { DEVICE_CATALOG_MODULE } from "../../../../../../modules/device-catalog"
import type DeviceCatalogModuleService from "../../../../../../modules/device-catalog/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )
  const handle = req.params.handle

  const [brand] = await deviceCatalog.listDeviceBrands(
    { handle, is_active: true },
    { select: ["id", "name", "handle"] }
  )

  if (!brand) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Device brand with handle "${handle}" not found`
    )
  }

  const models = await deviceCatalog.listDeviceModels(
    { brand_id: brand.id, is_active: true },
    {
      select: ["id", "name", "handle", "display_name", "release_year"],
      order: { release_year: "DESC", name: "ASC" },
    }
  )

  res.json({ brand, models })
}
