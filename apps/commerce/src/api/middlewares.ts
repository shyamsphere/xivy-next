import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import {
  AdminAssignCompatibility,
  AdminCreateDeviceBrand,
  AdminCreateDeviceModel,
  AdminUpdateDeviceBrand,
  AdminUpdateDeviceModel,
} from "./admin/device-catalog/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/device-catalog/brands",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCreateDeviceBrand)],
    },
    {
      matcher: "/admin/device-catalog/brands/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateDeviceBrand)],
    },
    {
      matcher: "/admin/device-catalog/models",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCreateDeviceModel)],
    },
    {
      matcher: "/admin/device-catalog/models/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateDeviceModel)],
    },
    {
      matcher: "/admin/device-catalog/products/:id/devices",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminAssignCompatibility)],
    },
  ],
})
