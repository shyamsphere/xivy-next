import { Module } from "@medusajs/framework/utils"
import DeviceCatalogModuleService from "./service"

export const DEVICE_CATALOG_MODULE = "device_catalog"

export default Module(DEVICE_CATALOG_MODULE, {
  service: DeviceCatalogModuleService,
})
