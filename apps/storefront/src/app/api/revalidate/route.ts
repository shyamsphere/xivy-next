import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Cache invalidation hook called by the commerce backend when catalog data
 * changes, so cached pages don't serve stale prices or copy.
 *
 * Shared-secret authenticated: without REVALIDATE_SECRET set, the route
 * refuses every request rather than allowing unauthenticated purges.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "Revalidation is not configured." },
      { status: 503 }
    )
  }

  const provided =
    req.headers.get("x-revalidate-secret") ??
    req.nextUrl.searchParams.get("secret")

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { handle?: string; tags?: string[] } = {}
  try {
    body = await req.json()
  } catch {
    // an empty body means "revalidate the catalog broadly"
  }

  const revalidated: string[] = []

  for (const tag of body.tags ?? ["products"]) {
    revalidateTag(tag)
    revalidated.push(`tag:${tag}`)
  }

  revalidatePath("/")
  revalidatePath("/products")
  revalidated.push("/", "/products")

  if (body.handle) {
    revalidatePath(`/products/${body.handle}`)
    revalidated.push(`/products/${body.handle}`)
  }

  revalidatePath("/sitemap.xml")

  return NextResponse.json({ revalidated, now: Date.now() })
}
