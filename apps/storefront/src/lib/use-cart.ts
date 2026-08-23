"use client"

import { useCallback, useEffect, useState } from "react"

export type ClientCartItem = {
  id: string
  title: string
  subtitle: string | null
  thumbnail: string | null
  quantity: number
  unit_price: number
  handle: string | null
}

export type ClientCart = {
  id: string
  total: number
  item_subtotal: number
  items: ClientCartItem[]
  count: number
}

/** Fired after any cart mutation so every mounted consumer refetches. */
export const CART_UPDATED = "xivy:cart-updated"

export const notifyCartUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED))
  }
}

export function useCart() {
  const [cart, setCart] = useState<ClientCart | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" })
      const data = (await res.json()) as { cart: ClientCart | null }
      setCart(data.cart)
    } catch {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener(CART_UPDATED, refresh)
    return () => window.removeEventListener(CART_UPDATED, refresh)
  }, [refresh])

  return { cart, loading, refresh }
}
