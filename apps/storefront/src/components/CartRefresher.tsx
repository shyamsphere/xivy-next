"use client"

import { useEffect } from "react"
import { notifyCartUpdated } from "@/lib/use-cart"

/**
 * Tells the header badge to refetch.
 *
 * Completing an order clears the cart cookie on the server, but the redirect
 * to the confirmation page is a client navigation, so the drawer's cached
 * state would otherwise keep showing the items that were just bought.
 */
export function CartRefresher() {
  useEffect(() => {
    notifyCartUpdated()
  }, [])
  return null
}
