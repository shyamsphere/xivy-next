import { cookies } from "next/headers"
import { medusa, getRegionId } from "./medusa"
import { CART_COOKIE, AUTH_COOKIE, COOKIE_MAX_AGE } from "./cart-cookie"
import type { Cart } from "./types"

const CART_FIELDS = [
  "id",
  "email",
  "currency_code",
  "subtotal",
  "shipping_total",
  "tax_total",
  "total",
  "item_subtotal",
  "item_total",
  "*items",
  "*items.variant",
  "*items.product",
  "*shipping_address",
  "*billing_address",
  "*shipping_methods",
  "*payment_collection",
].join(",")

/** Customer JWT, when signed in — carts get attached to the account. */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value
  return token ? { authorization: `Bearer ${token}` } : {}
}

export async function getCartId(): Promise<string | null> {
  return (await cookies()).get(CART_COOKIE)?.value ?? null
}

async function setCartId(id: string) {
  ;(await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
}

export async function clearCartId() {
  ;(await cookies()).delete(CART_COOKIE)
}

/** The current cart, or null when there isn't one yet. */
export async function getCart(): Promise<Cart | null> {
  const id = await getCartId()
  if (!id) return null
  try {
    const { cart } = await medusa.client.fetch<{ cart: Cart }>(
      `/store/carts/${id}?fields=${encodeURIComponent(CART_FIELDS)}`,
      { headers: await getAuthHeaders(), cache: "no-store" }
    )
    return cart
  } catch {
    // Stale or completed cart — drop the cookie so a fresh one is made.
    await clearCartId()
    return null
  }
}

export async function getOrCreateCart(): Promise<Cart> {
  const existing = await getCart()
  if (existing) return existing

  const region_id = await getRegionId()
  const { cart } = await medusa.client.fetch<{ cart: Cart }>("/store/carts", {
    method: "POST",
    body: { region_id },
    headers: await getAuthHeaders(),
  })
  await setCartId(cart.id)
  return cart
}

export async function addLineItem(variantId: string, quantity = 1) {
  const cart = await getOrCreateCart()
  return medusa.client.fetch(`/store/carts/${cart.id}/line-items`, {
    method: "POST",
    body: { variant_id: variantId, quantity },
    headers: await getAuthHeaders(),
  })
}

export async function updateLineItem(lineId: string, quantity: number) {
  const id = await getCartId()
  if (!id) return
  return medusa.client.fetch(`/store/carts/${id}/line-items/${lineId}`, {
    method: "POST",
    body: { quantity },
    headers: await getAuthHeaders(),
  })
}

export async function removeLineItem(lineId: string) {
  const id = await getCartId()
  if (!id) return
  return medusa.client.fetch(`/store/carts/${id}/line-items/${lineId}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  })
}

export async function updateCart(body: Record<string, unknown>) {
  const cart = await getOrCreateCart()
  return medusa.client.fetch<{ cart: Cart }>(`/store/carts/${cart.id}`, {
    method: "POST",
    body,
    headers: await getAuthHeaders(),
  })
}

export async function listShippingOptions(cartId: string) {
  return medusa.client.fetch<{
    shipping_options: { id: string; name: string; amount: number }[]
  }>(`/store/shipping-options?cart_id=${cartId}`, {
    headers: await getAuthHeaders(),
  })
}

export async function addShippingMethod(cartId: string, optionId: string) {
  return medusa.client.fetch(`/store/carts/${cartId}/shipping-methods`, {
    method: "POST",
    body: { option_id: optionId },
    headers: await getAuthHeaders(),
  })
}

/** Creates the payment collection + session for the chosen provider. */
export async function initPaymentSession(cartId: string, providerId: string) {
  const { payment_collection } = await medusa.client.fetch<{
    payment_collection: { id: string }
  }>("/store/payment-collections", {
    method: "POST",
    body: { cart_id: cartId },
    headers: await getAuthHeaders(),
  })

  return medusa.client.fetch(
    `/store/payment-collections/${payment_collection.id}/payment-sessions`,
    {
      method: "POST",
      body: { provider_id: providerId },
      headers: await getAuthHeaders(),
    }
  )
}

export async function completeCart(cartId: string) {
  return medusa.client.fetch<{
    type: "order" | "cart"
    order?: { id: string }
    error?: { message: string }
  }>(`/store/carts/${cartId}/complete`, {
    method: "POST",
    headers: await getAuthHeaders(),
  })
}
