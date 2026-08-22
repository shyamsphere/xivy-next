import { z } from "zod"

export const AdminCreateDeviceBrand = z.object({
  name: z.string().min(1),
  handle: z.string().min(1).optional(),
  logo_url: z.string().url().nullish(),
  rank: z.number().int().optional(),
  is_active: z.boolean().optional(),
})
export type AdminCreateDeviceBrandType = z.infer<typeof AdminCreateDeviceBrand>

export const AdminUpdateDeviceBrand = AdminCreateDeviceBrand.partial()
export type AdminUpdateDeviceBrandType = z.infer<typeof AdminUpdateDeviceBrand>

export const AdminCreateDeviceModel = z.object({
  brand_id: z.string().min(1),
  name: z.string().min(1),
  handle: z.string().min(1).optional(),
  display_name: z.string().nullish(),
  release_year: z.number().int().nullish(),
  aliases: z.array(z.string()).nullish(),
  is_active: z.boolean().optional(),
})
export type AdminCreateDeviceModelType = z.infer<typeof AdminCreateDeviceModel>

export const AdminUpdateDeviceModel = AdminCreateDeviceModel.omit({
  brand_id: true,
}).partial()
export type AdminUpdateDeviceModelType = z.infer<typeof AdminUpdateDeviceModel>

export const AdminAssignCompatibility = z.object({
  add: z.array(z.string()).default([]),
  remove: z.array(z.string()).default([]),
})
export type AdminAssignCompatibilityType = z.infer<
  typeof AdminAssignCompatibility
>
