import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Tells the Next.js storefront to drop its cached catalog pages whenever a
 * product changes, so shoppers never see a stale price.
 *
 * No-ops when STOREFRONT_URL / REVALIDATE_SECRET aren't configured, which is
 * the case in local development and CI.
 */
export default async function revalidateStorefront({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storefrontUrl = process.env.STOREFRONT_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!storefrontUrl || !secret) return

  let handle: string | undefined
  if (event.data?.id) {
    try {
      const productModuleService = container.resolve(Modules.PRODUCT)
      const product = await productModuleService.retrieveProduct(event.data.id)
      handle = product?.handle ?? undefined
    } catch {
      // deleted product — a broad revalidation still applies
    }
  }

  try {
    const res = await fetch(`${storefrontUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ handle, tags: ["products"] }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      logger.warn(
        `Storefront revalidation returned ${res.status} for ${event.name}`
      )
    }
  } catch (error) {
    // Never fail the originating operation because a cache purge failed.
    logger.warn(
      `Storefront revalidation failed for ${event.name}: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
}
