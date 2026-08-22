import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import {
  createRemoteLinkStep,
  dismissRemoteLinkStep,
} from "@medusajs/medusa/core-flows"
import { DEVICE_CATALOG_MODULE } from "../modules/device-catalog"

export type CompatibilityPair = {
  device_model_id: string
  product_id: string
}

export type AssignDeviceCompatibilityInput = {
  add?: CompatibilityPair[]
  remove?: CompatibilityPair[]
}

const toLinks = (pairs: CompatibilityPair[]) =>
  pairs.map((pair) => ({
    [DEVICE_CATALOG_MODULE]: { device_model_id: pair.device_model_id },
    [Modules.PRODUCT]: { product_id: pair.product_id },
  }))

/**
 * Creates/removes device-model ↔ product compatibility links. Used by the
 * admin routes (product widget + device catalog page) and bulk import.
 */
export const assignDeviceCompatibilityWorkflow = createWorkflow(
  "assign-device-compatibility",
  (input: AssignDeviceCompatibilityInput) => {
    const linksToCreate = transform({ input }, ({ input }) =>
      toLinks(input.add ?? [])
    )
    const linksToDismiss = transform({ input }, ({ input }) =>
      toLinks(input.remove ?? [])
    )

    createRemoteLinkStep(linksToCreate)
    dismissRemoteLinkStep(linksToDismiss)

    return new WorkflowResponse(input)
  }
)
