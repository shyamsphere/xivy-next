"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { DEVICE_COOKIE, DEVICE_COOKIE_MAX_AGE } from "./device-cookie"

/**
 * Server actions for the remembered device.
 *
 * There is deliberately no server-side *read* helper for layouts or pages:
 * calling cookies() during render opts that route out of caching, and doing
 * it in the root layout would make every page on the site dynamic (which
 * also turns missing products into soft 404s). The picker reads the cookie
 * in the browser instead.
 */
export async function setSelectedDevice(handle: string) {
  const store = await cookies()
  store.set(DEVICE_COOKIE, handle, {
    httpOnly: false, // the picker reads this in the browser
    sameSite: "lax",
    maxAge: DEVICE_COOKIE_MAX_AGE,
    path: "/",
  })
  revalidatePath("/products")
}

export async function clearSelectedDevice() {
  const store = await cookies()
  store.delete(DEVICE_COOKIE)
  revalidatePath("/products")
}
