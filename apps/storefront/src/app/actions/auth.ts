"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import {
  authenticate,
  clearToken,
  createCustomer,
  refreshToken,
  registerIdentity,
  setToken,
} from "@/lib/auth"

export type AuthState = { error?: string } | undefined

const credentials = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
})

const signup = credentials.extend({
  first_name: z.string().trim().min(2, "Please enter your name."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a 10 digit mobile number.")
    .optional()
    .or(z.literal("")),
})

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const token = await authenticate(parsed.data.email, parsed.data.password)
    await setToken(token)
  } catch {
    return { error: "That email and password don't match." }
  }

  revalidatePath("/account")
  redirect("/account")
}

export async function register(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signup.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { email, password, first_name, phone } = parsed.data

  let token: string
  try {
    token = await registerIdentity(email, password)
  } catch {
    return { error: "That email is already registered. Try signing in." }
  }

  try {
    await createCustomer(token, {
      email,
      first_name,
      ...(phone ? { phone } : {}),
    })
    // Swap the registration token for one bound to the new customer.
    token = await refreshToken(token)
  } catch {
    return { error: "We couldn't finish creating your account." }
  }

  await setToken(token)
  revalidatePath("/account")
  redirect("/account")
}

export async function logout() {
  await clearToken()
  revalidatePath("/")
  redirect("/")
}
