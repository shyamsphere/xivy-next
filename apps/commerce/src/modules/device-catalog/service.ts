import { MedusaService } from "@medusajs/framework/utils"
import DeviceBrand from "./models/device-brand"
import DeviceModel from "./models/device-model"

class DeviceCatalogModuleService extends MedusaService({
  DeviceBrand,
  DeviceModel,
}) {}

export default DeviceCatalogModuleService
