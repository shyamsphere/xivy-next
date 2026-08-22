import { model } from "@medusajs/framework/utils"
import DeviceModel from "./device-model"

const DeviceBrand = model.define("device_brand", {
  id: model.id({ prefix: "devbr" }).primaryKey(),
  name: model.text().searchable(),
  handle: model.text().unique(),
  logo_url: model.text().nullable(),
  // sort order in the storefront phone picker
  rank: model.number().default(0),
  is_active: model.boolean().default(true),
  models: model.hasMany(() => DeviceModel, { mappedBy: "brand" }),
})

export default DeviceBrand
