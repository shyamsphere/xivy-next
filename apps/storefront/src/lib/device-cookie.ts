/**
 * The remembered device, shared between server actions and browser code.
 *
 * Both the handle (used for `?device=` filtering) and the model name are
 * stored, because product cards need the name to pick the matching variant —
 * variant titles are the device option values. Reading this on the server
 * during render would opt routes out of caching, so cards resolve it in the
 * browser after mount.
 */
export const DEVICE_COOKIE = "xivy_device"
export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 180 // 180 days

export type SelectedDevice = { handle: string; label: string | null }

/**
 * Stored as plain JSON: the cookie serializer percent-encodes the value on
 * the way out, and pre-encoding here produced a double-encoded cookie that
 * no single decode could parse.
 */
export const encodeDevice = (handle: string, label?: string | null): string =>
  JSON.stringify({ h: handle, l: label ?? null })

export const decodeDevice = (raw: string | undefined): SelectedDevice | null => {
  if (!raw) return null

  // Tolerant of raw JSON, one round of encoding, or a legacy bare handle.
  const candidates = [raw]
  try {
    candidates.push(decodeURIComponent(raw))
  } catch {
    // malformed escape — fall through
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed.h === "string") {
        return { handle: parsed.h, label: parsed.l ?? null }
      }
    } catch {
      // not this one
    }
  }

  return { handle: raw, label: null }
}

export const readDeviceCookie = (): SelectedDevice | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${DEVICE_COOKIE}=([^;]*)`)
  )
  return decodeDevice(match?.[1])
}
