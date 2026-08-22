import { model } from "@medusajs/framework/utils"
import DeviceBrand from "./device-brand"

const DeviceModel = model
  .define("device_model", {
    id: model.id({ prefix: "devmo" }).primaryKey(),
    name: model.text().searchable(),
    handle: model.text().unique(),
    // override for display; else "{brand.name} {name}"
    display_name: model.text().nullable(),
    release_year: model.number().nullable(),
    // alternative names/model numbers for search, e.g. ["S24 Ultra", "SM-S928"]
    aliases: model.json().nullable(),
    is_active: model.boolean().default(true),
    brand: model.belongsTo(() => DeviceBrand, { mappedBy: "models" }),
  })
  .indexes([{ on: ["brand_id", "name"], unique: true }])

export default DeviceModel
