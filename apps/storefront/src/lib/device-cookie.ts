/**
 * Shared cookie name plus the browser-side reader. Kept out of
 * selected-device.ts because a "use server" module may only export async
 * functions.
 */
export const DEVICE_COOKIE = "xivy_device"
export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 180 // 180 days

export const readDeviceCookie = (): string | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${DEVICE_COOKIE}=([^;]*)`)
  )
  return match ? decodeURIComponent(match[1]) : null
}
