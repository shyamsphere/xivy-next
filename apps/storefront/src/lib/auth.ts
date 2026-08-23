import { cookies } from "next/headers"
import { medusa } from "./medusa"
import { AUTH_COOKIE, COOKIE_MAX_AGE } from "./cart-cookie"
import type { Customer, Order } from "./types"

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(AUTH_COOKIE)?.value ?? null
}

export async function setToken(token: string) {
  ;(await cookies()).set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
}

export async function clearToken() {
  ;(await cookies()).delete(AUTH_COOKIE)
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken()
  return token ? { authorization: `Bearer ${token}` } : {}
}

/** The signed-in customer, or null. */
export async function getCustomer(): Promise<Customer | null> {
  const token = await getToken()
  if (!token) return null
  try {
    const { customer } = await medusa.client.fetch<{ customer: Customer }>(
      "/store/customers/me?fields=*addresses",
      { headers: await authHeaders(), cache: "no-store" }
    )
    return customer
  } catch {
    return null
  }
}

export async function listOrders(): Promise<Order[]> {
  const token = await getToken()
  if (!token) return []
  try {
    const { orders } = await medusa.client.fetch<{ orders: Order[] }>(
      "/store/orders?order=-created_at&fields=*items,*shipping_address",
      { headers: await authHeaders(), cache: "no-store" }
    )
    return orders ?? []
  } catch {
    return []
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const { order } = await medusa.client.fetch<{ order: Order }>(
      `/store/orders/${id}?fields=*items,*shipping_address`,
      { headers: await authHeaders(), cache: "no-store" }
    )
    return order
  } catch {
    return null
  }
}

/** Exchanges email/password for a customer JWT. */
export async function authenticate(
  email: string,
  password: string
): Promise<string> {
  const res = await medusa.client.fetch<{ token: string } | string>(
    "/auth/customer/emailpass",
    { method: "POST", body: { email, password } }
  )
  return typeof res === "string" ? res : res.token
}

export async function registerIdentity(
  email: string,
  password: string
): Promise<string> {
  const res = await medusa.client.fetch<{ token: string } | string>(
    "/auth/customer/emailpass/register",
    { method: "POST", body: { email, password } }
  )
  return typeof res === "string" ? res : res.token
}

export async function createCustomer(
  token: string,
  data: { email: string; first_name?: string; last_name?: string; phone?: string }
) {
  return medusa.client.fetch<{ customer: Customer }>("/store/customers", {
    method: "POST",
    body: data,
    headers: { authorization: `Bearer ${token}` },
  })
}

/**
 * The token from .../register is not yet bound to a customer — using it
 * against /store/customers/me returns 401, which would bounce a brand new
 * signup straight back to the login page. Refreshing after the customer
 * record exists returns a token that carries the customer identity.
 */
export async function refreshToken(token: string): Promise<string> {
  const res = await medusa.client.fetch<{ token: string } | string>(
    "/auth/token/refresh",
    { method: "POST", headers: { authorization: `Bearer ${token}` } }
  )
  return typeof res === "string" ? res : res.token
}
