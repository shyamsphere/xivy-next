import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

/**
 * Products compatible with a device model. Returns lightweight product data;
 * the storefront hydrates pricing/inventory via the standard
 * GET /store/products?id[]=... endpoint so sales-channel and region rules
 * are always applied by core logic.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const handle = req.params.handle

  const { data } = await query.graph({
    entity: "device_model",
    fields: [
      "id",
      "name",
      "handle",
      "display_name",
      "brand.name",
      "brand.handle",
      "products.id",
      "products.title",
      "products.handle",
      "products.thumbnail",
      "products.status",
    ],
    filters: { handle },
  })

  const deviceModel = data?.[0]

  if (!deviceModel || deviceModel.is_active === false) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Device model with handle "${handle}" not found`
    )
  }

  const products = (deviceModel.products ?? [])
    .filter((product: any) => product && product.status === "published")
    .map(({ id, title, handle: productHandle, thumbnail }: any) => ({
      id,
      title,
      handle: productHandle,
      thumbnail,
    }))

  res.json({
    device_model: {
      id: deviceModel.id,
      name: deviceModel.name,
      handle: deviceModel.handle,
      display_name: deviceModel.display_name,
      brand: deviceModel.brand,
    },
    products,
    count: products.length,
  })
}
