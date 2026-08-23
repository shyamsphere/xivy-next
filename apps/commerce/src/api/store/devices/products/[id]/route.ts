import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Device models a product is compatible with — powers the "fits these
 * phones" strip on the product page.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "device_models.id",
      "device_models.name",
      "device_models.handle",
      "device_models.display_name",
      "device_models.is_active",
      "device_models.brand.name",
      "device_models.brand.handle",
    ],
    filters: { id: req.params.id },
  })

  type LinkedDeviceModel = {
    id: string
    name: string
    handle: string
    display_name: string | null
    is_active?: boolean
    brand?: { name: string; handle: string } | null
  }

  const deviceModels = ((data?.[0]?.device_models ?? []) as (
    | LinkedDeviceModel
    | null
  )[])
    .filter(
      (model): model is LinkedDeviceModel => !!model && model.is_active !== false
    )
    .map(({ id, name, handle, display_name, brand }) => ({
      id,
      name,
      handle,
      display_name,
      brand,
    }))

  res.json({ device_models: deviceModels, count: deviceModels.length })
}
