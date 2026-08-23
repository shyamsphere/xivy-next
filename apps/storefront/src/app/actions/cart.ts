"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import {
  addLineItem,
  addShippingMethod,
  clearCartId,
  completeCart,
  getCart,
  getOrCreateCart,
  initPaymentSession,
  listShippingOptions,
  removeLineItem,
  updateCart,
  updateLineItem,
} from "@/lib/cart"

export type ActionState = { error?: string; ok?: boolean } | undefined

export async function addToCart(variantId: string, quantity = 1) {
  await addLineItem(variantId, quantity)
  revalidatePath("/cart")
}

export async function setLineQuantity(lineId: string, quantity: number) {
  if (quantity <= 0) {
    await removeLineItem(lineId)
  } else {
    await updateLineItem(lineId, quantity)
  }
  revalidatePath("/cart")
}

export async function removeLine(lineId: string) {
  await removeLineItem(lineId)
  revalidatePath("/cart")
}

// Indian address shape — the same rules the previous storefront enforced.
const addressSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  first_name: z.string().trim().min(2, "Please enter the delivery name."),
  last_name: z.string().trim().optional(),
  address_1: z.string().trim().min(8, "Please enter the full street address."),
  city: z.string().trim().min(2, "Please enter your city."),
  province: z.string().trim().min(2, "Please enter your state."),
  postal_code: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, "Enter a 6 digit PIN code."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a 10 digit mobile number."),
})

/** Saves the address, picks the only shipping option, and moves to payment. */
export async function saveDeliveryDetails(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = addressSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { email, ...address } = parsed.data
  const cart = await getOrCreateCart()

  if (!cart.items?.length) return { error: "Your cart is empty." }

  await updateCart({
    email,
    shipping_address: { ...address, country_code: "in" },
    billing_address: { ...address, country_code: "in" },
  })

  const { shipping_options } = await listShippingOptions(cart.id)
  const option = shipping_options[0]
  if (!option) {
    return { error: "We can't deliver to that address yet." }
  }
  await addShippingMethod(cart.id, option.id)

  revalidatePath("/checkout")
  return { ok: true }
}

/** Places a cash-on-delivery order via Medusa's manual payment provider. */
export async function placeCodOrder(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const cart = await getCart()
  if (!cart) return { error: "Your cart has expired. Please start again." }
  if (!cart.items?.length) return { error: "Your cart is empty." }
  if (!cart.shipping_address) return { error: "Add a delivery address first." }
  if (!cart.shipping_methods?.length) {
    return { error: "Choose a delivery method first." }
  }

  await initPaymentSession(cart.id, "pp_system_default")

  const result = await completeCart(cart.id)

  if (result.type !== "order" || !result.order) {
    return {
      error:
        result.error?.message ??
        "We couldn't place the order. Please try again.",
    }
  }

  await clearCartId()
  revalidatePath("/account/orders")
  redirect(`/order/confirmed/${result.order.id}`)
}
