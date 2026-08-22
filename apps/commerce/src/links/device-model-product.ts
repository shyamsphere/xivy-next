import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import DeviceCatalogModule from "../modules/device-catalog"

/**
 * Many-to-many compatibility link: a product (case) fits several device
 * models; a device model has many compatible products. Core products never
 * depend on device data — products without links are simply generic.
 */
export default defineLink(
  { linkable: DeviceCatalogModule.linkable.deviceModel, isList: true },
  { linkable: ProductModule.linkable.product, isList: true }
)
