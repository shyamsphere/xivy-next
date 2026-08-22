import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DEVICE_CATALOG_MODULE } from "../../../../modules/device-catalog"
import type DeviceCatalogModuleService from "../../../../modules/device-catalog/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const deviceCatalog: DeviceCatalogModuleService = req.scope.resolve(
    DEVICE_CATALOG_MODULE
  )

  const brands = await deviceCatalog.listDeviceBrands(
    { is_active: true },
    {
      select: ["id", "name", "handle", "logo_url", "rank"],
      order: { rank: "ASC", name: "ASC" },
    }
  )

  res.json({ brands })
}
