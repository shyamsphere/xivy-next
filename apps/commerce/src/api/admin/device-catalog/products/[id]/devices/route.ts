import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { assignDeviceCompatibilityWorkflow } from "../../../../../../workflows/assign-device-compatibility"
import type { AdminAssignCompatibilityType } from "../../../validators"

/** Device models linked to a product (used by the product-page widget). */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "device_models.id",
      "device_models.name",
      "device_models.handle",
      "device_models.display_name",
      "device_models.brand.id",
      "device_models.brand.name",
    ],
    filters: { id: req.params.id },
  })

  const deviceModels = (data?.[0]?.device_models ?? []).filter(Boolean)
  res.json({ device_models: deviceModels, count: deviceModels.length })
}

/** Assign/unassign compatible device models for a product. */
export async function POST(
  req: AuthenticatedMedusaRequest<AdminAssignCompatibilityType>,
  res: MedusaResponse
) {
  const productId = req.params.id
  const { add, remove } = req.validatedBody

  await assignDeviceCompatibilityWorkflow(req.scope).run({
    input: {
      add: add.map((device_model_id) => ({
        device_model_id,
        product_id: productId,
      })),
      remove: remove.map((device_model_id) => ({
        device_model_id,
        product_id: productId,
      })),
    },
  })

  res.json({ product_id: productId, added: add, removed: remove })
}
